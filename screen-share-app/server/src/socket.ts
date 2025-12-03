import { Server as SocketIOServer, Socket } from 'socket.io';
import { sessionService } from './services/session.service';
import { roomService } from './services/room.service';
import { generateRoomCode, generateUserId } from './utils/codeGenerator';
import { validateRoomCode } from './utils/validators';
import { logger } from './utils/logger';

interface ExtendedSocket extends Socket {
  userId?: string;
  roomCode?: string | undefined;
}

export const initializeSocketServer = (io: SocketIOServer): void => {
  io.on('connection', (socket: ExtendedSocket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Generate unique user ID for this socket
    socket.userId = generateUserId();

    // Handle room creation (host)
    socket.on('create-room', () => {
      try {
        const roomCode = generateRoomCode();

        // Create room
        roomService.createRoom(roomCode, socket.userId!);

        // Create host session
        sessionService.createSession(roomCode, socket.userId!, 'host');

        socket.roomCode = roomCode;
        socket.join(roomCode);

        socket.emit('room-created', { roomCode, success: true });
        logger.info(`Room created: ${roomCode} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Failed to create room:', error);
        socket.emit('room-created', { success: false, error: 'Failed to create room' });
      }
    });

    // Handle room joining (viewer)
    socket.on('join-room', (data: { roomCode: string }) => {
      try {
        const { roomCode } = data;

        if (!validateRoomCode(roomCode)) {
          socket.emit('room-joined', { success: false, error: 'Invalid room code' });
          return;
        }

        const room = roomService.getRoom(roomCode);
        if (!room) {
          socket.emit('room-joined', { success: false, error: 'Room not found' });
          return;
        }

        // Join room
        roomService.joinRoom(roomCode, socket.userId!);
        sessionService.createSession(roomCode, socket.userId!, 'viewer');

        socket.roomCode = roomCode;
        socket.join(roomCode);

        // Notify all clients in the room about the new viewer
        io.to(roomCode).emit('viewer-joined', {
          viewerId: socket.userId,
          viewerCount: roomService.getRoomViewerCount(roomCode)
        });

        socket.emit('room-joined', {
          roomCode,
          success: true,
          viewerCount: roomService.getRoomViewerCount(roomCode)
        });

        logger.info(`User ${socket.userId} joined room ${roomCode}`);
      } catch (error) {
        logger.error('Failed to join room:', error);
        socket.emit('room-joined', { success: false, error: 'Failed to join room' });
      }
    });

    // Handle room leaving
    socket.on('leave-room', (data: { roomCode: string }) => {
      try {
        const { roomCode } = data;

        if (socket.roomCode === roomCode) {
          roomService.leaveRoom(roomCode, socket.userId!);
          sessionService.deleteSessionsByRoom(roomCode);

          socket.leave(roomCode);
          socket.roomCode = undefined;

          // Notify remaining clients
          io.to(roomCode).emit('viewer-left', {
            viewerId: socket.userId,
            viewerCount: roomService.getRoomViewerCount(roomCode)
          });

          // If room is empty, delete it
          if (roomService.getRoomViewerCount(roomCode) === 0) {
            roomService.deleteRoom(roomCode);
          }

          socket.emit('room-left', { success: true });
          logger.info(`User ${socket.userId} left room ${roomCode}`);
        }
      } catch (error) {
        logger.error('Failed to leave room:', error);
        socket.emit('room-left', { success: false, error: 'Failed to leave room' });
      }
    });

    // WebRTC signaling
    socket.on('webrtc-offer', (data: { offer: any }) => {
      socket.to(socket.roomCode!).emit('webrtc-offer', data);
    });

    socket.on('webrtc-answer', (data: { answer: any }) => {
      socket.to(socket.roomCode!).emit('webrtc-answer', data);
    });

    socket.on('ice-candidate', (data: { candidate: any }) => {
      socket.to(socket.roomCode!).emit('ice-candidate', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);

      if (socket.roomCode && socket.userId) {
        try {
          roomService.leaveRoom(socket.roomCode, socket.userId);
          sessionService.deleteSession(`${socket.roomCode}-${socket.userId}-${Date.now()}`);

          // Notify remaining clients
          io.to(socket.roomCode).emit('viewer-left', {
            viewerId: socket.userId,
            viewerCount: roomService.getRoomViewerCount(socket.roomCode)
          });

          // If room is empty, delete it
          if (roomService.getRoomViewerCount(socket.roomCode) === 0) {
            roomService.deleteRoom(socket.roomCode);
          }
        } catch (error) {
          logger.error('Error during disconnect cleanup:', error);
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });
};
