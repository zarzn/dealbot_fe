import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/services/api/config';
import { toast } from 'react-hot-toast';

/**
 * Custom error event for forced logout
 */
export const FORCE_LOGOUT_EVENT = 'force-logout';

/**
 * Create and configure the API client instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increase default timeout to 30 seconds
  withCredentials: true, // Ensure cookies are sent with requests
});

// Track if we're currently refreshing a token to prevent duplicate refreshes
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Queue of requests to retry after token refresh
const failedRequestsQueue: { onSuccess: (token: string) => void, onFailure: (err: any) => void }[] = [];

// Process the failed requests queue
const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach(request => {
    if (token) {
      request.onSuccess(token);
    } else {
      request.onFailure(error);
    }
  });
  
  // Clear the queue
  failedRequestsQueue.length = 0;
};

/**
 * Add a request interceptor to inject auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding auth token for public endpoints
    const isPublicEndpoint = config.url?.includes('/public-deals') || 
                          config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register');
                          
    if (!isPublicEndpoint) {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Add a response interceptor to handle common errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Special handling for token expiration errors
    if (error.response?.data && 
        typeof error.response.data === 'object' && 
        'code' in error.response.data && 
        error.response.data.code === 'token_expired') {
      
      console.error('Token expired, forcing logout');
      
      // Clear auth state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Dispatch force logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
        // Redirect to login
        window.location.href = '/auth/signin?reason=session_expired';
      }
      
      return Promise.reject(error);
    }
    
    // If in development mode and error is 401/403 related to auth, use mock data
    if (process.env.NODE_ENV === 'development' && 
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Auth error in development - this would normally trigger a token refresh');
      // For some endpoints, we'll just continue with mock data in the services
      return Promise.reject(error);
    }
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If we're already refreshing, wait for that to complete
      if (isRefreshing) {
        try {
          // Wait for the current refresh to complete
          const newToken = await refreshPromise;
          // Update the request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Handle token refresh failure
          console.error('Failed to refresh token:', refreshError);
          // Clear auth state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Dispatch force logout event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
            // Redirect to login
            window.location.href = '/auth/signin?reason=session_expired';
          }
          
          return Promise.reject(refreshError);
        }
      }
      
      // Start token refresh process
      isRefreshing = true;
      refreshPromise = new Promise(async (resolve, reject) => {
        try {
          // Get refresh token from localStorage
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Call refresh token endpoint
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          // Get new tokens
          const { access_token, refresh_token } = response.data;
          
          // Update localStorage
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Process any queued requests
          processQueue(null, access_token);
          
          // Resolve the promise with the new token
          resolve(access_token);
        } catch (refreshError) {
          // Token refresh failed
          console.error('Token refresh failed:', refreshError);
          
          // Clear auth state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Process the queue with error
          processQueue(refreshError);
          
          // Reject the promise
          reject(refreshError);
          
          // Dispatch force logout event and redirect to login
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
            window.location.href = '/auth/signin?reason=session_expired';
          }
        } finally {
          // Reset refresh state
          isRefreshing = false;
          refreshPromise = null;
        }
      });
      
      // Return the retried request
      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, reject the original request
        return Promise.reject(refreshError);
      }
    }
    
    // For development mode, log additional helpful information
    if (process.env.NODE_ENV === 'development') {
      // Log more information about the error for debugging
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: originalRequest?.url,
        method: originalRequest?.method,
      });
      
      // Show a more specific error message in development
      const errorData = error.response?.data as any;
      if (errorData?.detail) {
        console.warn(`API Error ${error.response?.status}: ${errorData.detail}`);
      }
    }
    
    // For server errors in production, show a friendly message
    if (error.response?.status >= 500 && process.env.NODE_ENV === 'production') {
      toast.error('Server error. Our team has been notified.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 