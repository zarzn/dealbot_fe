import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create axios instance with default config
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  // Don't add auth header for auth-related endpoints
  if (config.url?.includes('/auth/')) {
    return config;
  }
  
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't handle auth errors for auth-related endpoints
    if (error.config?.url?.includes('/auth/')) {
      return Promise.reject(error);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Just reject the error and let the middleware handle the redirect
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api; 