'use strict';

$(function(){

    // ----------------------------------- Local Variables -----------------------------------

    var videoId = null;
    var baseurl = null;
    var ywfid = null;
    var hasywfsession = null;

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        var hasywfsession = tabs[0].url.includes('&ywf=');

        if(hasywfsession) {
    
            var baseurl = tabs[0].url.split('&')[0];
            var ywfid = tabs[0].url.split('&')[1];
            videoId = baseurl.split('=')[1];
            ywfid = ywfid.split('=')[1];
    
            
        } else {
            baseurl = tabs[0].url;
            videoId = baseurl.split('=')[1];
        }

    })

    // ---------------------------------------------------------------------------------------------------------


    // ----------------------------------- Popup Views -----------------------------------

    var showError = function(err) {
        $('.error').removeClass('hidden');
        $('.no-error').addClass('hidden');
        $('#error-msg').html(err);
    };

    var showConnected = function(sessionId) {
        $('.disconnected').hide();
        $('.connected').show();
        $('#share-url').val(sessionId).focus().select();
    };

    var showDisconnected = function() {
        $('.disconnected').show();
        $('.connected').hide();
    };

    $('.error').hide();
    // showDisconnected();

    // ---------------------------------------------------------------------------------------------------------

    // ----------------------------------- Functions -----------------------------------


    var sendMessage = function(type, data, callback) {
        console.log("Sending message " + type);
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {
                file: 'content_script.js'
            }, function() {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: type,
                    data: data
                }, function(response) {
                    if(callback) {
                        callback(response);
                    }
                });
            })
        })
    }


    // ---------------------------------------------------------------------------------------------------------


    // ----------------------------------- Button Actions -----------------------------------

    $('#create-session').click(function() {
        console.log('create-session button clicked on.');
        sendMessage('create-session', {}, function(response){
            showConnected(response.sessionId);
        });
    });

    $('#leave-session').click(function() {
        console.log('leave-session button clicked on');
        sendMessage('leave-session', {}, function() {
        });
        showDisconnected(); // for some reason doesnt work inside..
    });

    $('#share-url').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#share-url').select();
    });

    $('#copy-btn').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#share-url').select();
        document.execCommand('copy');
    });

    $('#close-error').click(function() {
        $('.no-error').removeClass('hidden');
        $('.error').addClass('hidden');
    });

    // ---------------------------------------------------------------------------------------------------------


    // sends initial data
    sendMessage('sendInitData', {}, function(response) {
        if(response.sessionId) {
            showConnected(response.sessionId);
        }
        else if (hasywfsession) {
            sendMessage('join-session', { sessionId: ywfid }, function(response) {
                if (response.sessionId == ywfid) {
                    showConnected(response.sessionId);
                } else {
                    showError("Invalid Session");
                }
            })
        } else {
            showDisconnected();
        }

    });


});