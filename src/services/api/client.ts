import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import { getSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

// Types
interface CustomSession extends Session {
  accessToken?: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
}

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    console.log('Making API request:', {
      method: config.method,
      url: config.url,
      data: config.data ? { ...config.data, password: config.data.password ? '***' : undefined } : undefined,
    });
    
    const session = await getSession() as CustomSession;
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('API response received:', {
      status: response.status,
      data: response.data,
    });
    
    const apiResponse: ApiResponse = response.data;
    return { ...response, data: apiResponse };
  },
  async (error: AxiosError<ApiResponse>) => {
    console.error('API error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Handle token expiration
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    }
    
    const errorResponse = {
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || error.response?.data?.detail || error.message || 'An unexpected error occurred',
      details: error.response?.data?.error?.details || error.response?.data,
    };

    console.error('Formatted error response:', errorResponse);
    return Promise.reject(errorResponse);
  }
);

// API request wrapper
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const url = config.url?.startsWith('/') ? config.url : `/${config.url}`;
    const response = await apiClient({
      ...config,
      url: `/api/${API_CONFIG.version}${url}`,
    });
    return response.data;
  } catch (error: any) {
    console.error('API request wrapper error:', error);
    throw error;
  }
};

export default apiClient; 