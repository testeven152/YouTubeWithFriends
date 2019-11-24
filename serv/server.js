

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

    // create userId and send to client --------------------------

    var userId = makeId();

    users[userId] = {
        id: userId,
        sessionId: null,
        socket: socket
    };

    socket.emit('userId', userId);
    console.log('User ' + userId + ' connected.');

    // -----------------------------------------------------------

    // testing ---------------------------------------------------
    // var testuser = "0dd0";
    // var testsessionid = 0000;
    // var testsession = {
    //     id: testsessionid,
    //     userIds: [],
    //     video: null
    // };
    // users[testuser] = {
    //     id: testuser,
    //     sessionId: testsessionid,
    //     socket: null
    // }
    // sessions[testsessionid] = testsession;
    // sessions[testsessionid].userIds.push(testuser);
    // sessions[testsessionid].userIds.push("00002223d4444");

    // for (var i = 0; i < sessions[testsessionid].userIds.length; i++) {
    //     console.log(sessions[testsessionid].userIds[i]);
    // }

    // sessions[testsessionid].userIds.splice(sessions[testsessionid].userIds.indexOf(testuser), 1);


    // console.log(sessions[testsessionid].userIds.length);
    // testing ---------------------------------------------------

    // helper functions ----------------------------------------------------------------------------------

    var createSession = function(newUserId) {
        var sessionId = makeId();
        console.log('Attempting to create session with id: ' + sessionId + '...');
        var session = {
            id: sessionId,
            userIds: [newUserId]
        };
        sessions[sessionId] = session;
        users[newUserId].sessionId = sessionId;
        console.log('User ' + users[newUserId].id + ' has created session: ' + sessions[sessionId].id + '.');

    }

    var removeUserFromSession = function(newUserId) {
        let tempSessionId = users[newUserId].sessionId;
        if (tempSessionId != null) {
            console.log('Attempting to remove user ' + newUserId + ' from session ' + tempSessionId + '...');
            lodash.pull(sessions[tempSessionId].userIds, newUserId);
            if (lodash.get(sessions[tempSessionId].userIds.length) === 0) {
                delete sessions[tempSessionId];
                console.log('session ' + tempSessionId + ' deleted since no users are in session');
            }
            delete users[newUserId];
        } else {
            delete users[newUserId];
            console.log('User ' + newUserId + ' had no session.');
        }
    }

    var addUserToSession = function(newUserId, sessionIdFromClient) {
        console.log("Attempting to add user " + newUserId + " to session " + sessionIdFromClient + "...");
        users[newUserId].sessionId = sessionIdFromClient;
        sessions[sessionIdFromClient].userIds.push(newUserId);
    }


    var playpause = function(newUserId, type) {
        let tempSessionId = users[newUserId].sessionId
        switch(type) {
            case "play":
                console.log('User ' + newUserId + ' clicked on the play button.');
                for (let i = 0; i < sessions[tempSessionId].userIds.length; ++i) {
                    users[sessions[tempSessionId].userIds[i]].socket.emit('play', null);
                }
                break;
            case "pause":
                console.log('User ' + newUserId + ' clicked on the pause button.');
                for (let i = 0; i < sessions[tempSessionId].userIds.length; ++i) {
                    users[sessions[tempSessionId].userIds[i]].socket.emit('pause', null);
                }
                break;
            default:
                console.log('Invalid type for function: playpause');
                break;
        }
    }

    // ---------------------------------------------------------------------------------------------------

    // create new sessionid, set user's sessionid to new sessionid
    socket.on('createSession', function(data, callback) {
        createSession(data);
        callback(users[data].sessionId);
    });

    //set sessionid to sessionid provided by user in client. 
    socket.on('joinSession', function(data) {
        addUserToSession(userId, data);
        console.log('User ' + userId +  ' has joined session: ' + sessionId + '.');
    });

    // play video for all users with the same sessionid
    socket.on('playbtn', function(data) {
        playpause(data, "play");
    });

    // pause video for all users with the same sessionid
    socket.on('pausebtn', function(data) {
        playpause(data, "pause");
    });

    // delete user of user list; if there are no users left in session, delete the session
    socket.on('disconnect', function() { 
        removeUserFromSession(userId);
        console.log('User ' + userId + ' disconnected.');
    });
});

http.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d.', http.address().port);
});
