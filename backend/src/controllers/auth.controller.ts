import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { resetLoginAttempts } from '../middlewares/rateLimiter.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../types/index.js';
import { AppError } from '../middlewares/errorHandler.js';

export class AuthController {
  /**
   * Helper to set secure HttpOnly refresh token cookie
   */
  private setRefreshCookie(res: Response, refreshToken: string): void {
    const isProduction = env.NODE_ENV === 'production';
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth',
      maxAge: env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    });
  }

  /**
   * Helper to clear refresh token cookie
   */
  private clearRefreshCookie(res: Response): void {
    const isProduction = env.NODE_ENV === 'production';
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth',
    });
  }

  /**
   * Admin Login: POST /api/auth/login
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(validatedInput, {
        ipAddress: ip,
        userAgent,
      });

      // Clear failed rate limit counter on success
      resetLoginAttempts(ip);

      // Set HttpOnly refresh token cookie
      this.setRefreshCookie(res, result.refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Access Token: POST /api/auth/refresh
   */
  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check HttpOnly cookie first, then request body
      const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

      if (!rawRefreshToken) {
        throw new AppError('Refresh token required.', 401, 'MISSING_REFRESH_TOKEN');
      }

      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];

      const tokens = await authService.refreshToken(rawRefreshToken, {
        ipAddress: ip,
        userAgent,
      });

      // Set new rotated refresh cookie
      this.setRefreshCookie(res, tokens.refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout: POST /api/auth/logout
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const userId = req.user?.id;

      await authService.logout(rawRefreshToken, userId);

      this.clearRefreshCookie(res);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Current Authenticated User: GET /api/auth/me
   */
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized.', 401, 'UNAUTHORIZED');
      }

      const user = await authService.getMe(req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Current user profile retrieved',
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change Password: POST /api/auth/change-password
   */
  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized.', 401, 'UNAUTHORIZED');
      }

      const validatedInput = changePasswordSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];

      await authService.changePassword(req.user.id, validatedInput, {
        ipAddress: ip,
        userAgent,
      });

      // Clear cookie as all sessions are revoked
      this.clearRefreshCookie(res);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully. All other active sessions have been invalidated.',
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

