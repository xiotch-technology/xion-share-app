import { Room, RoomStore } from '../types/session.types';
import { logger } from '../utils/logger';

class RoomService implements RoomStore {
  private rooms: Map<string, Room> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up empty rooms every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupEmptyRooms();
    }, 10 * 60 * 1000);
  }

  createRoom(roomCode: string, hostId: string): Room {
    const room: Room = {
      code: roomCode,
      hostId,
      viewers: new Set(),
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomCode, room);
    logger.info(`Room created: ${roomCode} by host ${hostId}`);
    return room;
  }

  getRoom(roomCode: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.lastActivity = new Date();
    }
    return room;
  }

  joinRoom(roomCode: string, viewerId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    room.viewers.add(viewerId);
    room.lastActivity = new Date();
    logger.info(`Viewer ${viewerId} joined room ${roomCode}`);
    return true;
  }

  leaveRoom(roomCode: string, viewerId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    const removed = room.viewers.delete(viewerId);
    if (removed) {
      room.lastActivity = new Date();
      logger.info(`Viewer ${viewerId} left room ${roomCode}`);
    }
    return removed;
  }

  deleteRoom(roomCode: string): boolean {
    const deleted = this.rooms.delete(roomCode);
    if (deleted) {
      logger.info(`Room deleted: ${roomCode}`);
    }
    return deleted;
  }

  getActiveRoomCount(): number {
    return this.rooms.size;
  }

  getRoomViewerCount(roomCode: string): number {
    const room = this.getRoom(roomCode);
    return room ? room.viewers.size : 0;
  }

  isRoomActive(roomCode: string): boolean {
    return this.rooms.has(roomCode);
  }

  getAllActiveRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  private cleanupEmptyRooms(): void {
    let cleanedCount = 0;

    for (const [roomCode, room] of this.rooms) {
      // Remove rooms that have been inactive for more than 1 hour
      const now = new Date();
      const inactiveTime = now.getTime() - room.lastActivity.getTime();
      const maxInactiveTime = 60 * 60 * 1000; // 1 hour

      if (inactiveTime > maxInactiveTime) {
        this.rooms.delete(roomCode);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} inactive rooms`);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.rooms.clear();
  }
}

export const roomService = new RoomService();
