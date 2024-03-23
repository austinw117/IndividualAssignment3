// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Multi Dimensional Array to represent the game board
var globalBoard = [];

// Tracks the number of available slots
// for each column of the board
var globalColumnTracker = [5,5,5,5,5,5,5];

// Serve static files from the 'public' directory
app.use(express.static(__dirname  + "/public"));
console.log(__dirname  + "/public")
// app.use(express.static(__dirname + '/public', {
//     setHeaders: (res, path, stat) => {
//         if (path.endsWith('.js')) {
//             res.set('Content-Type', 'text/javascript');
//         }
//     }
// }));

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Listen for moves from players
    socket.on('placeTile', (newTileCoor, tile, globalCurrPlayer, board, columnTracker, gameOver) => {

        globalBoard = board;
        globalColumnTracker = columnTracker;

        // Broadcast the updated tile to all clients
        socket.broadcast.emit('updateBoard', newTileCoor, tile, globalCurrPlayer, globalBoard, globalColumnTracker, gameOver);

        // Swap the current active player; disable previous player's
        // actions until the following player takes their turn.

        // io.emit('activePlayer, ')
        console.log("Current Player: " + globalCurrPlayer);

    });

    // Listen for restart game press from any client
    socket.on('restartGame', () => {

        // Restart game for all other clients
        socket.broadcast.emit('restartGame');

    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
