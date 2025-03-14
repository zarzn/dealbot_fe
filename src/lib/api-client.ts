import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/services/api/config';

/**
 * Custom error event for forced logout
 */
export const FORCE_LOGOUT_EVENT = 'force_logout';

/**
 * Create and configure the API client instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Add a request interceptor to inject auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage 
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') 
      : null;
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    
    // Log detailed error information
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401: // Unauthorized
          // Check if it's a refresh token failure
          if (originalRequest._retry) {
            // Token refresh failed, force logout
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
            }
          } else {
            // Try to refresh the token
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              
              if (refreshToken) {
                originalRequest._retry = true;
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                  refresh_token: refreshToken
                });
                
                if (response.data.access_token) {
                  localStorage.setItem('token', response.data.access_token);
                  apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
                  
                  // Retry the original request with the new token
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                  }
                  return apiClient(originalRequest);
                }
              } else {
                // No refresh token, force logout
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('token');
                  window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              // Force logout on refresh failure
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT));
              }
            }
          }
          break;
          
        case 403: // Forbidden
          console.error('Access forbidden:', error.response.data);
          break;
          
        case 404: // Not found
          console.error('Resource not found:', error.response.data);
          break;
          
        case 405: // Method not allowed
          console.error('Method not allowed. Check API endpoint configuration:', error.response.data);
          break;
          
        case 500: // Server error
        case 502: // Bad gateway
        case 503: // Service unavailable
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error('Unhandled error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response Error:', error.request);
    } else {
      // Error in setting up the request
      console.error('API Configuration Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 