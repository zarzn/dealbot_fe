import { API_BASE_URL, API_CONFIG, API_ENDPOINTS } from './api/config';
import { apiClient } from '@/lib/api-client';

// Function to get auth header for API requests
const getAuthHeader = () => {
  // Check if running on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
};

// Interface for pagination parameters
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// Interface for deal pagination response
export interface DealPaginationResponse {
  items: any[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Get deals with pagination
 * @param page Page number
 * @param pageSize Number of deals per page
 * @param filters Optional filters
 * @returns Paginated deals response
 */
export async function getDeals(
  page: number = 1, 
  pageSize: number = 10,
  filters?: Record<string, any>
): Promise<DealPaginationResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: pageSize.toString(),
      ...filters
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/deals?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch deals');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
}

// Interface for comparison options
export interface ComparisonOptions {
  comparison_type: string;
  criteria?: {
    price_weight?: number;
    feature_weight?: number;
    value_weight?: number;
    [key: string]: any;
  };
}

/**
 * Compare multiple deals based on specified criteria
 * @param dealIds List of deal IDs to compare
 * @param options Comparison options including type and criteria weights
 * @returns Comparison results
 */
export async function compareDealsByIds(
  dealIds: string[],
  options: ComparisonOptions
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/deals/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        deal_ids: dealIds,
        comparison_type: options.comparison_type,
        criteria: options.criteria || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to compare deals');
    }

    const data = await response.json();
    return data.comparison_result;
  } catch (error) {
    console.error('Error comparing deals:', error);
    throw error;
  }
} 