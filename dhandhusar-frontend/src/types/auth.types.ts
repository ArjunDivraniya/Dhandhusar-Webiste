export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponseData {
  accessToken: string;
  user: User;
}

