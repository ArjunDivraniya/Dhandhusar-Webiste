import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { newsRouter } from './news.routes.js';

export const apiRouter = Router();

// Health Check route: /api/health
apiRouter.use('/health', healthRouter);

// Authentication & Session routes: /api/auth
apiRouter.use('/auth', authRouter);

// News & Publishing Workflow routes: /api/news
apiRouter.use('/news', newsRouter);

// Future Phase routes will be mounted here:
// apiRouter.use('/places', placeRouter);
// apiRouter.use('/businesses', businessRouter);
// apiRouter.use('/media', mediaRouter);
