import { z } from 'zod';
import { LanguageCode, ContentStatus } from '@prisma/client';

export const translationItemSchema = z.object({
  languageCode: z.nativeEnum(LanguageCode, {
    errorMap: () => ({ message: "languageCode must be either 'GU' (Gujarati) or 'EN' (English)" }),
  }),
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(255, 'Title cannot exceed 255 characters'),
  slug: z
    .string({ required_error: 'Slug is required' })
    .trim()
    .min(2, 'Slug must be at least 2 characters long')
    .max(255, 'Slug cannot exceed 255 characters')
    .regex(/^[a-z0-9-]+$/i, 'Slug must contain only letters, numbers, and hyphens'),
  summary: z
    .string()
    .trim()
    .max(1000, 'Summary cannot exceed 1000 characters')
    .optional()
    .nullable(),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(10, 'Content must be at least 10 characters long'),
  seoTitle: z
    .string()
    .trim()
    .max(255, 'SEO title cannot exceed 255 characters')
    .optional()
    .nullable(),
  seoDescription: z
    .string()
    .trim()
    .max(500, 'SEO description cannot exceed 500 characters')
    .optional()
    .nullable(),
});

export const createNewsDraftSchema = z.object({
  categoryId: z.string({ required_error: 'Category ID is required' }).uuid('Invalid Category UUID'),
  isPinned: z.boolean().optional().default(false),
  featuredImage: z.string().trim().url('Invalid URL for featured image').optional().nullable(),
  sourceUrl: z.string().trim().url('Invalid URL for source').optional().nullable(),
  sourceName: z.string().trim().max(100, 'Source name cannot exceed 100 characters').optional().nullable(),
  expiresAt: z.string().datetime({ message: 'expiresAt must be a valid ISO 8601 datetime' }).optional().nullable(),
  initialTranslation: translationItemSchema,
  additionalTranslation: translationItemSchema.optional().nullable(),
});

export const updateNewsSchema = z.object({
  categoryId: z.string().uuid('Invalid Category UUID').optional(),
  isPinned: z.boolean().optional(),
  featuredImage: z.string().trim().url('Invalid URL for featured image').optional().nullable(),
  sourceUrl: z.string().trim().url('Invalid URL for source').optional().nullable(),
  sourceName: z.string().trim().max(100, 'Source name cannot exceed 100 characters').optional().nullable(),
  expiresAt: z.string().datetime({ message: 'expiresAt must be a valid ISO 8601 datetime' }).optional().nullable(),
  translations: z.array(translationItemSchema).optional(),
});

export const reviewFeedbackSchema = z.object({
  feedback: z
    .string({ required_error: 'Review feedback is required' })
    .trim()
    .min(5, 'Review feedback must be at least 5 characters long')
    .max(2000, 'Feedback cannot exceed 2000 characters'),
});

export const publishNewsSchema = z.object({
  feedback: z.string().trim().max(1000).optional().nullable(),
});

export const rejectNewsSchema = z.object({
  reason: z
    .string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(5, 'Rejection reason must be at least 5 characters long')
    .max(2000, 'Reason cannot exceed 2000 characters'),
});

export const publicNewsQuerySchema = z.object({
  lang: z
    .enum(['GU', 'EN'])
    .optional()
    .default('GU')
    .transform((val) => val as LanguageCode),
  category: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminNewsQuerySchema = z.object({
  status: z.nativeEnum(ContentStatus).optional(),
  categoryId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createCategorySchema = z.object({
  slug: z
    .string({ required_error: 'Slug is required' })
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  nameGu: z
    .string({ required_error: 'Gujarati category name is required' })
    .trim()
    .min(2, 'Gujarati name must be at least 2 characters'),
  nameEn: z
    .string({ required_error: 'English category name is required' })
    .trim()
    .min(2, 'English name must be at least 2 characters'),
});

