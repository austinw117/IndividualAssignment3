// Players
var player1 = "Red";
var player2 = "Blue";
var currPlayer = player1;
var prevPlayer;

// Game Results 
var draw = false;
var gameOver = ""; // Holds the string for Winner/Draw

// Multi Dimensional Array to represent the game board
var board = [];

// Function scoped variables to define the size of the board
var rows = 6;
var columns = 7;

// Function scoped array to define the number of available
// slots remain in any of the 7 columns(0 -  Indexed)

// Ex. columnTracker[0] --> Number of slots available in the first column
var columnTracker = [5,5,5,5,5,5,5];

// Draws the board.
window.onload = setGame;

// Client Side Programming
const socket = io();

// Tile Updates for Clients
socket.on('updateBoard', (newTileCoor, tile, globalCurrPlayer, globalBoard, globalColumnTracker, gameOver) => {

    // Updating the DOM and 2D array with the tile placement from server
    board = globalBoard;
    columnTracker = globalColumnTracker;
    currPlayer = globalCurrPlayer;
    document.getElementById("status").textContent = currPlayer + "'s turn!";
    finalTile = document.getElementById(newTileCoor); 
    finalTile.classList.add(tile);

    // Inform this client its their turn
    if(gameOver){
        let status = document.getElementById("status")
        endGame(status, gameOver)
    }else{
        // Reenable listeners
        addListeners();
    }
});

// Restart Game from Server
socket.on('restartGame', () => {
    location.reload();
});

// HELPER FUNCTIONS

// Draws the board for the Connect 4 Game
// Equivalent to inserting div<>div tags 
// to draw the empty slot of the board.
// Simultaneously creates the 2D Matrix in the
// "board" variable.
function setGame(){
    for(let r = 0; r < rows; r++){
        board[r] = [];
        for(let c = 0; c < columns; c++){
            board[r][c] = "";
            let tile = document.createElement("div");
            // Each tile will be represented in the format:
            // RowxColumn
            // In order to update the appropriate tile on the board 
            tile.id = r.toString() + "x" + c.toString();
            tile.classList.add("tile");
            // Each tile can be clicked
            tile.addEventListener("click", placePiece); 
            document.getElementById("board").append(tile);
        }
    }

    document.getElementById("status").textContent = currPlayer + "'s turn!";
}

// Enables the current player to place their piece on
// the board by clicking on a tile. Player clicks a tile
// and a piece of their color will be placed within the 
// column of that board.
function placePiece(){

    // Tile clicked by the player
    let tile = this;

    // Original format: RowxColumn
    // split() creates the array [Row, Column]
    let coords = tile.id.split("x");
    let c = parseInt(coords[1]);

    // Update the 2D Matrix so the current player
    // has placed their piece on the tile.
    // Switch the active player after a tile has 
    // been placed.

    // Checks to see if there is a space 
    // available in the column the player chose.
    if(columnTracker[c] < 0){
        // No space available, notify user to choose
        // different tile and exit function;
        console.log("Invalid Tile");
        return;
    }
    
    // The Final Row can be determined by the 
    // remaining slots available in the column 
    // chosen by the user. The Final Column is
    // the initial column selected by the user.
    let finalRowPlacement = columnTracker[c];
    console.log("finalRowPlacement: " + finalRowPlacement);
    let finalColumnPlacement = c;
    console.log("finalColumnPlacement: " + finalColumnPlacement);
    columnTracker[c] = columnTracker[c] - 1;
    let finalCoord = finalRowPlacement.toString() + "x" + finalColumnPlacement.toString();
    console.log("finalCoord: " + finalCoord);

    // Updating the DOM and 2D array with the tile placement
    finalTile = document.getElementById(finalCoord); 
    board[finalRowPlacement][finalColumnPlacement] = currPlayer;
    if(currPlayer == player1){
        tile = "player1-tile";
        finalTile.classList.add(tile);
        currPlayer = player2;
    }else{
        tile = "player2-tile";
        finalTile.classList.add("player2-tile");
        currPlayer = player1;
    }
    document.getElementById("status").textContent = currPlayer + "'s turn!";
    // Check to see if previous move resulted in a winner/draw.
    prevPlayer = getPrevPlayer(currPlayer);
    let status = document.getElementById("status")
    if(checkDraw() == true){
        gameOver = "Draw.";
        endGame(status, gameOver);
    }else if(checkForWinner() == true){
        gameOver = "Winner: " + prevPlayer;
        endGame(status, gameOver);
    }

    // Updating the board for all clients 
    // finaleTile now has the appropriate
    // color tile to it.
    socket.emit("placeTile", finalCoord, tile, currPlayer, board, columnTracker, gameOver);

    // Remove Player Action for Now
    removeListeners();
}

// Calls a series of helper functions to check
// the row, column, and diagonal directions for 
// a win by the player who just moved: prevPlayer.
function checkForWinner(){
    if(checkRow() == true || checkColumn() == true || checkDiagonal() == true
        || checkAntiDiagonal() == true ){
        console.log("checkForWinner() --> True: " + prevPlayer)
        return true;
    }
    return false;
}

function checkRow(){
    // Tracks the number of tiles of currPlayer's color
    // in a given row.
    tileCounter = 0;
    for(let r = 0; r < board.length; r++){
        for(let c = 0; c < board[0].length; c++){
            if(board[r][c] != prevPlayer){
                // "Streak" of colors was interuppted
                // by an empty slot or opposing color tile.
                tileCounter = 0;
            }else{
                tileCounter = tileCounter + 1;
                if(tileCounter == 4){
                    return true;;
                }
            }
        }
    }
    console.log("checkRow(): No Winner.");
    return false;
}

function checkColumn(){
    // Tracks the number of tiles of currPlayer's color
    // in a given column.
    tileCounter = 0;
    for(let c = 0; c < board[0].length; c++){
        for(let r = 0; r < board.length; r++){
            if(board[r][c] != prevPlayer){
                // "Streak" of colors was interuppted
                // by an empty slot or opposing color tile.
                tileCounter = 0;
            }else{
                tileCounter = tileCounter + 1;
                if(tileCounter == 4){
                    return true;
                }
            }
        }
    }
    console.log("checkCol(): No Winner.")
    return false;
}

function validLocation(row, col){
    if(row < rows && col < columns){
        return true;
    }
    return false;
}

function checkAntiDiagonal(){
    for(let r = 0; r < board.length - 3; r++){
        for(let c = 0; c < board[0].length - 3; c++){
            if(board[r][c] != ""){
                // Only call this function when we are not
                // at an empty space
                if(checkAntiDiagonalHelper(r, c) == true){
                    console.log("checkAntiDiagonal(): Winner.");
                    return true;
                }
            }
        }
    }
    return false;
}

function checkAntiDiagonalHelper(row, col){
    let player = board[row][col];
    if(board[row + 1][col + 1] == player && board[row + 2][col + 2] == player && board[row + 3][col + 3] == player){
        return true;
    }
    return false;
}

function checkDiagonal(){
    for(let r = 3; r < board.length; r++){
        for(let c = 0; c < board[0].length - 3; c++){
            if(board[r][c] != ""){
                // Only call this function when we are not
                // at an empty space
                if(checkDiagonalHelper(r, c) == true){
                    console.log("checkDiagonal(): Winner.");
                    return true;
                }
            }
        }
    }
    return false;
}

function checkDiagonalHelper(row, col){
    let player = board[row][col];
    if(board[row - 1][col + 1] == player && board[row - 2][col + 2] == player && board[row - 3][col + 3] == player){
        return true;
    }
    return false;
}

// Determines if all possible tiles 
// have been filled. If so, either 
// player cannot no longer win/lose.
function checkDraw(){
    for(let i = 0; i < columnTracker.length; i++){
        if(columnTracker[i] >= 0){
            console.log("Check Draw: False");
            return false;
        }
    }

    // No more possible locations for tiles
    // Game is a draw.
    console.log("Check Draw: True");
    return true;
}

function getPrevPlayer(givenPlayer){
    if(givenPlayer == player1){
        return player2;
    }

    return player1;
}

// Modifies body tag to update with the 
// given winner and prevents further
// placement on the board.
function endGame(status, result){
    text = "Draw."
    status.innerHTML = result;
    draw = true;

    // Prevents further action from the player.
    removeListeners();

    // Shows button to restart the game.
    let restartGame = document.createElement("button");
    restartGame.textContent = "Restart Game.";
    restartGame.classList.add("restartButton");
    restartGame.addEventListener('click', function() {

        // Reload this page for this client 
        location.reload();

        // Reload other clients pages
        socket.emit("restartGame");
    });
    document.getElementById("restartGame").append(restartGame);
    console.log("Game Reloaded.")
}

function removeListeners(){
    console.log("Player Action Removed.")
    document.getElementById("board").classList.add("disableClick");
    // const divs = document.querySelectorAll('div');
    // divs.forEach(div => {
    //     div.addEventListener('click', function() {
    //         div.classList.add("disableClick");
    //     });
    // });
}

function addListeners(){
    console.log("Player Action Added.")
    document.getElementById("board").classList.remove("disableClick");
    // const divs = document.querySelectorAll('div');
    // divs.forEach(div => {
    //     div.addEventListener('click', function() {
    //         div.classList.remove("disableClick");
    //     });
    // });
}