import apiClient from './api/client';
import {
  ShareContentRequest,
  ShareContentResponse,
  SharedContentDetail,
  SharedContentMetrics,
} from '@/types/sharing';

const BASE_PATH = '/api/v1';

/**
 * Create shareable content (deal or search results)
 */
export const createShareableContent = async (
  data: ShareContentRequest
): Promise<ShareContentResponse> => {
  try {
    console.log('Making share API request:', data);
    
    // Log auth token status
    const authToken = localStorage.getItem('access_token');
    console.log('Auth token present:', !!authToken);
    if (authToken) {
      // Only log first few characters for security
      console.log('Auth token prefix:', authToken.substring(0, 10) + '...');
    }
    
    // Log headers being sent
    console.log('Request headers will include Authorization:', 
      !!authToken ? 'Bearer token will be added by interceptor' : 'No token available');
    
    const response = await apiClient.post(`${BASE_PATH}/deals/share`, data);
    console.log('Share API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Share API error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      
      // Check if this is an auth error and provide more context
      if (error.response.status === 401) {
        console.error('Authentication error - token might be missing or invalid');
        const authHeader = error.config?.headers?.Authorization;
        console.error('Auth header sent:', authHeader ? 'Yes' : 'No');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

/**
 * Get shared content by share ID (authenticated access)
 */
export const getSharedContent = async (
  shareId: string
): Promise<SharedContentDetail> => {
  const response = await apiClient.get(`${BASE_PATH}/deals/share/content/${shareId}`);
  return response.data;
};

/**
 * View shared content (public access)
 */
export const viewSharedContent = async (
  shareId: string
): Promise<SharedContentDetail> => {
  const response = await apiClient.get(`${BASE_PATH}/shared-public/${shareId}`);
  return response.data;
};

/**
 * List all shared content created by the current user
 */
export const listUserShares = async (
  offset: number = 0,
  limit: number = 20,
  contentType?: string
): Promise<ShareContentResponse[]> => {
  const params = new URLSearchParams();
  params.append('offset', offset.toString());
  params.append('limit', limit.toString());
  if (contentType) {
    params.append('content_type', contentType);
  }
  
  const response = await apiClient.get(`${BASE_PATH}/deals/share/list?${params.toString()}`);
  return response.data;
};

/**
 * Get engagement metrics for a shared content item
 */
export const getShareMetrics = async (
  shareId: string
): Promise<SharedContentMetrics> => {
  const response = await apiClient.get(`${BASE_PATH}/deals/share/metrics/${shareId}`);
  return response.data;
};

/**
 * Deactivate a share link
 */
export const deactivateShare = async (
  shareId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`${BASE_PATH}/deals/share/${shareId}`);
  return response.data;
}; 