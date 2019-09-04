
$(function(){

    var socket = io('https://youtubewfriends.herokuapp.com/');

    var userId = NULL;
    socket.on('userId', function (data) {
        if(userId == null){
            userId = data;
        }
    });

    //popup interactions
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if(request.type == 'getInitData') {

            }
        }
    );


});