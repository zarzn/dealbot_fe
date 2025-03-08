import axios from 'axios';

// Always use environment variable with explicit fallback URL for production
// HARDCODED PRODUCTION URL - this will be used as a fallback
const PRODUCTION_API_URL = 'https://7oxq7ujcmc.execute-api.us-east-1.amazonaws.com/prod';

// First, check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Use environment variable if available, otherwise fallback to hardcoded production URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// In browser environments, always use production URL unless explicitly in development mode
const finalApiUrl = isBrowser && !isDevelopment ? PRODUCTION_API_URL : API_URL;

// Log the API URL in development mode
if (isDevelopment) {
  console.log('API Client using URL:', finalApiUrl);
}

// If we're in production and the API_URL is not set, log a warning but use the hardcoded production URL
if (!isDevelopment && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL not found in environment, using fallback production API URL');
}

console.log('Creating API client with baseURL:', finalApiUrl, 'NODE_ENV:', process.env.NODE_ENV);

export const apiClient = axios.create({
  baseURL: finalApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Special handling for search endpoint - don't retry with auth for this endpoint
    if (originalRequest.url?.includes('/api/v1/deals/search') && error.response?.status === 401) {
      // Just return the error for search endpoint - will be handled by the service layer
      return Promise.reject(error);
    }

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Only attempt to refresh if we have a refresh token
        if (refreshToken) {
          try {
            const response = await axios.post(`${finalApiUrl}/api/v1/auth/refresh-token`, {
              refresh_token: refreshToken, // Use correct parameter name
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // If refresh token endpoint fails, just clear tokens but don't redirect
            console.error('Token refresh failed:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
        
        // If no refresh token or refresh failed, continue without authentication
        // Remove any Authorization header to ensure request proceeds as unauthenticated
        if (originalRequest.headers.Authorization) {
          delete originalRequest.headers.Authorization;
        }
        
        // Try the request again without auth headers
        return apiClient(originalRequest);
        
      } catch (error) {
        // If refresh token fails, clear tokens but don't redirect
        // This allows the request to continue as unauthenticated
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Remove Authorization header and retry the request
        if (originalRequest.headers.Authorization) {
          delete originalRequest.headers.Authorization;
        }
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
); 