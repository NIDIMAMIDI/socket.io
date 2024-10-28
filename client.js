import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to the server');

  socket.emit('first', 'sharuk', 'first', (response) => {
    console.log('Callback response:', response);
  });

  socket.on('response', (message) => {
    console.log('Server response:', message);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from the server');
  });
});
