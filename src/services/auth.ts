import axios from 'axios';
import { signIn } from 'next-auth/react';
import { API_CONFIG } from './api/config';

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
  baseURL: `${API_CONFIG.baseURL}/api/${API_CONFIG.version}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
});

// Log the API URL in development mode and in production for debugging
console.log('Auth Service API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  version: API_CONFIG.version,
  fullUrl: `${API_CONFIG.baseURL}/api/${API_CONFIG.version}`
});

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Login attempt with:', { email: data.email });
      
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

      console.log('Login successful, storing tokens');
      
      // Store tokens first
      this.setTokens(response.data);

      // Sign in with NextAuth and wait for the result
      console.log('Signing in with NextAuth');
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        accessToken: response.data.access_token,
      });

      if (result?.error) {
        console.error('NextAuth sign in error:', result.error);
        throw new Error(result.error);
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  async register(data: RegisterRequest): Promise<UserResponse> {
    try {
      console.log('Registration attempt with:', { email: data.email, name: data.name });
      console.log('Request to /auth/register:', {
        method: 'post',
        headers: api.defaults.headers,
        data: data
      });
      
      const response = await api.post('/auth/register', data);
      console.log('Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('Response error:', error);
      const message = error.response?.data?.detail || 'Registration failed';
      throw new Error(message);
    }
  },

  async requestMagicLink(email: string): Promise<void> {
    try {
      console.log('Requesting magic link for:', email);
      await api.post('/auth/magic-link', { email });
      console.log('Magic link request successful');
    } catch (error: any) {
      console.error('Magic link request error:', error);
      const message = error.response?.data?.detail || 'Failed to send magic link';
      throw new Error(message);
    }
  },

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    try {
      console.log('Verifying magic link with token');
      const response = await api.post('/auth/verify-magic-link', { token });
      console.log('Magic link verification successful');
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Magic link verification error:', error);
      const message = error.response?.data?.detail || 'Invalid or expired magic link';
      throw new Error(message);
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      console.log('Verifying email with token');
      await api.post('/auth/verify-email', { token });
      console.log('Email verification successful');
    } catch (error: any) {
      console.error('Email verification error:', error);
      const message = error.response?.data?.detail || 'Failed to verify email';
      throw new Error(message);
    }
  },

  async handleSocialLogin(provider: string): Promise<void> {
    try {
      console.log('Initiating social login with provider:', provider);
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error: any) {
      console.error('Social login error:', error);
      throw new Error(`${provider} login failed`);
    }
  },

  async socialLogin(provider: string, token: string): Promise<AuthResponse> {
    try {
      console.log('Processing social login for provider:', provider);
      const response = await api.post(`/auth/social/${provider}`, { token });
      console.log('Social login successful');
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Social login processing error:', error);
      const message = error.response?.data?.detail || 'Social login failed';
      throw new Error(message);
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('Refreshing token');
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      console.log('Token refresh successful');
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      const message = error.response?.data?.detail || 'Token refresh failed';
      throw new Error(message);
    }
  },

  // Helper methods for token management
  setTokens(tokens: AuthResponse): void {
    console.log('Setting tokens in localStorage and API headers');
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  clearTokens(): void {
    console.log('Clearing tokens from localStorage and API headers');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
  }
}; 