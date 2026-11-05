import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';
import { ApiResponse } from './types/index.js';

export function createApp(): Express {
  const app = express();

  // Basic Security & Parsing Middlewares
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Custom Request Logger
  app.use(requestLogger);

  // Mount API Router under /api
  app.use('/api', apiRouter);

  // 404 Route Handler
  app.use((req: Request, res: Response) => {
    const notFoundResponse: ApiResponse = {
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
      error: {
        code: 'NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.status(404).json(notFoundResponse);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
