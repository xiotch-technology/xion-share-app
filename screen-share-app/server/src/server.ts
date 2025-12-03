import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const sessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('host-register', (data) => {
    sessions.set(data.roomId, { host: socket.id, viewers: [] });
    socket.join(data.roomId);
    console.log(`Host registered for room: ${data.roomId}`);
  });
  
  socket.on('viewer-connect', (data) => {
    const session = sessions.get(data.roomId);
    if (session) {
      socket.join(data.roomId);
      socket.to(session.host).emit('viewer-connected', { viewerId: socket.id });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`✅ SERVER RUNNING: http://localhost:${PORT}`);
  console.log(`✅ WebSocket ready on port ${PORT}`);
});
