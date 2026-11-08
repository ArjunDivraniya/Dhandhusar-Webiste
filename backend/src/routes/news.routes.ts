import { Router } from 'express';
import { newsController } from '../controllers/news.controller.js';
import {
  authenticate,
  authorizePermission,
  authorizeAnyPermission,
} from '../middlewares/auth.middleware.js';

export const newsRouter = Router();

// ==========================================
// Public Read-Only Endpoints
// (Exposes strictly PUBLISHED content only)
// ==========================================

// GET /api/news/categories - List all news categories
newsRouter.get('/categories', newsController.listCategories);

// GET /api/news - List published news with language, category, search, and pagination
newsRouter.get('/', newsController.listPublishedNews);

// GET /api/news/:slug - Get single published news article by localized slug
newsRouter.get('/:slug', newsController.getPublishedNewsBySlug);

// ==========================================
// Protected Administrative Workflow Endpoints
// (Requires authentication and appropriate RBAC permissions)
// ==========================================

// POST /api/news - Create a new draft article (Content Editor or Super Admin)
newsRouter.post(
  '/',
  authenticate,
  authorizePermission('news.create'),
  newsController.createDraft
);

// POST /api/news/admin/categories - Create news category
newsRouter.post(
  '/admin/categories',
  authenticate,
  authorizeAnyPermission('news.create', 'SUPER_ADMIN'),
  newsController.createCategory
);

// GET /api/news/admin/list - List all articles with admin filters (all statuses)
newsRouter.get(
  '/admin/list',
  authenticate,
  authorizeAnyPermission('news.create', 'news.review', 'news.publish'),
  newsController.listAdminArticles
);

// GET /api/news/admin/pending - Review queue for Publishers
newsRouter.get(
  '/admin/pending',
  authenticate,
  authorizePermission('news.review'),
  newsController.listPendingReview
);

// GET /api/news/admin/:id - Get full article details (all translations & review history)
newsRouter.get(
  '/admin/:id',
  authenticate,
  authorizeAnyPermission('news.create', 'news.review', 'news.publish'),
  newsController.getAdminArticleById
);

// PUT /api/news/admin/:id - Edit news article & translations
newsRouter.put(
  '/admin/:id',
  authenticate,
  authorizePermission('news.edit'),
  newsController.updateArticle
);

// POST /api/news/admin/:id/submit - Submit draft for Publisher review
newsRouter.post(
  '/admin/:id/submit',
  authenticate,
  authorizePermission('news.submit_review'),
  newsController.submitForReview
);

// POST /api/news/admin/:id/publish - Publisher approves and publishes live
newsRouter.post(
  '/admin/:id/publish',
  authenticate,
  authorizePermission('news.publish'),
  newsController.publishArticle
);

// POST /api/news/admin/:id/request-changes - Publisher requests changes with review comment
newsRouter.post(
  '/admin/:id/request-changes',
  authenticate,
  authorizePermission('news.review'),
  newsController.requestChanges
);

// POST /api/news/admin/:id/reject - Publisher rejects content with reason
newsRouter.post(
  '/admin/:id/reject',
  authenticate,
  authorizePermission('news.review'),
  newsController.rejectArticle
);

// POST /api/news/admin/:id/archive - Archive published or obsolete article
newsRouter.post(
  '/admin/:id/archive',
  authenticate,
  authorizePermission('news.archive'),
  newsController.archiveArticle
);

