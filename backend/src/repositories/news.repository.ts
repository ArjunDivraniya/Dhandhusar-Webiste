import {
  NewsArticle,
  NewsTranslation,
  LanguageCode,
  ContentStatus,
  Prisma,
  NewsCategory,
} from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { PaginatedResult, PaginationOptions } from './base.repository.js';

export interface LocalizedNewsArticle extends NewsArticle {
  translations: NewsTranslation[];
  category: NewsCategory;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NewsArticleWithDetails extends LocalizedNewsArticle {
  reviews?: Array<{
    id: string;
    fromStatus: ContentStatus;
    toStatus: ContentStatus;
    feedback: string | null;
    createdAt: Date;
    reviewer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface CreateNewsArticleInput {
  categoryId: string;
  authorId: string;
  status?: ContentStatus;
  isPinned?: boolean;
  featuredImage?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  publishedAt?: Date | null;
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
  };
}

export interface UpdateNewsArticleInput {
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

export interface AdminNewsFilters {
  status?: ContentStatus;
  categoryId?: string;
  authorId?: string;
  search?: string;
}

export interface PublicNewsFilters {
  categorySlug?: string;
  search?: string;
  sort?: 'newest' | 'oldest';
}

export class NewsRepository {
  /**
   * Find published articles for a given language, sorted by pinned first, then published date.
   * STRICT: Only returns articles where status = PUBLISHED, publishedAt <= now, and (expiresAt is null or > now).
   */
  public async findPublished(
    language: LanguageCode,
    options?: {
      filters?: PublicNewsFilters;
      pagination?: PaginationOptions;
    }
  ): Promise<PaginatedResult<LocalizedNewsArticle>> {
    const page = Math.max(1, options?.pagination?.page || 1);
    const limit = Math.min(50, Math.max(1, options?.pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const now = new Date();

    const where: Prisma.NewsArticleWhereInput = {
      status: ContentStatus.PUBLISHED,
      AND: [
        {
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: now } },
          ],
        },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
        // Must have translation in requested language
        {
          translations: {
            some: {
              languageCode: language,
            },
          },
        },
      ],
    };

    if (options?.filters?.categorySlug) {
      where.category = { slug: options.filters.categorySlug };
    }

    if (options?.filters?.search && options.filters.search.trim().length > 0) {
      const term = options.filters.search.trim();
      (where.AND as Prisma.NewsArticleWhereInput[]).push({
        translations: {
          some: {
            languageCode: language,
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { summary: { contains: term, mode: 'insensitive' } },
              { content: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      });
    }

    const sortOrder: Prisma.SortOrder = options?.filters?.sort === 'oldest' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: sortOrder },
          { createdAt: 'desc' },
        ],
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
   * Find a published article by its localized language slug.
   * STRICT: Only returns article if status = PUBLISHED and not expired.
   */
  public async findBySlug(
    slug: string,
    language: LanguageCode
  ): Promise<LocalizedNewsArticle | null> {
    const now = new Date();

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
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!translation) {
      return null;
    }

    const article = translation.newsArticle;

    // Verify publication status & validity
    if (article.status !== ContentStatus.PUBLISHED) {
      return null;
    }

    if (article.publishedAt && article.publishedAt > now) {
      return null;
    }

    if (article.expiresAt && article.expiresAt <= now) {
      return null;
    }

    return article;
  }

  /**
   * Admin: Find an article by ID with all translations, category, author info, and review history.
   */
  public async findByIdWithDetails(id: string): Promise<NewsArticleWithDetails | null> {
    const article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        category: true,
        translations: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!article) return null;

    // Fetch review history for this article
    const reviews = await prisma.contentReview.findMany({
      where: {
        entityType: 'NewsArticle',
        entityId: id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...article,
      reviews,
    };
  }

  /**
   * Admin: List all articles with administrative filters and pagination
   */
  public async findAdminArticles(
    filters?: AdminNewsFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<LocalizedNewsArticle>> {
    const page = Math.max(1, pagination?.page || 1);
    const limit = Math.min(100, Math.max(1, pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.NewsArticleWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      where.OR = [
        {
          translations: {
            some: {
              OR: [
                { title: { contains: term, mode: 'insensitive' } },
                { summary: { contains: term, mode: 'insensitive' } },
                { slug: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          category: true,
          translations: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
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
   * Check if a slug is already in use for a specific language
   */
  public async isSlugInUse(
    slug: string,
    language: LanguageCode,
    excludeArticleId?: string
  ): Promise<boolean> {
    const existing = await prisma.newsTranslation.findFirst({
      where: {
        slug,
        languageCode: language,
        ...(excludeArticleId ? { newsArticleId: { not: excludeArticleId } } : {}),
      },
    });

    return Boolean(existing);
  }

  /**
   * Create news article with initial translation (and optional additional translation)
   */
  public async createWithTranslations(data: CreateNewsArticleInput): Promise<LocalizedNewsArticle> {
    const translationsCreate: Prisma.NewsTranslationCreateWithoutNewsArticleInput[] = [
      {
        languageCode: data.initialTranslation.languageCode,
        title: data.initialTranslation.title,
        slug: data.initialTranslation.slug,
        summary: data.initialTranslation.summary,
        content: data.initialTranslation.content,
        seoTitle: data.initialTranslation.seoTitle,
        seoDescription: data.initialTranslation.seoDescription,
      },
    ];

    if (data.additionalTranslation) {
      translationsCreate.push({
        languageCode: data.additionalTranslation.languageCode,
        title: data.additionalTranslation.title,
        slug: data.additionalTranslation.slug,
        summary: data.additionalTranslation.summary,
        content: data.additionalTranslation.content,
        seoTitle: data.additionalTranslation.seoTitle,
        seoDescription: data.additionalTranslation.seoDescription,
      });
    }

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
          create: translationsCreate,
        },
      },
      include: {
        category: true,
        translations: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update article fields and upsert translations
   */
  public async updateArticle(
    id: string,
    data: UpdateNewsArticleInput
  ): Promise<LocalizedNewsArticle> {
    const updateData: Prisma.NewsArticleUpdateInput = {};

    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.isPinned !== undefined) {
      updateData.isPinned = data.isPinned;
    }
    if (data.featuredImage !== undefined) {
      updateData.featuredImage = data.featuredImage;
    }
    if (data.sourceUrl !== undefined) {
      updateData.sourceUrl = data.sourceUrl;
    }
    if (data.sourceName !== undefined) {
      updateData.sourceName = data.sourceName;
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt;
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update article base fields
      const updatedArticle = await tx.newsArticle.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          translations: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // 2. Upsert translations if provided
      if (data.translations && data.translations.length > 0) {
        for (const t of data.translations) {
          await tx.newsTranslation.upsert({
            where: {
              newsArticleId_languageCode: {
                newsArticleId: id,
                languageCode: t.languageCode,
              },
            },
            create: {
              newsArticleId: id,
              languageCode: t.languageCode,
              title: t.title,
              slug: t.slug,
              summary: t.summary,
              content: t.content,
              seoTitle: t.seoTitle,
              seoDescription: t.seoDescription,
            },
            update: {
              title: t.title,
              slug: t.slug,
              summary: t.summary,
              content: t.content,
              seoTitle: t.seoTitle,
              seoDescription: t.seoDescription,
            },
          });
        }
      }

      // Re-fetch complete localized article
      return tx.newsArticle.findUniqueOrThrow({
        where: { id },
        include: {
          category: true,
          translations: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  }

  /**
   * Update article status and publication timestamp
   */
  public async updateStatus(
    id: string,
    status: ContentStatus,
    publishedAt?: Date | null
  ): Promise<NewsArticle> {
    const data: Prisma.NewsArticleUpdateInput = { status };

    if (status === ContentStatus.PUBLISHED) {
      data.publishedAt = publishedAt || new Date();
    }

    return prisma.newsArticle.update({
      where: { id },
      data,
    });
  }

  // ==========================================
  // Category Queries
  // ==========================================

  public async findAllCategories(): Promise<NewsCategory[]> {
    return prisma.newsCategory.findMany({
      orderBy: { nameEn: 'asc' },
    });
  }

  public async findCategoryById(id: string): Promise<NewsCategory | null> {
    return prisma.newsCategory.findUnique({
      where: { id },
    });
  }

  public async findCategoryBySlug(slug: string): Promise<NewsCategory | null> {
    return prisma.newsCategory.findUnique({
      where: { slug },
    });
  }

  public async createCategory(data: {
    slug: string;
    nameGu: string;
    nameEn: string;
  }): Promise<NewsCategory> {
    return prisma.newsCategory.create({
      data,
    });
  }
}

export const newsRepository = new NewsRepository();
