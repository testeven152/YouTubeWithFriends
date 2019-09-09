
$(function(){

    var socket = io('https://youtubewfriends.herokuapp.com/');

    var userId = NULL;
    socket.on('userId', function (data) {
        if(userId == null){
            userId = data;
        }
    });

    socket.on('connect', function() {

    });

    socket.on('reconnect', function() {

    });

    socket.on('update', function() {

    });

    //popup interactions
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if(request.type == 'getInitData') {
                
            }

            if(request.type == 'createSession') {
                socket.emit('createSession', 0);
            }

            if(request.type == 'joinSession') {
                socket.emit('joinSession');
            }

            if(request.type == 'leaveSession') {
                socket.emit('leaveSession');
            }
        }
    );


});