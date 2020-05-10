'use strict';

$(function(){

    // ----------------------------------- Local Variables -----------------------------------

    var videoId = null;
    var shareurl = null;
    var ywfid = null;
    var hasywfsession = null;
    var userAvatar = null;
    var masterUser = null;

    var numUsers = 0;

    const chatcontainer = document.getElementById('chat')

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        var getVideoIdFromUrl = function(url) {
            let videoId = url.split('=')[1]
            videoId = videoId.split('&')[0]
            return videoId
        }
    
        var getYWFIdFromUrl = function(url) {
            let id = url.split('&')
            id = id[id.length - 1]
            id = id.split('=')
            id = id[id.length - 1]
            return id
        }

        hasywfsession = tabs[0].url.includes('&ywf=');

        if(hasywfsession) {

            // https://www.youtube.com/watch?v=NJ7djRRZr_4&ywf=b32fcb277112b555

            // let spliturl = tabs[0].url.split('&')
    
            // var baseurl = spliturl[0];
            // ywfid = spliturl[spliturl.length - 1];
            // videoId = baseurl.split('=')[1];
            // var ywfarray = ywfid.split('=');
            // ywfid = ywfarray[ywfarray.length - 1]

            videoId = getVideoIdFromUrl(tabs[0].url)
            ywfid = getYWFIdFromUrl(tabs[0].url)

            shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + ywfid;
    
            
        } else {

            // var baseurl = tabs[0].url
            // videoId = baseurl.split('=')[1];
            // videoId = videoId.split('&')[0];
            videoId = getVideoIdFromUrl(tabs[0].url)

        }

        console.log("YWF ID: " + ywfid);
        console.log("Video ID: " + videoId);
        console.log("Share URL: " + shareurl);

        console.log("Test: %s == %s = %s ", getVideoIdFromUrl(tabs[0].url), videoId, (getVideoIdFromUrl(tabs[0].url) == videoId))
        console.log("Test: %s == %s = %s ", getYWFIdFromUrl(tabs[0].url), ywfid, (getYWFIdFromUrl(tabs[0].url) == ywfid))

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

    var hideLogConsole = function() {
        $('#show-log-btn').show();
        $('.log-console').hide();
        $('.connected').height(156);
    }

    var showChat = function() {
        $('#show-log-btn').hide()
        $('.container').show();
        $('.connected').height(490);
        $('.settings').hide()
        $('.party-room').hide()
        $('#hide-log-btn').css({ top: '513px' })

        $('#settings-icon-clicked').hide()
        $('#settings-icon').show()
        $('#chat-icon-clicked').show()
        $('#chat-icon').hide()
        $('#party-icon-clicked').hide()
        $('#party-icon').show()


        chatcontainer.scrollTop = chatcontainer.scrollHeight
        
    }

    // var showQueue = function() {
    //     $('#show-log-btn').hide()
    //     $('.connected').height(490);
    //     $('.container').hide()
    //     $('.settings').hide()
    //     $('.queue').show()
    //     $('#hide-log-btn').css({ top: '365px' })
    //     $('#settings-icon-clicked').hide()
    //     $('#settings-icon').show()
    //     $('#chat-icon-clicked').hide()
    //     $('#chat-icon').show()
    //     $('#party-icon-clicked').show()
    //     $('#party-icon').hide()

    //     $('#hide-log-btn').css({ top: '513px' })

    // }

    var showParty = function() {
        $('#show-log-btn').hide()
        $('.connected').height(490);
        $('.container').hide()
        $('.settings').hide()
        $('.party-room').show()
        $('#hide-log-btn').css({ top: '365px' })
        $('#settings-icon-clicked').hide()
        $('#settings-icon').show()
        $('#chat-icon-clicked').hide()
        $('#chat-icon').show()
        $('#party-icon-clicked').show()
        $('#party-icon').hide()

        $('#hide-log-btn').css({ top: '513px' })

    }

    var showSettings = function() {
        $('.container').hide()
        $('.settings').show()
        $('.party-room').hide()
        $('.connected').height(345)
        $('#hide-log-btn').css({ top: '368px' })
        $('#settings-icon-clicked').show()
        $('#settings-icon').hide()
        $('#chat-icon-clicked').hide()
        $('#chat-icon').show()
        $('#party-icon-clicked').hide()
        $('#party-icon').show()

    }

    var showConnected = function(url, chatenabled = false) {
        $('.no-error').show();
        $('.disconnected').hide();
        $('.connected').show();
        $('.error').hide();
        $('.loading').hide();
        $('#show-log-btn').show();
        $('#share-url').val(url);
        

        if (chatenabled == true) {
            showChat();
        } else {
            hideLogConsole();
        }
    };

    var showDisconnected = function() {
        $('.disconnected').show();
        $('.connected').hide();
        $('.error').hide();
        $('.loading').hide();
        $('#control-lock').prop("checked", false);
    };

    var showLoading = function() {
        $('.disconnected').hide();
        $('.connected').hide();
        $('.loading').show();
    }


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
            message.appendTo('.chat-container')
        }

        return true;

    }

    var stripAvatar = function(avatar) {
        let newAvatar = avatar.replace(/[\W_]+/g,"")
        return newAvatar
    }

    var addAvatar = function(avatar) {
        let user = '<p id="' + stripAvatar(avatar) + '">' + avatar + '</p>'
        $(user).appendTo('.party-container')
        numUsers++
        $('#party-count').text("Number of users in party: " + numUsers)
    }

    var removeAvatar = function(avatar) {
        let id = "#" + stripAvatar(avatar);
        $(id).remove();
        numUsers--
        $('#party-count').text("Number of users in party: " + numUsers)
    }

    var appendAvatarsToConsole = function(avatars) {
        if(avatars.length == 0 || avatars == null) {
            return false;
        }

        for(var i = 0; i < avatars.length; i++) {
            addAvatar(avatars[i])
        }


        return true;
    }

    var setMasterUser = function(masterUser = null) {

        if (masterUser == null || masterUser == "") {
            $('#master-user').text("Master Control: No")
        }
        else {
            $('#master-user').text("Master Control: " + masterUser)
        }

    }

    var setCurrentUsername = function(username = null) {

        if (username == null) {
            $('#current-username').text("Username :")
        }
        else {
            $('#current-username').text("Current Username: " + username);
        }

    }

    var isValidUsername =  function(username) {
        // need to implement this...

        if (username.trim() == '') {
            return false;
        }

        let invalidChars = "~/"

        // for (var i = 0; i < username.length; i++) {
        //     if (username.charAt(i) in invalidChars) {
        //         return false;
        //     }
        // }

        return true;
    }

    // ---------------------------------------------------------------------------------------------------------


    // ----------------------------------- Button Actions -----------------------------------

    $('#create-session').click(function() {
        console.log('create-session button clicked on.');
        showLoading();
        sendMessage('create-session', { videoId: videoId, controlLock: $('#control-lock').is(':checked') }, function(response){
            if (response.errorMessage) {
                showError("Error: " + response.errorMessage)
            } else {
                shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + response.sessionId
                userAvatar = response.avatar
                showConnected(shareurl)
                setMasterUser(response.masterUser)
                setCurrentUsername(response.avatar)
            }
        });
    });

    $('#leave-session').click(function() {
        console.log('leave-session button clicked on'); 
        showLoading();
        sendMessage('leave-session', {}, function() {
            showDisconnected();
            removeAvatar(userAvatar)
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
        $('.log-console').show();
        showChat();
        sendMessage('open-chat', { setChatEnabled: true }, function() {})
    })

    $('#hide-log-btn').click(function() {
        hideLogConsole();
        sendMessage('open-chat', { setChatEnabled: false }, function() {})
    })

    $('.send-message').on('submit', function(event) {
        event.preventDefault();
        let chatMessage = $('#message-input').val();
        if (chatMessage != '') {
            sendMessage('chat-message', { message: chatMessage }, function(response) {
                $('#message-input').val('');
            })
        }

      });

    $('.change-username').on('submit', function(event) {
        event.preventDefault();
        let changeUsername = $('#change-username-input').val(); // need to check if valid username
        if (changeUsername != '' && isValidUsername(changeUsername)) {
            sendMessage('change-username', { username: changeUsername }, function(response) {
                setCurrentUsername(changeUsername);
                userAvatar = changeUsername;
                $('#change-username-input').val('');
                chrome.storage.sync.set({ avatar: changeUsername }, function() { console.log("Avatar saved to sync storage") })
            })
        } else {
            $('#change-username-input').val('');
        }
    })

    $('#chat-icon').click(function() {
        showChat();
    })

    $('#party-icon').click(function() {
        showParty();
    })

    $('#settings-icon').click(function() {
        showSettings();
    })

    // $('#queue-icon').click(function() {
    //     showQueue();
    // })


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
            message.appendTo('.chat-container')
            chatcontainer.scrollTop = chatcontainer.scrollHeight
        }
        else if (request.type == "avatar") {
            console.log("Retrieved avatar: %s", request.data)
            userAvatar = request.data
            setCurrentUsername(request.data)
        }
        else if (request.type == "new-master") {
            console.log("New Master User: %s", request.data)
            masterUser = request.data
            setMasterUser(request.data)
        }
        else if (request.type == "new-avatar") {
            console.log("%s %s the party.", request.data.avatar, request.data.type)

            if (request.data.type == "joined" || request.data.type == "created") {
                addAvatar(request.data.avatar)
            } 
            else if (request.data.type == "left") {
                removeAvatar(request.data.avatar)
            }
            
        }
        else if (request.type == "avatar-update") {
            console.log("Avatar %s changed name to %s", request.data.oldAvatar, request.data.newAvatar)
            removeAvatar(request.data.oldAvatar)
            addAvatar(request.data.newAvatar)
        }
        else if (request.type == "error") {
            console.log("Error received: %s", request.data.errorMessage)
            showError(request.data.errorMessage)
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
            appendAvatarsToConsole(response.avatars);
            showConnected(shareurl, response.chatEnabled);
            setMasterUser(response.masterUser)
            setCurrentUsername(response.avatar)
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
                    // appendMessagesToConsole(response.messages)
                    appendAvatarsToConsole(response.avatars)
                    removeAvatar(response.avatar) // for now, remove duplicate
                    setMasterUser(response.masterUser)
                    setCurrentUsername(response.avatar)
                } 
            })
        } 
        else {
            showDisconnected();
        }

    });


});