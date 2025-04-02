import axios from 'axios';
import { API_CONFIG } from './api/config';
import { apiClient } from '@/lib/api-client';
import { UserService, userService } from '@/services/users';
import { FORCE_LOGOUT_EVENT } from '@/lib/api-client';

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
      
      // Call backend API directly
      const response = await apiClient.post(
        '/api/v1/auth/login',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // Increase timeout to 30 seconds for login specifically
        }
      );

      console.log('Login successful, storing tokens');
      
      // Store tokens
      this.setTokens(response.data);
      
      // For debugging - log user info if available
      if (response.data.user) {
        console.log('User info received:', {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name
        });
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
      console.log('Request to /api/v1/auth/register:', {
        method: 'post',
        data: data
      });
      
      // Call backend API directly  
      const response = await apiClient.post('/api/v1/auth/register', data);
      console.log('Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('Response error:', error);
      const message = error.response?.data?.detail || 'Registration failed';
      throw new Error(message);
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('Logging out user');
      
      // Get stored tokens
      const accessToken = localStorage.getItem('access_token');
      
      if (accessToken) {
        // Call backend API to blacklist the token
        await apiClient.post('/api/v1/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
      
      // Clear tokens regardless of API success
      this.clearTokens();
      
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Still clear tokens on error
      this.clearTokens();
      
      // Rethrow for handling
      const message = error.response?.data?.detail || 'Logout failed';
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
      // Redirect to backend social auth endpoint
      window.location.href = `${API_CONFIG.baseURL}/api/v1/auth/social/${provider}`;
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
      
      // Store the new tokens
      this.setTokens(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // On refresh failure, clear tokens and user caches
      this.clearTokens();
      userService.clearCaches();
      
      // Dispatch the force logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
      }
      
      throw new Error('Failed to refresh token');
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

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      // Simple JWT expiry check (not perfect but helpful)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        localStorage.removeItem('access_token');
        return null;
      }
      
      return token;
    } catch (e) {
      console.error('Error parsing token:', e);
      localStorage.removeItem('access_token');
      return null;
    }
  },

  clearTokens(): void {
    console.log('Clearing authentication tokens');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Clear user service caches to ensure fresh data on next login
      userService.clearCaches();
    }
  },

  /**
   * Request a verification email to be sent to the user's email address
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(): Promise<void> {
    try {
      console.log('Requesting email verification');
      // Get user profile to access the email
      const profile = await userService.getProfile();
      
      // Send verification email
      await apiClient.post('/api/v1/auth/request-verification', {
        email: profile.email
      });
      console.log('Verification email request successful');
    } catch (error: any) {
      console.error('Verification email request error:', error);
      const message = error.response?.data?.detail || 'Failed to request verification email';
      throw new Error(message);
    }
  }
};

// Export function to get auth token for use in other services
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
} 