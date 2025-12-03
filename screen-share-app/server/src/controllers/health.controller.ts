import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';
import { roomService } from '../services/room.service';

class HealthController {
  async getHealth(req: Request, res: Response) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        activeRooms: roomService.getActiveRoomCount(),
        totalSessions: sessionService.getTotalSessionCount(),
        version: process.env.npm_package_version || '1.0.0'
      };

      res.status(200).json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}

const healthController = new HealthController();
export default healthController;
