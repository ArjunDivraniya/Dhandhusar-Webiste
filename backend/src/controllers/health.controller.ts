import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/health.service.js';
import { ApiResponse, HealthStatus } from '../types/index.js';

export class HealthController {
  public check(_req: Request, res: Response, next: NextFunction): void {
    try {
      const healthData: HealthStatus = healthService.getHealthStatus();

      const response: ApiResponse<HealthStatus> = {
        success: true,
        message: 'Explore Dhandusar API is operational',
        data: healthData,
        meta: {
          timestamp: healthData.timestamp,
          version: healthData.version,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();

