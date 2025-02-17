import axios from 'axios';
import { signIn } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  token_balance: number;
  created_at: string;
  email_verified: boolean;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
});

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', data.email);
      formData.append('password', data.password);

      const response = await api.post(
        '/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Store tokens first
      this.setTokens(response.data);

      // Sign in with NextAuth and wait for the result
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        accessToken: response.data.access_token,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  async register(data: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      throw new Error(message);
    }
  },

  async requestMagicLink(email: string): Promise<void> {
    try {
      await api.post('/auth/magic-link', { email });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send magic link';
      throw new Error(message);
    }
  },

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/verify-magic-link', { token });
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid or expired magic link';
      throw new Error(message);
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to verify email';
      throw new Error(message);
    }
  },

  async handleSocialLogin(provider: string): Promise<void> {
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error: any) {
      throw new Error(`${provider} login failed`);
    }
  },

  async socialLogin(provider: string, token: string): Promise<AuthResponse> {
    try {
      const response = await api.post(`/auth/social/${provider}`, { token });
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Social login failed';
      throw new Error(message);
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Token refresh failed';
      throw new Error(message);
    }
  },

  // Helper methods for token management
  setTokens(tokens: AuthResponse): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
  }
}; 