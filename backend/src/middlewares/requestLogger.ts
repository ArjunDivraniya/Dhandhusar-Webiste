import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';
    console.log(
      `${statusColor} [${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`
    );
  });

  next();
}

