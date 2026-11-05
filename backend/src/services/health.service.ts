import { HealthStatus } from '../types/index.js';
import { env } from '../config/env.js';

export class HealthService {
  public getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    };
  }
}

export const healthService = new HealthService();

