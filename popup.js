'use strict';

$(function(){


    var connectionOptions =  {
        "force new connection" : true,
        "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
        "timeout" : 10000, //before connect_error and connect_timeout are emitted.
        "transports" : ["websocket"]
    };

    var socket = io('http://youtubewfriends.herokuapp.com/', connectionOptions);

    socket.on('connect', function(){ console.log('client connected'); });

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        $('#connectbutton').click(function() {
            socket.emit('connectbutton', function(){});
            console.log('connect button clicked');
        })


    });
});