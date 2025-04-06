import { apiClient } from '@/lib/api-client';
import { getSession } from 'next-auth/react';
import {
  ShareContentRequest,
  ShareContentResponse,
  SharedContentDetail,
  SharedContentMetrics,
} from '@/types/sharing';
import { AxiosRequestConfig } from 'axios';

const BASE_PATH = '/api/v1';

/**
 * Create a request config that prevents auth redirects
 */
const createNoRedirectRequestConfig = (token?: string): AxiosRequestConfig => {
  const config: AxiosRequestConfig = {
    headers: {
    }
  };
  
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  return config;
};

/**
 * Create shareable content with proper authentication handling
 */
export async function createShareableContent(data: any): Promise<any> {
  try {
    console.log('[SHARING] Creating shareable content with data:', {
      contentType: data.content_type,
      contentId: data.content_id,
      title: data.title
    });
    
    // First check localStorage for token (our main auth method)
    const localAccessToken = localStorage.getItem('access_token');
    
    // Get session to verify authentication as fallback
    const session = await getSession();
    console.log('[SHARING] Authentication check:', {
      hasSession: !!session,
      hasSessionToken: !!session?.accessToken,
      hasLocalToken: !!localAccessToken
    });
    
    // Use localStorage token first, then fall back to session token
    const token = localAccessToken || session?.accessToken;
    
    if (!token) {
      console.error('[SHARING] No active token found, authentication required for sharing');
      throw new Error('Authentication required');
    }
    
    // Use the createNoRedirectRequestConfig to prevent auth redirects
    const config = createNoRedirectRequestConfig(token);
    console.log('[SHARING] Using no-redirect config for API request');
    
    // Add additional safeguards
    config.headers = {
      ...config.headers,
      'X-Request-Type': 'share'
    };
    
    // Make API request with no-redirect config
    try {
      console.log('[SHARING] Making API request to /api/v1/deals/share');
      const response = await apiClient.post('/api/v1/deals/share', data, config);
      console.log('[SHARING] Successfully created shareable content:', response.data);
      return response.data;
    } catch (apiError: any) {
      console.error('[SHARING] API error status:', apiError.response?.status);
      console.error('[SHARING] API error data:', apiError.response?.data);
      
      // Check if this is an authentication error
      if (apiError.response?.status === 401) {
        throw apiError; // Let the outer catch handle authentication errors
      } else {
        // For other errors, throw with more details
        throw new Error(apiError.response?.data?.detail || apiError.message || 'API error creating shareable content');
      }
    }
  } catch (error: any) {
    console.error('[SHARING] Error creating shareable content:', error);
    
    // Check if this is an authentication error
    if (error.response?.status === 401) {
      console.log('[SHARING] Authentication error, user needs to log in');
      throw new Error('Authentication required for sharing content');
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'Failed to create shareable content');
  }
}

/**
 * Get shared content by token
 */
export async function getSharedContent(token: string): Promise<any> {
  try {
    console.log('Fetching shared content with token:', token);
    const response = await apiClient.get(`/api/v1/shared-public/${token}`);
    console.log('Successfully fetched shared content:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching shared content:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch shared content');
  }
}

/**
 * Clone shared content (for deals, goals, etc.)
 */
export async function cloneSharedContent(token: string, options: any = {}): Promise<any> {
  try {
    console.log('Cloning shared content with token:', token);
    
    // First check localStorage for auth token
    const localAccessToken = localStorage.getItem('access_token');
    
    // Get session to verify authentication as fallback
    const session = await getSession();
    
    // Use localStorage token first, then fall back to session token
    const authToken = localAccessToken || session?.accessToken;
    
    if (!authToken) {
      console.error('No active token found, authentication required for cloning');
      throw new Error('Authentication required');
    }
    
    // Use the createNoRedirectRequestConfig to prevent auth redirects
    const config = createNoRedirectRequestConfig(authToken);
    
    const response = await apiClient.post(`/api/v1/deals/share/${token}/clone`, options, config);
    console.log('Successfully cloned shared content:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error cloning shared content:', error);
    throw new Error(error.response?.data?.detail || 'Failed to clone shared content');
  }
}

/**
 * Get shared content by share ID (authenticated access)
 */
export const getSharedContentById = async (
  shareId: string
): Promise<SharedContentDetail> => {
  try {
    // First check localStorage for auth token
    const localAccessToken = localStorage.getItem('access_token');
    
    // Get session to verify authentication as fallback
    const session = await getSession();
    
    // Use localStorage token first, then fall back to session token
    const authToken = localAccessToken || session?.accessToken;
    
    if (!authToken) {
      throw new Error('Authentication required to access this content.');
    }
    
    const response = await apiClient.get(`${BASE_PATH}/deals/share/content/${shareId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching shared content:', error);
    throw error;
  }
};

/**
 * View shared content (public access)
 */
export const viewSharedContent = async (
  shareId: string
): Promise<SharedContentDetail> => {
  // No authentication needed for public endpoint
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
  try {
    const params = new URLSearchParams();
    params.append('offset', offset.toString());
    params.append('limit', limit.toString());
    if (contentType) {
      params.append('content_type', contentType);
    }
    
    // First check localStorage for auth token
    const localAccessToken = localStorage.getItem('access_token');
    
    // Get session to verify authentication as fallback
    const session = await getSession();
    
    // Use localStorage token first, then fall back to session token
    const authToken = localAccessToken || session?.accessToken;
    
    if (!authToken) {
      throw new Error('Authentication required to list your shared content.');
    }
    
    const response = await apiClient.get(`${BASE_PATH}/deals/share/list?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user shares:', error);
    throw error;
  }
};

/**
 * Get engagement metrics for a shared content item
 */
export const getShareMetrics = async (
  shareId: string
): Promise<SharedContentMetrics> => {
  try {
    // First check localStorage for auth token
    const localAccessToken = localStorage.getItem('access_token');
    
    // Get session to verify authentication as fallback
    const session = await getSession();
    
    // Use localStorage token first, then fall back to session token
    const authToken = localAccessToken || session?.accessToken;
    
    if (!authToken) {
      throw new Error('Authentication required to access metrics.');
    }
    
    const response = await apiClient.get(`${BASE_PATH}/deals/share/metrics/${shareId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching share metrics:', error);
    throw error;
  }
};

/**
 * Deactivate a share link
 */
export const deactivateShare = async (
  shareId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // First check localStorage for auth token
    const localAccessToken = localStorage.getItem('access_token');
    
    // Get session to verify authentication as fallback
    const session = await getSession();
    
    // Use localStorage token first, then fall back to session token
    const authToken = localAccessToken || session?.accessToken;
    
    if (!authToken) {
      throw new Error('Authentication required to deactivate shares.');
    }
    
    const response = await apiClient.delete(`${BASE_PATH}/deals/share/${shareId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deactivating share:', error);
    throw error;
  }
}; 