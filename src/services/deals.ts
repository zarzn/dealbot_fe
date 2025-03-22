import { apiClient } from '@/lib/api-client';
import type { DealSuggestion, AIAnalysis, PriceHistory, DealSearch, DealResponse, CreateDealRequest, UpdateDealRequest } from '@/types/deals';

/**
 * Interface for search response from the deals API
 */
export interface SearchResponse {
  deals: DealResponse[];
  total?: number;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
  metadata?: {
    scraping_attempted?: boolean;
    scraping_success?: boolean;
    real_time_search?: boolean;
    search_time_ms?: number;
    data_sources?: string[];
    [key: string]: any;
  };
}

/**
 * Service for interacting with the deals API endpoints
 */
export class DealsService {
  private readonly BASE_URL = '/api/v1/deals';

  /**
   * Search for deals based on query criteria
   * @param query The search parameters
   * @returns Promise with search results
   */
  async searchDeals(query: DealSearch): Promise<SearchResponse> {
    try {
      // Enhanced debug logging
      console.log('🔍 [DealsService] searchDeals called with:', {
        query: query.query,
        category: query.category,
        page: query.page,
        pageSize: query.page_size || query.limit,
        filters: query.filters
      });
      
      // Log the request details in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Making DealsService.searchDeals request to:', `${this.BASE_URL}/search`);
        console.log('Using apiClient with baseURL:', apiClient.defaults.baseURL);
        console.log('Query parameters:', query);
      }
      
      // Support both GET and POST search patterns
      let response;
      if (query.query || query.perform_ai_analysis) {
        // Use POST for more complex searches
        console.log('🔍 [DealsService] Using POST method for search');
        response = await apiClient.post(`${this.BASE_URL}/search`, query);
      } else {
        // Use GET with query params for simple searches
        const queryParams = new URLSearchParams();
        if (query.category) queryParams.append('category', query.category);
        if (query.min_price) queryParams.append('min_price', query.min_price.toString());
        if (query.max_price) queryParams.append('max_price', query.max_price.toString());
        if (query.sort_by) queryParams.append('sort_by', query.sort_by);
        if (query.page) queryParams.append('page', query.page.toString());
        if (query.limit) queryParams.append('limit', query.limit.toString());
        if (query.page_size) queryParams.append('page_size', query.page_size.toString());
        
        console.log('🔍 [DealsService] Using GET method for search with params:', queryParams.toString());
        response = await apiClient.get(`${this.BASE_URL}/search?${queryParams.toString()}`);
      }
      
      // Log the response for debugging
      console.log('🔍 [DealsService] Search response received:', {
        totalDeals: response.data.deals?.length,
        totalCount: response.data.total,
        page: query.page
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching deals:', error);
      throw error;
    }
  }

  /**
   * Get similar deals based on a deal ID
   * @param dealId The ID of the deal to find similar deals for
   * @returns Promise with similar deals
   */
  async getSimilarDeals(dealId: string): Promise<DealResponse[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/similar`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar deals:', error);
      throw error;
    }
  }

  /**
   * Get price history for a deal
   * @param dealId Deal ID
   * @param timeRange Optional time range (e.g., '30d', '90d')
   * @returns Promise with price history data
   */
  async getDealPriceHistory(dealId: string, timeRange: string = '30d'): Promise<PriceHistory> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/price-history?time_range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting price history for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Alias for getDealPriceHistory to maintain compatibility with existing code
   * @param dealId Deal ID
   * @param timeRange Optional time range (e.g., '30d', '90d')
   * @returns Promise with price history data
   */
  async getPriceHistory(dealId: string, timeRange: string = '30d'): Promise<PriceHistory> {
    return this.getDealPriceHistory(dealId, timeRange);
  }

  /**
   * Get all deals with optional filtering
   * @param filters Optional filters for the deals
   * @param page Page number
   * @param pageSize Items per page
   * @returns Promise with deals list
   */
  async getDeals(
    filters: any = {}, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<DealResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', page.toString());
      queryParams.append('page_size', pageSize.toString());
      
      // Add filters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.price_min) queryParams.append('price_min', filters.price_min.toString());
      if (filters.price_max) queryParams.append('price_max', filters.price_max.toString());
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
      
      // Check if user is authenticated by looking for token
      const hasAuthToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
      
      // Use the new public endpoint when not authenticated
      const endpoint = hasAuthToken ? `${this.BASE_URL}` : `/api/v1/public-deals`;
      
      const response = await apiClient.get(`${endpoint}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting deals:', error);
      throw error;
    }
  }

  /**
   * Get a specific deal by ID
   * @param dealId The ID of the deal
   * @returns Promise with the deal
   */
  async getDealById(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Alias for getDealById to maintain compatibility with existing code
   * @param dealId The ID of the deal
   * @returns Promise with the deal
   */
  async getDealDetails(dealId: string): Promise<DealResponse> {
    return this.getDealById(dealId);
  }

  /**
   * Create a new deal
   * @param dealData The deal data to create
   * @returns Promise with the created deal
   */
  async createDeal(dealData: CreateDealRequest): Promise<DealResponse> {
    try {
      console.log('Creating new deal with data:', dealData);
      const response = await apiClient.post(`${this.BASE_URL}`, dealData);
      return response.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update an existing deal
   * @param dealId The ID of the deal to update
   * @param dealData The updated deal data
   * @returns Promise with the updated deal
   */
  async updateDeal(dealId: string, dealData: UpdateDealRequest): Promise<DealResponse> {
    try {
      console.log(`Updating deal ${dealId} with data:`, dealData);
      const response = await apiClient.put(`${this.BASE_URL}/${dealId}`, dealData);
      return response.data;
    } catch (error) {
      console.error(`Error updating deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a deal
   * @param dealId The ID of the deal to delete
   */
  async deleteDeal(dealId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${dealId}`);
    } catch (error) {
      console.error(`Error deleting deal ${dealId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get AI analysis for a deal
   * @param dealId Deal ID
   * @returns Promise with AI analysis data
   */
  async getDealAnalysis(dealId: string): Promise<AIAnalysis> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/analysis`);
      return response.data;
    } catch (error) {
      console.error(`Error getting analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Request a new AI analysis for a deal
   * This is a premium feature that consumes tokens, with the first analysis being free
   * @param dealId Deal ID
   * @returns Promise with AI analysis request status
   */
  async analyzeDeal(dealId: string): Promise<AIAnalysis> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/analyze`);
      return response.data;
    } catch (error) {
      console.error(`Error requesting analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh a deal's information from its source
   * @param dealId Deal ID
   * @returns Promise with the updated deal
   */
  async refreshDeal(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/refresh`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh AI analysis for a deal
   * @param dealId Deal ID
   * @returns Promise with the updated deal including fresh analysis
   */
  async refreshDealAnalysis(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/analyze`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Validate a deal
   * @param dealId Deal ID
   * @returns Promise with validation result
   */
  async validateDeal(dealId: string): Promise<{is_valid: boolean; validation_details: any}> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/validate`, {});
      return response.data;
    } catch (error) {
      console.error(`Error validating deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Track a deal (start monitoring)
   * @param dealId Deal ID
   */
  async trackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_URL}/${dealId}/track`);
    } catch (error) {
      console.error(`Error tracking deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Untrack a deal (stop monitoring)
   * @param dealId Deal ID
   */
  async untrackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${dealId}/track`);
    } catch (error) {
      console.error(`Error untracking deal ${dealId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance for use across the app
export const dealsService = new DealsService(); 