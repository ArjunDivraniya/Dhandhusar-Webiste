import type { ApiResponse, ApiError } from '../types/api.types.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Restore token from localStorage on boot
    this.accessToken = localStorage.getItem('dhandhusar_access_token');
  }

  public setToken(token: string | null): void {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('dhandhusar_access_token', token);
    } else {
      localStorage.removeItem('dhandhusar_access_token');
    }
  }

  public getToken(): string | null {
    return this.accessToken;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Needed for HttpOnly refresh cookie
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized (attempt token refresh once if not calling auth endpoints)
      if (
        response.status === 401 &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/refresh')
      ) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });

            if (refreshRes.ok) {
              const refreshData: ApiResponse<{ accessToken: string }> = await refreshRes.json();
              const newToken = refreshData.data?.accessToken;
              if (newToken) {
                this.setToken(newToken);
                this.isRefreshing = false;
                this.onRefreshed(newToken);

                // Retry original request with new token
                headers.set('Authorization', `Bearer ${newToken}`);
                const retryRes = await fetch(url, { ...config, headers });
                return this.handleResponse<T>(retryRes);
              }
            }
          } catch {
            // Refresh failed
          }

          this.isRefreshing = false;
          this.setToken(null);
          // Trigger redirect or auth state wipe if needed
          window.dispatchEvent(new CustomEvent('dhandhusar:session_expired'));
        } else {
          // Wait for the active refresh to finish
          return new Promise((resolve) => {
            this.addRefreshSubscriber(async (newToken) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              const retryRes = await fetch(url, { ...config, headers });
              resolve(this.handleResponse<T>(retryRes));
            });
          });
        }
      }

      return this.handleResponse<T>(response);
    } catch (err: unknown) {
      if ((err as ApiError).statusCode) {
        throw err;
      }
      const networkError: ApiError = {
        message: 'Unable to connect to the server. Please check your internet or server status.',
        code: 'NETWORK_ERROR',
      };
      throw networkError;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      json = {
        success: response.ok,
        message: response.statusText || 'An unexpected error occurred',
      };
    }

    if (!response.ok || !json.success) {
      const error: ApiError = {
        message: json.message || 'Request failed',
        code: json.error?.code,
        details: json.error?.details,
        statusCode: response.status,
      };
      throw error;
    }

    return json;
  }

  // Convenience helper methods
  public get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

