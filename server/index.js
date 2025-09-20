const { Server } = require("socket.io");
const http = require('http');

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
  socket.on('newBox', (boxData) => {
    console.log('New box created:', boxData);
    io.emit('newBox', boxData);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server listening on *:3000');
});