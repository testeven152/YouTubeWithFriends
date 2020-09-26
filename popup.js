'use strict';

$(function(){

    // ----------------------------------- Local Variables -----------------------------------

    var videoId = null;
    var shareurl = null;
    var ywfid = null;
    var hasywfsession = null;
    var userAvatar = null;
    var masterUser = null;
    var darkMode = false;

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

            let segments = url.split('&');

            for (var i = 0; i < segments.length; i++) {

                let segment = segments[i].split('=');

                if (segment.length == 2 && segment[0] == 'ywf') {
                    return segment[1];
                }
            }
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
        $('.connected').height(140);
    }

    var showChat = function() {
        $('.container').show();
        $('.connected').height(490);
        $('.settings').hide()
        $('.party-room').hide()
        $('#exit-settings-icon').hide()
        $('#settings-icon').show()


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


    var showSettings = function() {
        $('.container').hide()
        $('.settings').show()
        $('.connected').height(490)
        $('#hide-log-btn').css({ top: '315px' })
        $('#exit-settings-icon').show()
        $('#settings-icon').hide()
        $('.party-room').show()

    }

    var showConnected = function(url, chatenabled = false) {
        $('.no-error').show();
        $('.disconnected').hide();
        $('.connected').show();
        $('.error').hide();
        $('.loading').hide();
        $('#show-log-btn').show();
        $('#share-url').val(url);


        showChat();



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

    var toggleDarkMode = function(darkMode) {

        if (darkMode) {
            $('body').css({ 'background-color': '#282828' })

            $('.title').css({ 'background-color': '#282828' });
            $('.title h2').css({ color: 'white'});
            $('.disconnected').css({ color: 'white', background: '#1F1F1F'})
            $('.connected').css({ background: '#1F1F1F'})
            $('.settings').css({ color: 'white' })

            $('#copy-unclicked-img').attr("src", "/images/CopyButton_Unclicked_Dark.svg")
            $('#copy-clicked-img').attr("src", "/images/CopyButton_Clicked_Dark.svg")
            $('#settings-icon').attr("src", "/images/settings-icon-dark.svg")
            $('#exit-settings-icon').attr("src", "/images/exit-dark.svg")


            $('#share-url').css({ 'background-color': '#1F1F1F', 'border-color': '#303030' })
            $('#leave-session').css({ 'background-color': '#1F1F1F', 'border-color': '#303030'})
            $('.change-username input').css({ 'color': 'white', 'background-color': '#1F1F1F', 'border-color': '#303030'})
            $('.send-message input').css({ 'color': 'white', 'background-color': '#1F1F1F', 'border-color': '#303030'})

            $('.container').css({ 'color': 'white' })

            if (!$('dark-mode-toggle').is(':checked')) {
                $('#dark-mode-toggle').attr('checked', 'checked')
            }
        }
        else {
            $('body').css({ 'background-color': 'white' })

            $('.title').css({ 'background-color': 'white' });
            $('.title h2').css({ color: 'black'});
            $('.disconnected').css({ color: 'black', background: '#F9F9F9'})
            $('.connected').css({ background: '#F9F9F9'})
            $('.settings').css({ color: 'black' })

            $('#copy-unclicked-img').attr("src", "/images/CopyButton_Unclicked.svg")
            $('#copy-clicked-img').attr("src", "/images/CopyButton_Clicked.svg")
            $('#settings-icon').attr("src", "/images/settings-icon.svg")
            $('#exit-settings-icon').attr("src", "/images/exit.svg")

            $('#share-url').css({ 'background-color': '#F9F9F9', 'border-color': '#C7C7C7' })
            $('#leave-session').css({ 'background-color': '#F9F9F9', 'border-color': '#C7C7C7' })
            $('.change-username input').css({ 'color': 'black', 'background-color': '#F9F9F9', 'border-color': '#C7C7C7' })
            $('.send-message input').css({ 'color': 'black', 'background-color': '#F9F9F9', 'border-color': '#C7C7C7' })

            $('.container').css({ 'color': 'black' })
        }

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

    var remove_html_tags = function(string) {
        if (string == null || string == '') {
            return false;
        }

        return string.replace(/<[^>]*>/g, '');
    }


    var stripAvatar = function(avatar) {
        let newAvatar = avatar.replace(/[\W_]+/g,"")
        return newAvatar
    }

    var addAvatar = function(avatar) {
        let user = '<p id="' + stripAvatar(avatar) + '"><i>' + avatar + '</i></p>'
        $(user).appendTo('.party-container')
    }

    var removeAvatar = function(avatar) {
        let id = "#" + stripAvatar(avatar);
        $(id).remove()
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

    var addMessage = function(avatar, type, message) {
        if (type == "createjoinleave") {
            let chatmessage = '<p id="lighten"><i><b>' + avatar + '</b> ' + message + '</i></p>'
            $(chatmessage).appendTo('.chat-container')
        }
        else if (type == "message") {
            let chatmessage = '<p><b>' + avatar + '</b>: ' + message + '</p>'
            $(chatmessage).appendTo('.chat-container')
        }
        else if (type == "avatar") {
            let chatmessage = '<p id="lighten"><i><b>' + avatar + '</b> changed name to <b>' + message + '</b>.</i></p>'
            $(chatmessage).appendTo('.chat-container')
        }

        chatcontainer.scrollTop = chatcontainer.scrollHeight
        
    }

    var appendMessagesToConsole = function(messages) {
        if(messages.length == 0 || messages == null) {
            return false;
        }

        for(var i = 0; i < messages.length; i++) {
            addMessage(messages[i].avatar, messages[i].type, messages[i].text)
        }

        return true;

    }

    var setMasterUser = function(masterUser = null) {

        if (masterUser == null || masterUser == "") {
            $('#master-user').html("<b>Master Control</b>: No")
        }
        else {
            $('#master-user').html("<b>Master Control</b>: " + masterUser)
        }

    }

    var setCurrentUsername = function(username = null) {

        if (username == null) {
            $('#current-username').html("Username:")
        }
        else {
            $('#current-username').html("Username: <i>" + username + "</i>");
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


    $('.send-message').on('submit', function(event) {
        event.preventDefault();
        let chatMessage = remove_html_tags($('#message-input').val());
        if (chatMessage != '') {
            sendMessage('chat-message', { message: chatMessage }, function(response) {
                $('#message-input').val('');
            })
        }

      });

    $('.change-username').on('submit', function(event) {
        event.preventDefault();
        let changeUsername = $('#change-username-input').val().trim(); // need to check if valid username
        changeUsername = remove_html_tags(changeUsername)
        if (changeUsername != '' && isValidUsername(changeUsername)) {
            sendMessage('change-username', { username: changeUsername }, function(response) {
                setCurrentUsername(changeUsername);
                userAvatar = changeUsername;
                $('#change-username-input').val('');
                chrome.storage.sync.set({ 'avatar': changeUsername }, function(response) { console.log("Avatar saved to sync storage") })
            })
        } else {
            $('#change-username-input').val('');
        }
    })

    $('#settings-icon').click(function() {
        showSettings();
    })

    $('#exit-settings-icon').click(function() {
        showChat();
    })

    $('#see-party').click(function() {
        showSettings();
    })

    $('#go-back-chat').click(function() {
        showChat();
    })

    $('#dark-mode-toggle').click(function() {

        toggleDarkMode($(this).is(':checked'))

        sendMessage('dark-mode', { darkMode: $(this).is(':checked') }, function(response) {})
    })


    // ---------------------------------------------------------------------------------------------------------


    chrome.runtime.onMessage.addListener(function(request, sender, response) {
        if (request.type == "test") {
            console.log(request.data);
        }
        else if (request.type == "message") {
            addMessage(request.data.avatar, request.data.type, request.data.text)
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

    toggleDarkMode(darkMode);

    // sends initial data
    sendMessage('sendInitData', { videoId: videoId }, function(response) {
        
        // console.log("videoId = " + videoId);
        // console.log("response.sessionId = " + response.sessionId);
        // console.log("hasywfsession = " + hasywfsession);

        console.log(response.darkMode)

        darkMode = response.darkMode
        toggleDarkMode(response.darkMode);

        // if (response.darkMode) {
        //     $('#dark-mode-toggle').attr('checked', 'checked')
        // }



        if(response.sessionId) {
            var shareurl = "https://www.youtube.com/watch?v=" + videoId + "&ywf=" + response.sessionId;
            userAvatar = response.avatar;
            appendMessagesToConsole(response.messages);
            appendAvatarsToConsole(response.avatars);
            showConnected(shareurl);
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
                    showConnected(shareurl);
                    // appendMessagesToConsole(response.messages)
                    appendAvatarsToConsole(response.avatars)
                    removeAvatar(response.avatar) // for now, remove duplicate
                    setMasterUser(response.masterUser)
                    setCurrentUsername(response.avatar)
                } 
            })
        } 
        else if (response.errorMessage) {
            showError(response.errorMessage);
        }
        else {
            showDisconnected();
        }

    });


});