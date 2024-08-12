const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};
let waitingUsers = [];
let onlineUserCount = 0;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    users[socket.id] = { connectedTo: null, waiting: true, chatReady: false };

    // Notify user they are looking for a stranger
    socket.emit('status', 'Looking for a stranger to connect...');

    const findAndConnect = () => {
        if (users[socket.id].chatReady && users[socket.id].waiting) {
            const availableUser = waitingUsers.find(id => id !== socket.id && users[id].chatReady);
            if (availableUser) {
                users[socket.id].connectedTo = availableUser;
                users[availableUser].connectedTo = socket.id;
                users[socket.id].waiting = false;
                users[availableUser].waiting = false;

                // Clear messages on both clients
                socket.emit('clearMessages');
                io.to(availableUser).emit('clearMessages');

                // Ensure this happens after clearing messages
                setTimeout(() => {
                    socket.emit('status', 'You are now connected with a stranger...');
                    io.to(availableUser).emit('status', 'You are now connected with a stranger...');
                    io.to(availableUser).emit('changeButton', 'Skip');
                    socket.emit('changeButton', 'Skip');
                }, 100);

                waitingUsers = waitingUsers.filter(id => id !== availableUser);
            } else {
                waitingUsers.push(socket.id);
                socket.emit('status', 'Looking for a stranger to connect...');
            }
        }
    };

    socket.on('chatReady', () => {
        users[socket.id].chatReady = true;
        findAndConnect();
    });

    socket.on('message', (msg) => {
        const connectedTo = users[socket.id].connectedTo;
        if (connectedTo) {
            io.to(connectedTo).emit('message', msg);
        }
    });

    socket.on('typing', () => {
        const connectedTo = users[socket.id].connectedTo;
        if (connectedTo) {
            io.to(connectedTo).emit('typing');
        }
    });

    socket.on('skip', () => {
        const connectedTo = users[socket.id].connectedTo;
        if (connectedTo && users[connectedTo]) {
            io.to(connectedTo).emit('status', 'Stranger got disconnected :(');
            io.to(connectedTo).emit('changeButton', 'New');
            users[connectedTo].connectedTo = null;
            users[connectedTo].waiting = true;
        }

        users[socket.id].connectedTo = null;
        users[socket.id].waiting = true;
        socket.emit('status', 'You got disconnected :(');
        socket.emit('changeButton', 'New');
    });

    socket.on('new', () => {
        if (users[socket.id].chatReady && users[socket.id].waiting) {
            findAndConnect();
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        const connectedTo = users[socket.id].connectedTo;
        if (connectedTo && users[connectedTo]) {
            io.to(connectedTo).emit('status', 'Stranger got disconnected :(');
            io.to(connectedTo).emit('changeButton', 'New');
            users[connectedTo].connectedTo = null;
            users[connectedTo].waiting = true;
        }
        delete users[socket.id];
        waitingUsers = waitingUsers.filter(id => id !== socket.id);

        onlineUserCount--; // Decrement count when a user disconnects
        io.emit('updateOnlineCount', onlineUserCount); // Broadcast the updated count
    });

    onlineUserCount++; // Increment count when a user connects
    io.emit('updateOnlineCount', onlineUserCount); // Broadcast the updated count
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
