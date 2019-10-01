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

    socket.on('playpause', function() {

    });

    socket.on('sync', function() {

    });

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        

        var showError = function(err) {
            $('.error').removeClass('hidden');
            $('.no-error').addClass('hidden');
            $('#error-msg').html(err);
        };

        $('#close-error').click(function() {
            $('.no-error').removeClass('hidden');
            $('.error').addClass('hidden');
        });

        var startSpinning = function() {
            // $('#control-lock').prop('disabled', true);
            $('#create-session').prop('disabled', true);
            $('#leave-session').prop('disabled', true);
        };

        var stopSpinning = function() {
            // $('#control-lock').prop('disabled', false);
            $('#create-session').prop('disabled', false);
            $('#leave-session').prop('disabled', false);
        };


        var showConnected = function(sessionId) {
            // var urlWithSessionId = tabs[0].url.split('?')[0] + '&ywfId=' + encodeURIComponent(sessionId);
            $('.disconnected').hide();
            $('.connected').show();
            $('#share-url').val(sessionId).focus().select();
        };

        var showDisconnected = function() {
            $('.disconnected').show();
            $('.connected').hide();
            // $('#control-lock').prop('checked', false);
        };

        $('.error').hide();
        showDisconnected();

        $('#create-session').click(function() {
            socket.emit('createSession', null, function(sessionId) {
                localSessionId = sessionId;
            });
            showConnected(localSessionId);
        });

        $('#join-session').click(function() {
            if($('#join-id').val() == '') {
                // do nothing
            } else {
                var joinroomid = $('#join-id').val();
                socket.emit('joinSession', joinroomid, function() {

                });
                showConnected(joinroomid);
            }
        });

        $('#leave-session').click(function() {
            socket.emit('leaveSession', null, function(){
                localSessionId = null;
                localUserId = null;
            });
            showDisconnected();
        });

        $('#play-pause-btn').click(function() {
            socket.emit('playpausebtn', null, function() {

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
    
    });
});