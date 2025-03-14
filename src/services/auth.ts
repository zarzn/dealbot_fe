import axios from 'axios';
import { signIn } from 'next-auth/react';
import { API_CONFIG } from './api/config';
import { apiClient } from '@/lib/api-client';

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
      
      // OAuth2PasswordRequestForm requires username (not email) and password in form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('username', data.email); // Backend expects username field but we use email
      formData.append('password', data.password);
      
      // Use the full path with API prefix as required by the backend
      const response = await apiClient.post(
        '/api/v1/auth/login',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Login successful, storing tokens');
      
      // Store tokens
      this.setTokens(response.data);

      // No longer need to call signIn here, will do that in the component
      console.log('Returning tokens for NextAuth sign-in');
      
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
      console.log('Request to /api/v1/auth/register:', {
        method: 'post',
        data: data
      });
      
      const response = await apiClient.post('/api/v1/auth/register', data);
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
      await apiClient.post('/api/v1/auth/magic-link', { email });
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
      const response = await apiClient.post('/api/v1/auth/verify-magic-link', { token });
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
      await apiClient.post('/api/v1/auth/verify-email', { token });
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
      const response = await apiClient.post(`/api/v1/auth/social/${provider}`, { token });
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
      const response = await apiClient.post('/api/v1/auth/refresh', {
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
    
    // Clear token from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear API authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Also clear any custom headers that might have auth tokens
    if (api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['x-access-token'];
    }
    
    // Attempt to call the signout API to clear server-side cookies
    try {
      const signoutUrl = `${API_CONFIG.baseURL}/api/v1/auth/signout`;
      console.log('Making signout request to:', signoutUrl);
      
      fetch(signoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(e => console.error('Error calling signout API:', e));
    } catch (e) {
      // Ignore errors in this background process
      console.error('Failed to call signout API:', e);
    }
    
    console.log('Token cleanup complete');
  }
};

// Export function to get auth token for use in other services
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
} 