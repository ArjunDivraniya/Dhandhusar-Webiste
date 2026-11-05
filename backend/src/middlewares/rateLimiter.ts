import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_LOGIN_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Sliding window in-memory rate limiter for login endpoints.
 * Limits rapid failed credential stuffing attacks.
 */
export function loginRateLimiter(req: Request, _res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = loginAttempts.get(ip);

  if (record) {
    if (now > record.resetAt) {
      // Window expired, reset counter
      loginAttempts.set(ip, { attempts: 1, resetAt: now + WINDOW_MS });
    } else if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
      const waitMinutes = Math.ceil((record.resetAt - now) / 60000);
      return next(
        new AppError(
          `Too many failed login attempts. Please try again after ${waitMinutes} minutes.`,
          429,
          'TOO_MANY_REQUESTS'
        )
      );
    } else {
      record.attempts += 1;
    }
  } else {
    loginAttempts.set(ip, { attempts: 1, resetAt: now + WINDOW_MS });
  }

  next();
}

/**
 * Clears failed attempts counter upon successful login.
 */
export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

