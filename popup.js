'use strict';

$(function(){

    var getURLParameter = function(url, key) {
        var searchString = '?' + url.split('?')[1];
        if (searchString === undefined) {
          return null;
        }
        var escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var regex = new RegExp('[?|&]' + escapedKey + '=' + '([^&]*)(&|$)');
        var match = regex.exec(searchString);
        if (match === null) {
          return null;
        }
        return decodeURIComponent(match[1]);
      };

    chrome.tabs.query({
        active: true,
        currentWindow: true 
    }, function(tabs){

        var showError = function(err) {
            $('.error').show();
            $('.no-error').hide();
            $('#error-msg').html(err);
        };

        $('#close-error').click(function(){
            $('.error').hide();
            $('.no-error').show();
        });

        var startSpinning = function() {
            $('#control-lock').prop('disabled', true);
            $('#create-session').prop('disabled', true);
            $('#leave-session').prop('disabled', true);
        };

        var stopSpinning = function() {
            $('#control-lock').prop('disabled', false);
            $('#create-session').prop('disabled', false);
            $('#leave-session').prop('disabled', false);
        };

        var sendMessage = function(type, data, callback) {
            startSpinning();
            chrome.tabs.executeScript(tabs[0].id, {
                file: 'content_script.js'
            }, function() {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: type,
                    data: data
                }, function(response) {
                    stopSpinning();
                    if (callback) {
                        callback(response);
                    }
                });
            });
        };

        var showconnected = function(sessionId){
            var urlwithsessionid = tabs[0].url[0] + '&ywpid=' + encodeURIComponent(sessionId);
            $('.connected').show();
            $('.disconnected').hide();
            $('#share-url').val(urlWithSessionId).focus().select();
        };

        var showdisconnected = function(){
            $('.disconnected').show();
            $('.connected').hide();
            $('#control-lock').prop('checked', false);
        };

        sendMessage('getInitData', { version: chrome.app.getDetails().version },
        function(initData) {

            $('.error').hide();
            $('.connected').hide();
            $('.disconnected').show();


            $('#create-session').click(function(){
                sendMessage('createSession', {}, function(response){
                    showconnnected();
                })
                
            });

            $('#leave-session').click(function(){
                sendMessage('leaveSession', {}, function(response) {
                    showdisconnected();
                })
            });

            $('#share-url').click(function(e){
                e.stopPropagation();
                e.preventDefault();
                $('#share-url').select();
            });

            $('#copy-btn').click(function(e){
                e.stopPropagation();
                e.preventDefault();
                $('#share-url').select();
                document.execCommand('copy');
            });
        });
    
    
        });

    



});