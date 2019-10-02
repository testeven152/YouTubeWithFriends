

var app = require('express')();
var http = require('http').createServer(app);
var cors = require('cors');
var io = require('socket.io')(http);
// io.set('transports', ['websockets']); this was cauasing websocket handshake errors, seems setting transports in client works

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

    socket.emit('userId', userId);
    console.log('User ' + userId + ' connected');

    socket.on('createSession', function(data, callback) {
        sessionId = makeId();
        var session = {
            id: sessionId,
            userIds: [userId],
            video: data
        }
        users[userId].sessionId = sessionId;
        sessions[session.id] = session;
        console.log('User ' + userId + ' has created session: ' + sessionId + '.');
        callback(sessionId);
    });

    socket.on('joinSession', function(data, callback) {
        sessionId = data;
        users[userId].sessionId = sessionId;
        sessions[sessionId].userIds.push(userId);
        console.log('User ' + userId +  ' has joined session: ' + sessionId + '.');
    });

    socket.on('leaveSession', function() {
        sessionId = users[userId].sessionId;
        lodash.pull(sessions[sessionId].userIds, userId);
        if (sessions[sessionId].userIds.length === 0) {
            delete sessions[sessionId];
            console.log('session ' + sessionId + ' deleted since no users are in session');
        }
        users[userId].sessionId = null;
        console.log('User ' + userId + ' has left the session.');
    });

    socket.on('playbtn', function() {
        console.log('User ' + userId + ' clicked on the play/pause button.');
    });

    socket.on('pausebtn', function() {
        console.log('User ' + userId + ' clicked on the pause button.');
    });

    socket.on('syncbutton', function() {
        console.log('User ' + userId + ' clicked on the sync button.');
    });

    socket.on('disconnect', function() { 
        sessionId = users[userId].sessionId;
        lodash.pull(sessions[sessionId].userIds, userId);
        if (sessions[sessionId].userIds.length === 0) {
            delete sessions[sessionId];
            console.log('session ' + sessionId + ' deleted since no users are in session');
        }
        delete users[userId];
        console.log('User' + userId + ' disconnected.');
    });
});

http.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d.', http.address().port);
});
