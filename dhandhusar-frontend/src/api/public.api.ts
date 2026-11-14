import { apiClient } from './client.ts';
import type {
  NewsArticle,
  NewsCategory,
  PaginatedResult,
  PublicNewsQuery,
  LanguageCode,
} from '../types/news.types.ts';

export const publicApi = {
  /**
   * Fetch published news articles with language, category filter, search, and pagination.
   * Public read-only endpoint (only returns published, non-expired content).
   */
  async fetchPublishedNews(query: PublicNewsQuery = {}): Promise<PaginatedResult<NewsArticle>> {
    const params = new URLSearchParams();
    if (query.lang) params.set('lang', query.lang);
    if (query.category) params.set('category', query.category);
    if (query.search) params.set('search', query.search);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', query.page.toString());
    if (query.limit) params.set('limit', query.limit.toString());

    const queryString = params.toString();
    const endpoint = `/news${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<PaginatedResult<NewsArticle>>(endpoint);
    return res.data!;
  },

  /**
   * Fetch a single published news article by localized slug and language.
   */
  async fetchNewsBySlug(slug: string, lang: LanguageCode = 'GU'): Promise<NewsArticle> {
    const res = await apiClient.get<NewsArticle>(`/news/${encodeURIComponent(slug)}?lang=${lang}`);
    return res.data!;
  },

  /**
   * Fetch all news categories (bilingual names: nameGu & nameEn).
   */
  async fetchCategories(): Promise<NewsCategory[]> {
    const res = await apiClient.get<NewsCategory[]>('/news/categories');
    return res.data!;
  },
};

