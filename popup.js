'use strict';

$(function(){

    // ----------------------------------- Local Variables -----------------------------------

    var videoId = null;
    var shareurl = null;
    var ywfid = null;
    var hasywfsession = null;

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        hasywfsession = tabs[0].url.includes('&ywf=');

        if(hasywfsession) {

            // https://www.youtube.com/watch?v=NJ7djRRZr_4&ywf=b32fcb277112b555
    
            var baseurl = tabs[0].url.split('&')[0];
            ywfid = tabs[0].url.split('&')[1];
            videoId = baseurl.split('=')[1];
            var ywfarray = ywfid.split('=');
            ywfid = ywfarray[ywfarray.length - 1]

            shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + ywfid;
    
            
        } else {

            var baseurl = tabs[0].url
            videoId = baseurl.split('=')[1];
        }

        console.log("YWF ID: " + ywfid);
        console.log("Video ID: " + videoId);
        console.log("Share URL: " + shareurl);


    })

    // ---------------------------------------------------------------------------------------------------------


    // ----------------------------------- Popup Views -----------------------------------

    var showError = function(err) {
        $('.error').removeClass('hidden');
        $('.no-error').addClass('hidden');
        $('.disconnected').hide();
        $('.connected').hide();
        $('#error-msg').html(err);
    };

    var showConnected = function(sessionId) {
        $('.disconnected').hide();
        $('.connected').show();
        $('.error').hide();
        $('#share-url').val(sessionId).focus().select();
    };

    var showDisconnected = function() {
        $('.disconnected').show();
        $('.connected').hide();
        $('.error').hide();
    };



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
        sendMessage('create-session', { videoId: videoId }, function(response){
            ywfid = response.sessionId;
            shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + ywfid;
            showConnected(shareurl);
        });
    });

    $('#leave-session').click(function() {
        console.log('leave-session button clicked on');
        sendMessage('leave-session', {}, function() {
            showDisconnected();
        });
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
        showDisconnected();
    });


    $('#play-pause-button').click(function() {
        console.log('play-pause-button clicked on');
        sendMessage('play-pause', {}, function(){

        });
    })

    $('#sync-button').click(function() {
        console.log('sync-button clicked on');
        sendMessage('sync', {}, function(){

        });
    })

    // ---------------------------------------------------------------------------------------------------------


    // sends initial data
    sendMessage('sendInitData', { videoId: videoId }, function(response) {
        
        if(response.sessionId) {
            var shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + response.sessionId;
            showConnected(shareurl);
        }
        else if (hasywfsession && !response.sessionId) {
            sendMessage('join-session', { sessionId: ywfid, videoId: videoId }, function(response) {
                if (response.sessionId == ywfid) {
                    var shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + response.sessionId;
                    showConnected(shareurl);
                } else {
                    showError("Invalid Session");
                }
            })
        } else {
            showDisconnected();
        }

    });


});