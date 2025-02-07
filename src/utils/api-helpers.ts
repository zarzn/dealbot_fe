import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

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