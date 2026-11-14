import { apiClient } from './client.ts';
import type {
  NewsArticle,
  PaginatedResult,
  AdminNewsFilters,
  CreateNewsInput,
  UpdateNewsInput,
} from '../types/news.types.ts';

export const newsApi = {
  async listAdminArticles(filters: AdminNewsFilters = {}): Promise<PaginatedResult<NewsArticle>> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.authorId) params.set('authorId', filters.authorId);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/news/admin/list${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<PaginatedResult<NewsArticle>>(endpoint);
    return res.data!;
  },

  async listPendingReview(page = 1, limit = 10): Promise<PaginatedResult<NewsArticle>> {
    const res = await apiClient.get<PaginatedResult<NewsArticle>>(
      `/news/admin/pending?page=${page}&limit=${limit}`
    );
    return res.data!;
  },

  async getAdminArticle(id: string): Promise<NewsArticle> {
    const res = await apiClient.get<NewsArticle>(`/news/admin/${id}`);
    return res.data!;
  },

  async createDraft(input: CreateNewsInput): Promise<NewsArticle> {
    const res = await apiClient.post<NewsArticle>('/news', input);
    return res.data!;
  },

  async updateArticle(id: string, input: UpdateNewsInput): Promise<NewsArticle> {
    const res = await apiClient.put<NewsArticle>(`/news/admin/${id}`, input);
    return res.data!;
  },

  async submitForReview(id: string): Promise<NewsArticle> {
    const res = await apiClient.post<NewsArticle>(`/news/admin/${id}/submit`);
    return res.data!;
  },

  async publishArticle(id: string, feedback?: string): Promise<NewsArticle> {
    const res = await apiClient.post<NewsArticle>(`/news/admin/${id}/publish`, { feedback });
    return res.data!;
  },

  async requestChanges(id: string, feedback: string): Promise<NewsArticle> {
    const res = await apiClient.post<NewsArticle>(`/news/admin/${id}/request-changes`, { feedback });
    return res.data!;
  },

  async rejectArticle(id: string, reason: string): Promise<NewsArticle> {
    const res = await apiClient.post<NewsArticle>(`/news/admin/${id}/reject`, { reason });
    return res.data!;
  },

  async archiveArticle(id: string): Promise<NewsArticle> {
    const res = await apiClient.post<NewsArticle>(`/news/admin/${id}/archive`);
    return res.data!;
  },
};

