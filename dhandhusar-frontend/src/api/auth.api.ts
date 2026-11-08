import { apiClient } from './client.ts';
import type { User, LoginCredentials, AuthResponseData } from '../types/auth.types.ts';
import type { ApiResponse } from '../types/api.types.ts';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const res = await apiClient.post<AuthResponseData>('/auth/login', credentials);
    if (res.data?.accessToken) {
      apiClient.setToken(res.data.accessToken);
    }
    return res.data!;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me');
    return res.data!;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return apiClient.post('/auth/change-password', data);
  },
};
