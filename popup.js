'use strict';

$(function(){

    // ----------------------------------- Local Variables -----------------------------------

    var videoId = null;
    var shareurl = null;
    var ywfid = null;
    var hasywfsession = null;
    var userAvatar = null;

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        hasywfsession = tabs[0].url.includes('&ywf=');

        if(hasywfsession) {

            // https://www.youtube.com/watch?v=NJ7djRRZr_4&ywf=b32fcb277112b555

            let spliturl = tabs[0].url.split('&')
    
            var baseurl = spliturl[0];
            ywfid = spliturl[spliturl.length - 1];
            videoId = baseurl.split('=')[1];
            var ywfarray = ywfid.split('=');
            ywfid = ywfarray[ywfarray.length - 1]


            shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + ywfid;
    
            
        } else {

            var baseurl = tabs[0].url
            videoId = baseurl.split('=')[1];
            videoId = videoId.split('&')[0];
        }

        console.log("YWF ID: " + ywfid);
        console.log("Video ID: " + videoId);
        console.log("Share URL: " + shareurl);


    })

    // ---------------------------------------------------------------------------------------------------------


    // ----------------------------------- Popup Views -----------------------------------

    var showError = function(err) {
        $('.error').show();
        $('.no-error').hide();
        $('.disconnected').hide();
        $('.connected').hide();
        $('#error-msg').html(err);
    };


    var showChat = function() {
        $('#show-log-btn').hide()
        $('.log-console').show();
        $('.connected').height(405);
    }

    var hideChat = function() {
        $('#show-log-btn').show();
        $('.log-console').hide();
        $('.connected').height(100);
    }

    var showConnected = function(url, chatenabled = false) {
        $('.no-error').show();
        $('.disconnected').hide();
        $('.connected').show();
        $('.error').hide();
        $('#show-log-btn').show();
        $('#share-url').val(url);

        if (chatenabled == true) {
            showChat();
        } else {
            hideChat();
        }
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

    var appendMessagesToConsole = function(messages) {
        if(messages.length == 0 || messages == null) {
            return false;
        }

        for(var i = 0; i < messages.length; i++) {
            var message = $('.message').first().clone()
            message.find('p').text(messages[i])
            message.prependTo('.chat-container')
        }
    }

    // ---------------------------------------------------------------------------------------------------------


    // ----------------------------------- Button Actions -----------------------------------

    $('#create-session').click(function() {
        console.log('create-session button clicked on.');
        sendMessage('create-session', { videoId: videoId }, function(response){
            ywfid = response.sessionId;
            if (ywfid != null) {
                shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + ywfid;
                showConnected(shareurl);
            } else {
                showError("Undefined Session");
            }

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
        $('.no-error').show();
        showDisconnected();
    });

    $('#show-log-btn').click(function() {
        showChat();
        sendMessage('open-chat', { setChatEnabled: true }, function() {})
    })

    $('#hide-log-btn').click(function() {
        hideChat();
        sendMessage('open-chat', { setChatEnabled: false }, function() {})
    })

    $('form').on('submit', function(event) {
        event.preventDefault();
        let message = $('.message').first().clone();
        let chatMessage = $('#message-input').val();
        if (chatMessage != '') {
            sendMessage('chat-message', { message: chatMessage }, function(response) {
                $('#message-input').val('');
            })
        }

      });


    // $('#play-pause-button').click(function() {
    //     console.log('play-pause-button clicked on');
    //     sendMessage('play-pause', {}, function(){

    //     });
    // })

    // $('#sync-button').click(function() {
    //     console.log('sync-button clicked on');
    //     sendMessage('sync', {}, function(){

    //     });
    // })

    // ---------------------------------------------------------------------------------------------------------


    chrome.runtime.onMessage.addListener(function(request, sender, response) {
        if (request.type == "test") {
            console.log(request.data);
        }
        else if (request.type == "message") {
            console.log(request.data)
            var message = $('.message').first().clone()
            message.find('p').text(request.data)
            message.prependTo('.chat-container')
        }
    })

    showDisconnected();

    // sends initial data
    sendMessage('sendInitData', { videoId: videoId }, function(response) {
        
        // console.log("videoId = " + videoId);
        // console.log("response.sessionId = " + response.sessionId);
        // console.log("hasywfsession = " + hasywfsession);
        if(response.sessionId) {
            var shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + response.sessionId;
            userAvatar = response.avatar;
            appendMessagesToConsole(response.messages);
            showConnected(shareurl, response.chatEnabled);
        }
        // if content_script doesnt have an existing session and link has ywfid, try to join session
        else if (hasywfsession && !response.sessionId) { 
            sendMessage('join-session', { sessionId: ywfid, videoId: videoId }, function(response) {
                if (response.errorMessage) {
                    console.log(response.errorMessage)
                    showError(response.errorMessage)
                }
                else {
                    var shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + response.sessionId;
                    userAvatar = response.avatar;
                    showConnected(shareurl, false);
                    appendMessagesToConsole(response.messages)
                } 
            })
        } 
        else {
            showDisconnected();
        }

    });


});