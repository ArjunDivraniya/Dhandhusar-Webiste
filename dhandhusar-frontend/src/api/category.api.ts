import { apiClient } from './client.ts';
import type { NewsCategory } from '../types/news.types.ts';

export const categoryApi = {
  async listCategories(): Promise<NewsCategory[]> {
    const res = await apiClient.get<NewsCategory[]>('/news/categories');
    return res.data || [];
  },

  async createCategory(data: { slug: string; nameGu: string; nameEn: string }): Promise<NewsCategory> {
    const res = await apiClient.post<NewsCategory>('/news/admin/categories', data);
    return res.data!;
  },
};

