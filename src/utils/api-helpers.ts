import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { API_CONFIG } from '@/services/api/config';

export const isApiError = (error: any): error is AxiosError<ApiError> => {
  return error?.isAxiosError === true;
};

export const formatApiError = (error: any): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || 'An unexpected error occurred';
  }
  return error?.message || 'An unexpected error occurred';
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(`${key}[]`, String(item)));
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

export const handleApiError = (error: any): never => {
  const errorMessage = formatApiError(error);
  throw new Error(errorMessage);
};

export const parseApiResponse = <T>(response: any): T => {
  if (response?.status === 'success' && response?.data) {
    return response.data as T;
  }
  throw new Error('Invalid API response format');
};

/**
 * Check if the backend is available
 * @returns {Promise<boolean>} Returns true if backend responds, false otherwise
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    // Use a minimal endpoint like health check that doesn't require auth
    const response = await fetch(`${API_CONFIG.baseURL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout to quickly detect issues
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
}; 