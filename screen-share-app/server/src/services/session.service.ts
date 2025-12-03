import { Session, SessionStore } from '../types/session.types';
import { logger } from '../utils/logger';

class SessionService implements SessionStore {
  private sessions: Map<string, Session> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  createSession(roomCode: string, userId: string, role: 'host' | 'viewer'): Session {
    const session: Session = {
      id: `${roomCode}-${userId}-${Date.now()}`,
      roomCode,
      userId,
      role,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(session.id, session);
    logger.info(`Session created: ${session.id} for room ${roomCode}`);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
    return session;
  }

  getSessionsByRoom(roomCode: string): Session[] {
    return Array.from(this.sessions.values()).filter(session => session.roomCode === roomCode);
  }

  getSessionsByUser(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  updateSession(sessionId: string, updates: Partial<Session>): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updatedSession = { ...session, ...updates, lastActivity: new Date() };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      logger.info(`Session deleted: ${sessionId}`);
    }
    return deleted;
  }

  deleteSessionsByRoom(roomCode: string): number {
    const sessionsToDelete = this.getSessionsByRoom(roomCode);
    sessionsToDelete.forEach(session => this.deleteSession(session.id));
    logger.info(`Deleted ${sessionsToDelete.length} sessions for room ${roomCode}`);
    return sessionsToDelete.length;
  }

  getTotalSessionCount(): number {
    return this.sessions.size;
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiryTime = 30 * 60 * 1000; // 30 minutes
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions) {
      if (now.getTime() - session.lastActivity.getTime() > expiryTime) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }
}

export const sessionService = new SessionService();
