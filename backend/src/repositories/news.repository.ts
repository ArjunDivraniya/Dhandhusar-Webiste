import {
  NewsArticle,
  NewsTranslation,
  LanguageCode,
  ContentStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { PaginatedResult, PaginationOptions } from './base.repository.js';

export interface LocalizedNewsArticle extends NewsArticle {
  translations: NewsTranslation[];
  category: {
    id: string;
    slug: string;
    nameGu: string;
    nameEn: string;
  };
}

export interface CreateNewsArticleInput {
  categoryId: string;
  authorId: string;
  status?: ContentStatus;
  isPinned?: boolean;
  featuredImage?: string;
  sourceUrl?: string;
  sourceName?: string;
  publishedAt?: Date;
  expiresAt?: Date;
  initialTranslation: {
    languageCode: LanguageCode;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

export interface UpsertTranslationInput {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

export class NewsRepository {
  /**
   * Find published articles for a given language, sorted by pinned first, then published date
   */
  public async findPublished(
    language: LanguageCode,
    options?: {
      categorySlug?: string;
      pagination?: PaginationOptions;
    }
  ): Promise<PaginatedResult<LocalizedNewsArticle>> {
    const page = Math.max(1, options?.pagination?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.NewsArticleWhereInput = {
      status: ContentStatus.PUBLISHED,
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } },
      ],
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    };

    if (options?.categorySlug) {
      where.category = { slug: options.categorySlug };
    }

    const [total, items] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          category: true,
          translations: {
            where: { languageCode: language },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a published article by its localized language slug
   */
  public async findBySlug(
    slug: string,
    language: LanguageCode
  ): Promise<LocalizedNewsArticle | null> {
    const translation = await prisma.newsTranslation.findUnique({
      where: {
        languageCode_slug: {
          languageCode: language,
          slug,
        },
      },
      include: {
        newsArticle: {
          include: {
            category: true,
            translations: true,
          },
        },
      },
    });

    if (!translation || translation.newsArticle.status !== ContentStatus.PUBLISHED) {
      return null;
    }

    return translation.newsArticle;
  }

  /**
   * Find an article by ID with all translations attached (useful for admin review / editing)
   */
  public async findByIdWithAllTranslations(id: string): Promise<LocalizedNewsArticle | null> {
    return prisma.newsArticle.findUnique({
      where: { id },
      include: {
        category: true,
        translations: true,
      },
    });
  }

  /**
   * Atomically create a news article and its initial localized translation
   */
  public async createWithTranslation(data: CreateNewsArticleInput): Promise<LocalizedNewsArticle> {
    return prisma.newsArticle.create({
      data: {
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status || ContentStatus.DRAFT,
        isPinned: data.isPinned || false,
        featuredImage: data.featuredImage,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
        publishedAt: data.publishedAt,
        expiresAt: data.expiresAt,
        translations: {
          create: {
            languageCode: data.initialTranslation.languageCode,
            title: data.initialTranslation.title,
            slug: data.initialTranslation.slug,
            summary: data.initialTranslation.summary,
            content: data.initialTranslation.content,
            seoTitle: data.initialTranslation.seoTitle,
            seoDescription: data.initialTranslation.seoDescription,
          },
        },
      },
      include: {
        category: true,
        translations: true,
      },
    });
  }

  /**
   * Add or update a localized translation for an existing article
   */
  public async upsertTranslation(
    articleId: string,
    language: LanguageCode,
    data: UpsertTranslationInput
  ): Promise<NewsTranslation> {
    return prisma.newsTranslation.upsert({
      where: {
        newsArticleId_languageCode: {
          newsArticleId: articleId,
          languageCode: language,
        },
      },
      create: {
        newsArticleId: articleId,
        languageCode: language,
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
      update: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });
  }

  /**
   * Update the publication status of an article (e.g. DRAFT -> PENDING_REVIEW -> PUBLISHED)
   */
  public async updateStatus(id: string, status: ContentStatus): Promise<NewsArticle> {
    return prisma.newsArticle.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }
}

export const newsRepository = new NewsRepository();

