const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { 
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom, 
    updateUsersList, 
    getCurrentDrawer, 
    updateAvailableRooms, 
    removeUnavailableRooms,
    AddFirstGuessRoom,
    removeFirstGuessRoom,
    getRandomWord,
    updateUserPoints,
    checkAllGuesses,
    getUserPoints
} = require('./users.js');

const PORT = process.env.PORT || 5000;
const router = require('./router');

const app = express();
const server = http.createServer(app);

corsOptions={
    cors: true,
    origins:["http://localhost:3000"],
}
const io = socketio(server, corsOptions);

app.use(cors());


// New connection
io.on('connection', (socket) => {
    console.log('Connected');


    // When user joins room
    socket.on('join', ({ name, room }, callback) => {
        
        const { user, error } = addUser({id: socket.id, name, room});
        if(error) return callback(error);

        socket.emit('message', { user: 'Admin', text: `${user.name}, welcome to the room!` });
        socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `${user.name}, has joined the room!` });

        socket.join(user.room);
        socket.emit('currentUser', { user: user });
        socket.emit('currentDrawer', { drawer: getCurrentDrawer(user.room) });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    // When user sends a message
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    // When user guesses word correctly
    socket.on('correctGuess', (users, callback) => {
        const user = getUser(socket.id);
        socket.emit('message', { user: 'Admin', text: 'You guessed the word!' });
        socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has guess the word correctly!` });
        const newList = updateUserPoints(user.id, user.room, users);
        const userPoints = getUserPoints(user.id, user.room, newList);

        if(userPoints >= 40){
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has won the game! You may leave the room.` });
            io.to(user.room).emit('changeTime', 2);
            io.to(user.room).emit('roomData', {room:user.room, users: newList});
            io.to(user.room).emit('endGame');
            return;
        }

        const firstGuess = AddFirstGuessRoom(user.room);
        const allGuessed = checkAllGuesses(user.room, newList);

        if(firstGuess && !allGuessed){
            io.to(user.room).emit('changeTime', 10);
        }

        if(allGuessed){
            io.to(user.room).emit('changeTime', 2);
            io.to(user.room).emit('roomData', {room:user.room, users: newList});
        } else{
            io.to(user.room).emit('roomData', {room:user.room, users: newList});
        }

        callback();
    });


    socket.on('removeFirstGuess', () => {
        const user = getUser(socket.id);
        removeFirstGuessRoom(user.room);
    });

    // User draw coordinates
    socket.on('mouse', (offsetX, offsetY) => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('mouse', offsetX, offsetY);
    });

    // User move-for-draw coordinate
    socket.on('move', (moveX, moveY) => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('move2', moveX, moveY);
    });

    // Scale factoring for drawing to different screens
    socket.on('scale', (scale) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('scale2', scale);
    });

    // Timer
    socket.on('timer', () => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('time2');
    });

    socket.on('clear', () => {
        const user = getUser(socket.id);
        io.to(user.room).emit('clear2');
    });


    // Update list of users
    socket.on('updateUsers', (userIndex, currentList) => {
        const user = getUser(socket.id);
        const {newUserList, newIndex} = updateUsersList(userIndex, user.room, currentList);
        const updated_current_user = getUser(socket.id, newUserList);

        socket.emit('currentUser', { user: updated_current_user });
        socket.emit('currentDrawer', { drawer: getCurrentDrawer(user.room, newUserList) });
        socket.emit('updateUsers2', { newUserList: newUserList, newIndex: newIndex });
        socket.emit('canvasClear');
    });

    // Add room to unavailable rooms
    socket.on('startedGame', () => {
        const user = getUser(socket.id);
        updateAvailableRooms(user.room);
    });

    socket.on('getWord', () => {
        const user = getUser(socket.id);
        const wordToGuess = getRandomWord();
        io.to(user.room).emit('setGuessWord', wordToGuess);
    });

    // Changes color
    socket.on('setColor', (color) => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('setColor2', color);
    });

    socket.on('revealWord', (guessWord) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: 'Admin', text: `The word was ${guessWord}` });
    });


    // When user disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', {user: 'Admin', text: `${user.name} has left the room.`});
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

            if(user.host){
                socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `Host has left the room, the game can't continue. You may leave the room.` });
                socket.broadcast.to(user.room).emit('changeTime', null);
                socket.broadcast.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
                socket.broadcast.to(user.room).emit('endGame');
            }

            const usersInRoom = getUsersInRoom(user.room);
            if(usersInRoom.length === 0){
                removeFirstGuessRoom(user.room);
                removeUnavailableRooms(user.room);
            }
        }
        console.log('Disconnected');
    });
});


app.use(router);
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));