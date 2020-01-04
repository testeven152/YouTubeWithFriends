'use strict';

$(function(){


    var localSessionId = null;
    var localUserId = null;
    var videoId = null;

    var connectionOptions =  {
        "force new connection" : true,
        "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
        "timeout" : 10000, //before connect_error and connect_timeout are emitted.
        "transports" : ["websocket"]
    };

    var socket = io('http://youtubewfriends.herokuapp.com/', connectionOptions);

    socket.on('connect', function() {
        console.log('Client connected')
    });

    socket.on('userId', function(data) {
        localUserId = data;
    });

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        videoId = tabs[0].url.split('=')[1];
        console.log('videoId is ', videoId);


        socket.on('play', function() {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: 'document.getElementsByTagName("video")[0].play();'});
        });

        socket.on('pause', function() {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: 'document.getElementsByTagName("video")[0].pause();'});
        });

        socket.on('sync', function(data) {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: 'document.getElementsByTagName("video")[0].currentTime = ' + data + ';'},
            )
        })

        var showError = function(err) {
            $('.error').removeClass('hidden');
            $('.no-error').addClass('hidden');
            $('#error-msg').html(err);
        };

        var showConnected = function(sessionId) {
            localSessionId = sessionId;
            $('.disconnected').hide();
            $('.loader').hide();
            $('.connected').show();
            $('#share-url').val(sessionId).focus().select();
        };

        var showDisconnected = function() {
            localSessionId = null;
            $('.disconnected').show();
            $('.loader').hide();
            $('.connected').hide();
        };

        var loading = function() {
            $('.disconnected').hide();
            $('.loader').show();
            $('.connected').hide();
        }

        $('.error').hide();
        showDisconnected();

        $('#create-session').click(function() {
            loading();
            socket.emit('createSession', localUserId, function(sessionId) {
                showConnected(sessionId);
            });
        });

        $('#join-session').click(function() {
            loading();
            if($('#join-id').val() != '') {
                var joinroomid = $('#join-id').val();
                socket.emit('joinSession', joinroomid, function(sessionId) {
                    if(sessionId == joinroomid) {
                        showConnected(sessionId);
                    } else {
                        showError("Invalid Session ID");
                    }
                });
            } 
        });

        $('#leave-session').click(function() {
            loading();
            socket.emit('leaveSession', null, function(){});
            showDisconnected();
        })

        $('#play-btn').click(function() {
            socket.emit('videocontrol', 'play', function(){});
        });

        $('#pause-btn').click(function() {
            socket.emit('videocontrol', 'pause', function(){});
        });

        $('#sync-btn').click(function() {
            let time = 0;
            let getText = Array();
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: 'document.getElementsByTagName("video")[0].currentTime;'},
                function (result) {
                    time = Number(result);
                }
            )
            socket.emit('sync', time, function(){});
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
    
    });
});