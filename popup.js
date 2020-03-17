'use strict';

$(function(){

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
                }, callback);
            })
        })
    }

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
    showDisconnected();

    $('#create-session').click(function() {
        console.log('create-session button clicked on.');
        showConnected();
        sendMessage('create-session', {}, function(){});
    });

    $('#leave-session').click(function() {
        console.log('leave-session button clicked on');
        showDisconnected();
        sendMessage('leave-session', {}, function(){});
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

    sendMessage('sendInitData', {});


});