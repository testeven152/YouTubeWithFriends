

$(function(){

    var connectionOptions =  {
        "force new connection" : true,
        "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
        "timeout" : 10000,                  //before connect_error and connect_timeout are emitted.
        "transports" : ["websocket"]
    };
    
    const socket = io('http://localhost:3000/', connectionOptions);

/*     var userId = NULL;
    socket.on('userId', function (data) {
        if(userId == null){
            userId = data;
        }
    }); */

    socket.on('connect', function() {
        console.log('Client connected')
    });

    //popup interactions
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if(request.type == 'getInitData') {
                
            }

            if(request.type == 'createSession') {
                socket.emit('createSession', null, function(){

                });
            }

            if(request.type == 'joinSession') {
                socket.emit('joinSession', null, function(){

                });
            }

            if(request.type == 'leaveSession') {
                socket.emit('leaveSession', null, function(){

                });
            }
        }
    );


});