import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types/index.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Zod Validation Errors -> 400 Bad Request
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed. Please verify input data.',
      error: {
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.status(400).json(response);
    return;
  }

  // 2. Controlled Application Errors
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred';

  if (!isAppError) {
    console.error('Unhandled Server Error:', err);
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      details: isAppError ? err.details : (env.NODE_ENV === 'development' ? err.stack : undefined),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(statusCode).json(response);
}
