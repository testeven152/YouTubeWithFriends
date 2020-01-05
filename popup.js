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
            let urlwithywf = 'https://www.youtube.com/watch?v=' + videoId + '&ywf=' + sessionId;
            $('.disconnected').hide();
            $('.loader').hide();
            $('.connected').show();
            $('#share-url').val(urlwithywf).focus().select();
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

        var hasywfsession = tabs[0].url.includes('&ywf=');
        var baseurl = null;

        if(hasywfsession) {

            var baseurl = tabs[0].url.split('&')[0];
            var ywf = tabs[0].url.split('&')[1];
            videoId = baseurl.split('=')[1];

            ywf = ywf.split('=')[1];

            loading();
            socket.emit('joinSession', ywf, function(sessionId) {
                if(sessionId == ywf) {
                    showConnected(sessionId);
                } else {
                    showError("Invalid Session ID");
                }
            })


        } else {
            baseurl = tabs[0].url;
            videoId = baseurl.split('=')[1];
        }

                
        console.log('videoId is ', videoId);

        $('#create-session').click(function() {
            loading();
            socket.emit('createSession', localUserId, function(sessionId) {
                showConnected(sessionId);
            });
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