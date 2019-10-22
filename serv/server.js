
var app = require('express')();
var http = require('http').createServer(app);
var cors = require('cors');
var io = require('socket.io')(http);

var lodash = require('lodash');

app.use(cors());

// health check
app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send('OK');
});

// array to store sessions by session id
var sessions = {};

// array to store users by user id
var users = {};

// generate a random ID with 64 bits of entropy
function makeId() {
    var result = '';
    var hexChars = '0123456789abcdef';
    for (var i = 0; i < 16; i += 1) {
      result += hexChars[Math.floor(Math.random() * 16)];
    }
    return result;
  }

io.on('connection', function(socket){

    var userId = makeId();
    var sessionId = null;

    users[userId] = {
        id: userId,
        sessionId: null,
        socket: socket
    };

    // testing ---------------------------------------------------
    var testuser = "0dd0";
    var testsessionid = 0000;
    var testsession = {
        id: testsessionid,
        userIds: [],
        video: null
    };
    users[testuser] = {
        id: testuser,
        sessionId: testsessionid,
        socket: null
    }
    sessions[testsessionid] = testsession;
    sessions[testsessionid].userIds.push(testuser);
    sessions[testsessionid].userIds.push("00002223d4444");

    for (var i = 0; i < sessions[testsessionid].userIds.length; i++) {
        console.log(sessions[testsessionid].userIds[i]);
    }

    sessions[testsessionid].userIds.splice(sessions[testsessionid].userIds.indexOf(testuser), 1);


    console.log(sessions[testsessionid].userIds.length);
    // testing ---------------------------------------------------


    socket.emit('userId', userId);
    console.log('User ' + userId + ' connected');

    // create new sessionid, set user's sessionid to new sessionid
    socket.on('createSession', function(data, callback) {
        sessionId = makeId();
        var session = {
            id: sessionId,
            userIds: [],
            video: data
        }
        users[userId].sessionId = sessionId;
        sessions[sessionId] = session;
        sessions[sessionId].userIds.push(userId);
        console.log('User ' + users[userId].id + ' has created session: ' + sessions[sessionId].id + '.');
        callback(sessionId);
    });

    //set sessionid to sessionid provided by user in client. 
    socket.on('joinSession', function(data, callback) {
        sessionId = data;
        users[userId].sessionId = sessionId;
        sessions[sessionId].userIds.push(userId);
        console.log('User ' + userId +  ' has joined session: ' + sessionId + '.');
    });

    //set user's sessionid to null; if there are no users left in session, delete the session
    socket.on('leaveSession', function() {
        sessionId = users[userId].sessionId;
        lodash.pull(sessions[sessionId].userIds, userId);
        if (sessions[sessionId].userIds.length === 0) {
            delete sessions[sessionId];
            console.log('session ' + sessionId + ' deleted since no users are in session');
        }
        delete users[userId];
        console.log('User ' + userId + ' has left the session.');
    });

    // play video for all users with the same sessionid
    socket.on('playbtn', function(data) {
        console.log('User ' + userId + ' clicked on the play/pause button.');
        for (var i = 0; i < sessions[sessionId].userIds.length; i++) {
            if (users[sessions[sessionId].userIds[i]].sessionId == data) {
                users[sessions[sessionId].userIds[i]].socket.emit('play', null);
            }
        }
    });

    // pause video for all users with the same sessionid
    socket.on('pausebtn', function(data) {
        console.log('User ' + userId + ' clicked on the pause button.');
        for (var i = 0; i < sessions[sessionId].userIds.length; i++) {
            if (users[sessions[sessionId].userIds[i]].sessionId == data) {
                users[sessions[sessionId].userIds[i]].socket.emit('pause', null);
            }
        }
    });

    // delete user of user list; if there are no users left in session, delete the session
    socket.on('disconnect', function() { 
        sessionId = users[userId].sessionId;
        lodash.pull(sessions[sessionId].userIds, userId);
        if (sessions[sessionId].userIds.length === 0) {
            delete sessions[sessionId];
            console.log('session ' + sessionId + ' deleted since no users are in session');
        }
        delete users[userId];
        console.log('User ' + userId + ' disconnected.');
    });
});

http.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d.', http.address().port);
});
