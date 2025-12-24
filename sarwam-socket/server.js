const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining with rollNo
  socket.on('join', (rollNo) => {
    connectedUsers.set(socket.id, rollNo);
    console.log(`User ${rollNo} joined the chat`);
    socket.emit('joined', `Welcome ${rollNo}!`);
  });

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    const { message, rollNo } = data;
    console.log(`Message from ${rollNo}: ${message}`);

    // Broadcast to all connected clients
    io.emit('receiveMessage', {
      message,
      rollNo,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const rollNo = connectedUsers.get(socket.id);
    if (rollNo) {
      console.log(`User ${rollNo} disconnected`);
      connectedUsers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});