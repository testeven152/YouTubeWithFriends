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
                {code: "document.getElementsById('" + videoId + "')[0].play()"});
        });

        socket.on('pause', function() {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: "document.getElementsById('" + videoId + "')[0].pause()"});
        });

        var showError = function(err) {
            $('.error').removeClass('hidden');
            $('.no-error').addClass('hidden');
            $('#error-msg').html(err);
        };

        var showConnected = function(sessionId) {
            localSessionId = sessionId;
            $('.disconnected').hide();
            $('.connected').show();
            $('#share-url').val(sessionId).focus().select();
        };

        var showDisconnected = function() {
            localSessionId = null;
            $('.disconnected').show();
            $('.connected').hide();
        };

        $('.error').hide();
        showDisconnected();

        $('#create-session').click(function() {
            socket.emit('createSession', videoId, function(sessionId) {
                showConnected(sessionId);
            });
        });

        $('#join-session').click(function() {
            if($('#join-id').val() == '') {
                // do nothing
            } else {
                var joinroomid = $('#join-id').val();
                socket.emit('joinSession', joinroomid, function() {
                    showConnected(joinroomid);
                });
            }
        });

        $('#leave-session').click(function() {
            socket.emit('leaveSession', null, function(){
                localSessionId = null;
                localUserId = null;
                showDisconnected();
            });
        });

        $('#play-btn').click(function() {
            socket.emit('playbtn', localSessionId, function(){});
        });

        $('#pause-btn').click(function() {
            socket.emit('pausebtn', localSessionId, function(){});
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