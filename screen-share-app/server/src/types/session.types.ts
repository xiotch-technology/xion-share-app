export interface Session {
  id: string;
  roomCode: string;
  userId: string;
  role: 'host' | 'viewer';
  createdAt: Date;
  lastActivity: Date;
}

export interface Room {
  code: string;
  hostId: string;
  viewers: Set<string>;
  createdAt: Date;
  lastActivity: Date;
}

export interface SessionStore {
  createSession(roomCode: string, userId: string, role: 'host' | 'viewer'): Session;
  getSession(sessionId: string): Session | undefined;
  getSessionsByRoom(roomCode: string): Session[];
  getSessionsByUser(userId: string): Session[];
  updateSession(sessionId: string, updates: Partial<Session>): Session | null;
  deleteSession(sessionId: string): boolean;
  deleteSessionsByRoom(roomCode: string): number;
  getTotalSessionCount(): number;
}

export interface RoomStore {
  createRoom(roomCode: string, hostId: string): Room;
  getRoom(roomCode: string): Room | undefined;
  joinRoom(roomCode: string, viewerId: string): boolean;
  leaveRoom(roomCode: string, viewerId: string): boolean;
  deleteRoom(roomCode: string): boolean;
  getActiveRoomCount(): number;
  getRoomViewerCount(roomCode: string): number;
  isRoomActive(roomCode: string): boolean;
  getAllActiveRooms(): Room[];
}
