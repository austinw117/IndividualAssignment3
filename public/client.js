const socket = io();

// Update the displayed number when it changes
socket.on('updateNumber', (number) => {
    document.getElementById('number').innerText = number;
});

// Add a click event listener to the button
document.getElementById('incrementButton').addEventListener('click', () => {
    // Send an event to the server to increment the number
    socket.emit('increment');
});