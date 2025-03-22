/**
 * Search API client utilities for handling search requests
 */
import { SearchFilters, SearchResult } from '@/types/search';
import { apiClient } from './api-client';
import { handleApiError } from './error-handler';

/**
 * Search for deals with the given parameters
 * 
 * @param query The search query string
 * @param filters Optional search filters
 * @returns SearchResult containing the search results
 */
export async function searchDeals(
  query: string,
  filters?: Partial<SearchFilters>
): Promise<SearchResult> {
  try {
    const queryParams = new URLSearchParams();
    
    if (query) {
      queryParams.append('query', query);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<SearchResult>(
      `/api/v1/deals/search?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error searching deals:', error);
    throw handleApiError(error, '/api/v1/deals/search', 'get');
  }
}

/**
 * Save a search query for later use or notifications
 * 
 * @param name Name of the saved search
 * @param query The search query string
 * @param filters Optional search filters
 * @returns The created saved search object
 */
export async function saveSearch(
  name: string,
  query: string,
  filters?: Partial<SearchFilters>
): Promise<any> {
  try {
    const response = await apiClient.post('/api/v1/searches/save', {
      name,
      query,
      filters
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving search:', error);
    throw handleApiError(error, '/api/v1/searches/save', 'post');
  }
}

/**
 * Get search suggestions based on partial input
 * 
 * @param partialQuery Partial search query string
 * @returns Array of search suggestions
 */
export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  try {
    // Don't make API call for empty queries
    if (!partialQuery || partialQuery.trim().length < 2) {
      return [];
    }
    
    const response = await apiClient.get<string[]>(
      `/api/v1/searches/suggestions?query=${encodeURIComponent(partialQuery)}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return []; // Return empty array on error instead of throwing
  }
}

/**
 * Get user's search history
 * 
 * @param limit Maximum number of history items to return
 * @returns Array of search history items
 */
export async function getSearchHistory(limit = 10): Promise<any[]> {
  try {
    const response = await apiClient.get(`/api/v1/searches/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw handleApiError(error, '/api/v1/searches/history', 'get');
  }
}

/**
 * Delete a search history item
 * 
 * @param searchId ID of the search history item to delete
 */
export async function deleteSearchHistoryItem(searchId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/searches/history/${searchId}`);
  } catch (error) {
    console.error('Error deleting search history item:', error);
    throw handleApiError(error, `/api/v1/searches/history/${searchId}`, 'delete');
  }
} 