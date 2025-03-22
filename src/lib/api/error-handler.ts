/**
 * Standardized API error handling utilities
 */
import { AxiosError } from 'axios';

export interface ApiError {
  status?: number;
  statusText?: string;
  data?: any;
  url?: string;
  method?: string;
  message: string;
}

/**
 * Handles API errors in a standardized way
 * 
 * @param error - The error from the API call
 * @param url - The URL that was called
 * @param method - The HTTP method used
 * @returns Standardized ApiError object
 */
export function handleApiError(error: unknown, url?: string, method?: string): ApiError {
  console.error(`API Error:`, error);
  
  if (error instanceof AxiosError) {
    return {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: url || error.config?.url,
      method: method || error.config?.method,
      message: getErrorMessage(error)
    };
  }
  
  return {
    url,
    method,
    message: error instanceof Error ? error.message : 'Unknown error occurred'
  };
}

/**
 * Extracts a user-friendly error message from an API error
 * 
 * @param error - The API error
 * @returns A user-friendly error message
 */
function getErrorMessage(error: AxiosError): string {
  // Prioritize backend error messages
  if (error.response?.data && typeof error.response.data === 'object') {
    if ('message' in error.response.data && typeof error.response.data.message === 'string') {
      return error.response.data.message;
    }
    
    if ('error' in error.response.data && typeof error.response.data.error === 'string') {
      return error.response.data.error;
    }
  }
  
  // Handle common HTTP status codes
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You need to log in to access this resource.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource might have been modified by another user.';
    case 422:
      return 'Validation error. Please check your input and try again.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

/**
 * Utility to check if an error is a network error
 * 
 * @param error - The error to check
 * @returns Whether the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
}

/**
 * Utility to check if an error is a timeout
 * 
 * @param error - The error to check
 * @returns Whether the error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.code === 'ECONNABORTED';
  }
  return false;
}

/**
 * Utility to check if an error is a server error (5xx)
 * 
 * @param error - The error to check
 * @returns Whether the error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response) {
    return error.response.status >= 500 && error.response.status < 600;
  }
  return false;
}

/**
 * Utility to check if an error is a client error (4xx)
 * 
 * @param error - The error to check
 * @returns Whether the error is a client error
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response) {
    return error.response.status >= 400 && error.response.status < 500;
  }
  return false;
} 