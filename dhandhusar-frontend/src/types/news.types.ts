export type LanguageCode = 'GU' | 'EN';

export type ContentStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'REJECTED';

export interface NewsCategory {
  id: string;
  slug: string;
  nameGu: string;
  nameEn: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsTranslation {
  id?: string;
  newsArticleId?: string;
  languageCode: LanguageCode;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentReview {
  id: string;
  entityType: string;
  entityId: string;
  reviewerId: string;
  fromStatus: ContentStatus;
  toStatus: ContentStatus;
  feedback: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NewsArticle {
  id: string;
  categoryId: string;
  authorId: string;
  status: ContentStatus;
  isPinned: boolean;
  featuredImage: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: NewsCategory;
  translations: NewsTranslation[];
  author?: {
    id: string;
    name: string;
    email: string;
  };
  reviews?: ContentReview[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminNewsFilters {
  status?: ContentStatus;
  categoryId?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateNewsInput {
  categoryId: string;
  isPinned?: boolean;
  featuredImage?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  expiresAt?: string | null;
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

export interface UpdateNewsInput {
  categoryId?: string;
  isPinned?: boolean;
  featuredImage?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  expiresAt?: string | null;
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
