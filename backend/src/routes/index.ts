import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';

export const apiRouter = Router();

// Health Check route: /api/health
apiRouter.use('/health', healthRouter);

// Authentication & Session routes: /api/auth
apiRouter.use('/auth', authRouter);

// Future Phase routes will be mounted here:
// apiRouter.use('/news', newsRouter);
// apiRouter.use('/places', placeRouter);
// apiRouter.use('/businesses', businessRouter);
// apiRouter.use('/media', mediaRouter);
