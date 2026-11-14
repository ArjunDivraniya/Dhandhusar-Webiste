export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version?: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  statusCode?: number;
}

