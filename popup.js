'use strict';

$(function(){

    var localSessionId = null;
    var localUserId = null;

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


        socket.on('playpause', function() {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: "document.getElementsById('" + videoId + "')[0].play()"});
        });

        socket.on('pause', function() {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: "document.getElementsById('" + videoId + "')[0].pause()"});
        });

        socket.on('sync', function() {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: "document.getElementsById('" + videoId + "')[0].load()"});
        });

        var videoId = null;

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
            socket.emit('createSession', videoId, function(sessionId) {
                localSessionId = sessionId;
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
            socket.emit('playbtn', null, function() {

            });
        });

        $('#pause-btn').click(function() {
            socket.emit('pausebtn', null, function() {

            });
        });


        $('#sync-btn').click(function() {
            socket.emit('syncbutton', null, function() {

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
        });
    
    });
});