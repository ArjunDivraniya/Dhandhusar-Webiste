/**
 * Standard API Response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version?: string;
  };
}

/**
 * Health check status response
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  version: string;
}

/**
 * Authenticated user context attached to Express Request
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
