import {
  ContentStatus,
  LanguageCode,
  NewsArticle,
  NewsCategory,
} from '@prisma/client';
import { prisma } from '../config/prisma.js';
import {
  newsRepository,
  LocalizedNewsArticle,
  NewsArticleWithDetails,
  AdminNewsFilters,
  PublicNewsFilters,
} from '../repositories/news.repository.js';
import { publishingWorkflowService } from './publishingWorkflow.service.js';
import { AppError } from '../middlewares/errorHandler.js';
import { PaginationOptions, PaginatedResult } from '../repositories/base.repository.js';

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateNewsDraftDTO {
  categoryId: string;
  isPinned?: boolean;
  featuredImage?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  expiresAt?: Date | null;
  initialTranslation: {
    languageCode: LanguageCode;
    title: string;
    slug: string;
    summary?: string | null;
    content: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  };
  additionalTranslation?: {
    languageCode: LanguageCode;
    title: string;
    slug: string;
    summary?: string | null;
    content: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  } | null;
}

export interface UpdateNewsArticleDTO {
  categoryId?: string;
  isPinned?: boolean;
  featuredImage?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  expiresAt?: Date | null;
  translations?: Array<{
    languageCode: LanguageCode;
    title: string;
    slug: string;
    summary?: string | null;
    content: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  }>;
}

export class NewsService {
  /**
   * Create an initial news article draft with at least one localized translation
   */
  public async createDraft(
    authorId: string,
    data: CreateNewsDraftDTO,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    // 1. Verify category exists
    const category = await newsRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new AppError('News category not found.', 404, 'CATEGORY_NOT_FOUND');
    }

    // 2. Validate initial translation slug uniqueness
    const slugInUse = await newsRepository.isSlugInUse(
      data.initialTranslation.slug,
      data.initialTranslation.languageCode
    );
    if (slugInUse) {
      throw new AppError(
        `Slug '${data.initialTranslation.slug}' is already in use for language '${data.initialTranslation.languageCode}'.`,
        409,
        'SLUG_CONFLICT'
      );
    }

    // 3. Validate additional translation slug uniqueness if present
    if (data.additionalTranslation) {
      if (data.additionalTranslation.languageCode === data.initialTranslation.languageCode) {
        throw new AppError(
          'Initial and additional translations cannot share the same language code.',
          400,
          'DUPLICATE_LANGUAGE_IN_REQUEST'
        );
      }

      const additionalSlugInUse = await newsRepository.isSlugInUse(
        data.additionalTranslation.slug,
        data.additionalTranslation.languageCode
      );
      if (additionalSlugInUse) {
        throw new AppError(
          `Slug '${data.additionalTranslation.slug}' is already in use for language '${data.additionalTranslation.languageCode}'.`,
          409,
          'SLUG_CONFLICT'
        );
      }
    }

    // 4. Create article in DRAFT status
    const article = await newsRepository.createWithTranslations({
      categoryId: data.categoryId,
      authorId,
      status: ContentStatus.DRAFT,
      isPinned: data.isPinned || false,
      featuredImage: data.featuredImage,
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
      expiresAt: data.expiresAt,
      initialTranslation: data.initialTranslation,
      additionalTranslation: data.additionalTranslation || undefined,
    });

    // 5. Activity log
    await prisma.activityLog.create({
      data: {
        userId: authorId,
        action: 'NEWS_DRAFT_CREATED',
        entityType: 'NewsArticle',
        entityId: article.id,
        metadata: {
          categoryId: article.categoryId,
          initialLanguage: data.initialTranslation.languageCode,
          hasAdditionalTranslation: Boolean(data.additionalTranslation),
        },
        ipAddress: auditContext?.ipAddress || null,
        userAgent: auditContext?.userAgent || null,
      },
    });

    return article;
  }

  /**
   * Update article fields and localized translations.
   * Enforces policy on editing published content:
   * - Content Editors editing published content reverts status to PENDING_REVIEW to require editorial re-approval.
   * - Publishers and Super Admins may preserve PUBLISHED status or revert.
   */
  public async updateArticle(
    articleId: string,
    userId: string,
    userPermissions: string[],
    data: UpdateNewsArticleDTO,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    const existing = await newsRepository.findByIdWithDetails(articleId);
    if (!existing) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }

    // Category check
    if (data.categoryId) {
      const category = await newsRepository.findCategoryById(data.categoryId);
      if (!category) {
        throw new AppError('News category not found.', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Validate slugs for any incoming translations
    if (data.translations && data.translations.length > 0) {
      for (const t of data.translations) {
        const slugInUse = await newsRepository.isSlugInUse(
          t.slug,
          t.languageCode,
          articleId
        );
        if (slugInUse) {
          throw new AppError(
            `Slug '${t.slug}' is already in use for language '${t.languageCode}'.`,
            409,
            'SLUG_CONFLICT'
          );
        }
      }
    }

    const wasPublished = existing.status === ContentStatus.PUBLISHED;
    const canPublishDirectly = userPermissions.includes('news.publish') || userPermissions.includes('SUPER_ADMIN');

    // Update article base fields & translations
    let updatedArticle = await newsRepository.updateArticle(articleId, data);

    // Policy for editing published content:
    // If user lacks direct publish permission and content was published,
    // move back to PENDING_REVIEW to prevent unreviewed modifications from remaining live.
    if (wasPublished && !canPublishDirectly) {
      await prisma.$transaction(async (tx) => {
        await tx.newsArticle.update({
          where: { id: articleId },
          data: { status: ContentStatus.PENDING_REVIEW },
        });

        await publishingWorkflowService.recordStatusChange(tx, {
          entityType: 'NewsArticle',
          entityId: articleId,
          reviewerId: userId,
          currentStatus: ContentStatus.PUBLISHED,
          targetStatus: ContentStatus.PENDING_REVIEW,
          feedback: 'Content edited by editor; moved back to review before republishing.',
          actionName: 'NEWS_EDIT_REVERTED_TO_REVIEW',
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        });
      });

      const refreshed = await newsRepository.findByIdWithDetails(articleId);
      if (refreshed) updatedArticle = refreshed;
    } else {
      // Standard activity log for update
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'NEWS_UPDATED',
          entityType: 'NewsArticle',
          entityId: articleId,
          metadata: {
            updatedFields: Object.keys(data),
            wasPublished,
          },
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        },
      });
    }

    return updatedArticle;
  }

  /**
   * Submit an article draft or changes-requested article for Publisher review
   */
  public async submitForReview(
    articleId: string,
    userId: string,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    const article = await newsRepository.findByIdWithDetails(articleId);
    if (!article) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }

    // Status check
    if (
      article.status !== ContentStatus.DRAFT &&
      article.status !== ContentStatus.CHANGES_REQUESTED
    ) {
      throw new AppError(
        `Cannot submit article with status '${article.status}' for review. Only DRAFT or CHANGES_REQUESTED can be submitted.`,
        400,
        'INVALID_WORKFLOW_TRANSITION'
      );
    }

    // Completeness validation: Must have at least 1 translation with valid title, slug, content
    if (!article.translations || article.translations.length === 0) {
      throw new AppError(
        'Cannot submit article for review without at least one translation (Gujarati or English).',
        400,
        'INCOMPLETE_CONTENT'
      );
    }

    const hasValidTranslation = article.translations.some(
      (t) => t.title.trim().length >= 3 && t.slug.trim().length >= 2 && t.content.trim().length >= 10
    );

    if (!hasValidTranslation) {
      throw new AppError(
        'Article translations must have a valid title, slug, and non-empty body content.',
        400,
        'INCOMPLETE_CONTENT'
      );
    }

    // Atomic transaction: Update status + write review record + write activity log
    await prisma.$transaction(async (tx) => {
      await tx.newsArticle.update({
        where: { id: articleId },
        data: { status: ContentStatus.PENDING_REVIEW },
      });

      await publishingWorkflowService.recordStatusChange(tx, {
        entityType: 'NewsArticle',
        entityId: articleId,
        reviewerId: userId,
        currentStatus: article.status,
        targetStatus: ContentStatus.PENDING_REVIEW,
        feedback: 'Submitted for editorial review.',
        actionName: 'NEWS_SUBMITTED_FOR_REVIEW',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      });
    });

    const refreshed = await newsRepository.findByIdWithDetails(articleId);
    return refreshed!;
  }

  /**
   * Publisher approves and publishes news live
   */
  public async publishArticle(
    articleId: string,
    reviewerId: string,
    feedback?: string,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    const article = await newsRepository.findByIdWithDetails(articleId);
    if (!article) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }

    if (article.status !== ContentStatus.PENDING_REVIEW) {
      throw new AppError(
        `Only articles in PENDING_REVIEW status can be published. Current status: '${article.status}'.`,
        400,
        'INVALID_WORKFLOW_TRANSITION'
      );
    }

    // Content completeness check
    if (!article.translations || article.translations.length === 0) {
      throw new AppError(
        'Cannot publish an article without at least one valid translation.',
        400,
        'INCOMPLETE_CONTENT'
      );
    }

    // Atomic transaction: Update status to PUBLISHED, set publishedAt, record review & activity
    await prisma.$transaction(async (tx) => {
      await tx.newsArticle.update({
        where: { id: articleId },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: article.publishedAt || new Date(),
        },
      });

      await publishingWorkflowService.recordStatusChange(tx, {
        entityType: 'NewsArticle',
        entityId: articleId,
        reviewerId,
        currentStatus: ContentStatus.PENDING_REVIEW,
        targetStatus: ContentStatus.PUBLISHED,
        feedback: feedback || 'Article approved and published live.',
        actionName: 'NEWS_PUBLISHED',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      });
    });

    const refreshed = await newsRepository.findByIdWithDetails(articleId);
    return refreshed!;
  }

  /**
   * Publisher requests changes from editor with mandatory feedback comment
   */
  public async requestChanges(
    articleId: string,
    reviewerId: string,
    feedback: string,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    if (!feedback || feedback.trim().length < 5) {
      throw new AppError(
        'A constructive review comment (minimum 5 characters) is required when requesting changes.',
        400,
        'FEEDBACK_REQUIRED'
      );
    }

    const article = await newsRepository.findByIdWithDetails(articleId);
    if (!article) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }

    if (article.status !== ContentStatus.PENDING_REVIEW) {
      throw new AppError(
        `Cannot request changes on article with status '${article.status}'. Only PENDING_REVIEW articles can receive review feedback.`,
        400,
        'INVALID_WORKFLOW_TRANSITION'
      );
    }

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      await tx.newsArticle.update({
        where: { id: articleId },
        data: { status: ContentStatus.CHANGES_REQUESTED },
      });

      await publishingWorkflowService.recordStatusChange(tx, {
        entityType: 'NewsArticle',
        entityId: articleId,
        reviewerId,
        currentStatus: ContentStatus.PENDING_REVIEW,
        targetStatus: ContentStatus.CHANGES_REQUESTED,
        feedback: feedback.trim(),
        actionName: 'NEWS_CHANGES_REQUESTED',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      });
    });

    const refreshed = await newsRepository.findByIdWithDetails(articleId);
    return refreshed!;
  }

  /**
   * Publisher rejects content with mandatory reason
   */
  public async rejectArticle(
    articleId: string,
    reviewerId: string,
    reason: string,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    if (!reason || reason.trim().length < 5) {
      throw new AppError(
        'A clear rejection reason (minimum 5 characters) is required.',
        400,
        'REASON_REQUIRED'
      );
    }

    const article = await newsRepository.findByIdWithDetails(articleId);
    if (!article) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }

    if (article.status !== ContentStatus.PENDING_REVIEW) {
      throw new AppError(
        `Cannot reject article with status '${article.status}'. Only PENDING_REVIEW articles can be rejected.`,
        400,
        'INVALID_WORKFLOW_TRANSITION'
      );
    }

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      await tx.newsArticle.update({
        where: { id: articleId },
        data: { status: ContentStatus.REJECTED },
      });

      await publishingWorkflowService.recordStatusChange(tx, {
        entityType: 'NewsArticle',
        entityId: articleId,
        reviewerId,
        currentStatus: ContentStatus.PENDING_REVIEW,
        targetStatus: ContentStatus.REJECTED,
        feedback: reason.trim(),
        actionName: 'NEWS_REJECTED',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      });
    });

    const refreshed = await newsRepository.findByIdWithDetails(articleId);
    return refreshed!;
  }

  /**
   * Archive obsolete or deprecated article (from PUBLISHED or DRAFT)
   */
  public async archiveArticle(
    articleId: string,
    userId: string,
    auditContext?: AuditContext
  ): Promise<LocalizedNewsArticle> {
    const article = await newsRepository.findByIdWithDetails(articleId);
    if (!article) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }

    if (article.status === ContentStatus.ARCHIVED) {
      throw new AppError('Article is already archived.', 400, 'ALREADY_ARCHIVED');
    }

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      await tx.newsArticle.update({
        where: { id: articleId },
        data: { status: ContentStatus.ARCHIVED },
      });

      await publishingWorkflowService.recordStatusChange(tx, {
        entityType: 'NewsArticle',
        entityId: articleId,
        reviewerId: userId,
        currentStatus: article.status,
        targetStatus: ContentStatus.ARCHIVED,
        feedback: 'Article archived.',
        actionName: 'NEWS_ARCHIVED',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      });
    });

    const refreshed = await newsRepository.findByIdWithDetails(articleId);
    return refreshed!;
  }

  /**
   * Admin: Fetch single article by ID with complete details (all translations, category, review history)
   */
  public async getAdminArticleById(id: string): Promise<NewsArticleWithDetails> {
    const article = await newsRepository.findByIdWithDetails(id);
    if (!article) {
      throw new AppError('News article not found.', 404, 'ARTICLE_NOT_FOUND');
    }
    return article;
  }

  /**
   * Admin: List articles with filters and pagination
   */
  public async listAdminArticles(
    filters?: AdminNewsFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<LocalizedNewsArticle>> {
    return newsRepository.findAdminArticles(filters, pagination);
  }

  /**
   * Admin: List pending review articles specifically
   */
  public async listPendingReview(
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<LocalizedNewsArticle>> {
    return newsRepository.findAdminArticles(
      { status: ContentStatus.PENDING_REVIEW },
      pagination
    );
  }

  // ==========================================
  // Public Read-Only Endpoints
  // ==========================================

  /**
   * Public: List published articles for a given language.
   * STRICT GUARANTEE: Never exposes drafts, pending reviews, changes-requested, rejected, or archived items.
   */
  public async listPublishedNews(
    language: LanguageCode,
    options?: {
      categorySlug?: string;
      search?: string;
      sort?: 'newest' | 'oldest';
      pagination?: PaginationOptions;
    }
  ): Promise<PaginatedResult<LocalizedNewsArticle>> {
    return newsRepository.findPublished(language, {
      filters: {
        categorySlug: options?.categorySlug,
        search: options?.search,
        sort: options?.sort,
      },
      pagination: options?.pagination,
    });
  }

  /**
   * Public: Retrieve published article by language-specific slug.
   * STRICT GUARANTEE: Never returns unpublished content.
   */
  public async getPublishedNewsBySlug(
    slug: string,
    language: LanguageCode
  ): Promise<LocalizedNewsArticle> {
    const article = await newsRepository.findBySlug(slug, language);
    if (!article) {
      throw new AppError('News article not found.', 404, 'NOT_FOUND');
    }
    return article;
  }

  // ==========================================
  // Categories
  // ==========================================

  public async listCategories(): Promise<NewsCategory[]> {
    return newsRepository.findAllCategories();
  }

  public async createCategory(data: {
    slug: string;
    nameGu: string;
    nameEn: string;
  }): Promise<NewsCategory> {
    const existing = await newsRepository.findCategoryBySlug(data.slug);
    if (existing) {
      throw new AppError(
        `Category with slug '${data.slug}' already exists.`,
        409,
        'CATEGORY_SLUG_CONFLICT'
      );
    }
    return newsRepository.createCategory(data);
  }
}

export const newsService = new NewsService();
