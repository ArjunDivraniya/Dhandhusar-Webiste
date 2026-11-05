import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { loginRateLimiter } from '../middlewares/rateLimiter.js';

export const authRouter = Router();

// Public Authentication endpoints (Private admin login)
authRouter.post('/login', loginRateLimiter, authController.login.bind(authController));
authRouter.post('/refresh', authController.refresh.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));

// Protected User endpoints (Authentication required)
authRouter.get('/me', authenticate, authController.getMe.bind(authController));
authRouter.post('/change-password', authenticate, authController.changePassword.bind(authController));

