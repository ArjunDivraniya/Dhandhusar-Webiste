import { Request, Response, NextFunction } from 'express';
import { newsService, AuditContext } from '../services/news.service.js';
import {
  createNewsDraftSchema,
  updateNewsSchema,
  reviewFeedbackSchema,
  publishNewsSchema,
  rejectNewsSchema,
  publicNewsQuerySchema,
  adminNewsQuerySchema,
  createCategorySchema,
} from '../validators/news.validator.js';
import { ApiResponse } from '../types/index.js';
import { LanguageCode } from '@prisma/client';

function getAuditContext(req: Request): AuditContext {
  return {
    ipAddress: req.ip || req.socket.remoteAddress || undefined,
    userAgent: req.headers['user-agent'] || undefined,
  };
}

function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0];
  return val || '';
}

export class NewsController {
  // ==========================================
  // Admin Operations
  // ==========================================

  public createDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createNewsDraftSchema.parse(req.body);
      const auditContext = getAuditContext(req);

      const article = await newsService.createDraft(
        req.user!.id,
        {
          ...validated,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          additionalTranslation: validated.additionalTranslation || undefined,
        },
        auditContext
      );

      const response: ApiResponse = {
        success: true,
        message: 'News draft created successfully.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const validated = updateNewsSchema.parse(req.body);
      const auditContext = getAuditContext(req);

      const article = await newsService.updateArticle(
        id,
        req.user!.id,
        req.user!.permissions,
        {
          ...validated,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
        },
        auditContext
      );

      const response: ApiResponse = {
        success: true,
        message: 'News article updated successfully.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public submitForReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const auditContext = getAuditContext(req);

      const article = await newsService.submitForReview(id, req.user!.id, auditContext);

      const response: ApiResponse = {
        success: true,
        message: 'News article submitted for publisher review.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public publishArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const validated = publishNewsSchema.parse(req.body);
      const auditContext = getAuditContext(req);

      const article = await newsService.publishArticle(
        id,
        req.user!.id,
        validated.feedback || undefined,
        auditContext
      );

      const response: ApiResponse = {
        success: true,
        message: 'News article approved and published live.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public requestChanges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const validated = reviewFeedbackSchema.parse(req.body);
      const auditContext = getAuditContext(req);

      const article = await newsService.requestChanges(
        id,
        req.user!.id,
        validated.feedback,
        auditContext
      );

      const response: ApiResponse = {
        success: true,
        message: 'Changes requested. Article returned to editor with review comments.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public rejectArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const validated = rejectNewsSchema.parse(req.body);
      const auditContext = getAuditContext(req);

      const article = await newsService.rejectArticle(
        id,
        req.user!.id,
        validated.reason,
        auditContext
      );

      const response: ApiResponse = {
        success: true,
        message: 'News article rejected with reason.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public archiveArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const auditContext = getAuditContext(req);

      const article = await newsService.archiveArticle(id, req.user!.id, auditContext);

      const response: ApiResponse = {
        success: true,
        message: 'News article archived.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAdminArticleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params.id);
      const article = await newsService.getAdminArticleById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Article details retrieved successfully.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public listAdminArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = adminNewsQuerySchema.parse(req.query);

      const result = await newsService.listAdminArticles(
        {
          status: query.status,
          categoryId: query.categoryId,
          authorId: query.authorId,
          search: query.search,
        },
        {
          page: query.page,
          limit: query.limit,
        }
      );

      const response: ApiResponse = {
        success: true,
        message: 'Admin news list retrieved successfully.',
        data: result,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public listPendingReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await newsService.listPendingReview({ page, limit });

      const response: ApiResponse = {
        success: true,
        message: 'Pending review queue retrieved successfully.',
        data: result,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createCategorySchema.parse(req.body);
      const category = await newsService.createCategory(validated);

      const response: ApiResponse = {
        success: true,
        message: 'Category created successfully.',
        data: category,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // Public Read-Only Endpoints
  // ==========================================

  public listPublishedNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = publicNewsQuerySchema.parse(req.query);

      const result = await newsService.listPublishedNews(query.lang, {
        categorySlug: query.category,
        search: query.search,
        sort: query.sort,
        pagination: {
          page: query.page,
          limit: query.limit,
        },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Published news articles retrieved successfully.',
        data: result,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getPublishedNewsBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = getParam(req.params.slug);
      const rawLang = req.query.lang as string | undefined;
      const language: LanguageCode = rawLang === 'EN' ? LanguageCode.EN : LanguageCode.GU;

      const article = await newsService.getPublishedNewsBySlug(slug, language);

      const response: ApiResponse = {
        success: true,
        message: 'Published news article retrieved successfully.',
        data: article,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await newsService.listCategories();

      const response: ApiResponse = {
        success: true,
        message: 'News categories retrieved successfully.',
        data: categories,
        meta: { timestamp: new Date().toISOString() },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const newsController = new NewsController();
