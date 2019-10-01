

$(function(){

    if(!window.ywfLoaded) {
        ywf = true;

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

        var version = null;
        var sessionId = null;
        var ownerId = null;
        var videoId = null;
    
        //popup interactions
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {

                if(request.type == ' getInitData') {
                    sendResponse({});
                    return;
                }
    
                if(request.type == 'createSession') {
                    sendResponse({});
                    return;
                }
    
                if(request.type == 'joinSession') {
                   sendResponse({});
                   return;
                }
    
                if(request.type == 'leaveSession') {
                    sendResponse({});
                    return;
                }
            }
        );
    



    }



});