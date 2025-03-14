import { AxiosResponse } from 'axios';
import { 
  Deal, 
  DealResponse, 
  DealSearch, 
  CreateDealRequest, 
  UpdateDealRequest, 
  PriceHistory, 
  AIAnalysis 
} from '@/types/deals';
import { API_CONFIG } from './config';
import { apiClient } from '@/lib/api-client';

// API response types
export interface SearchResponse {
  items: DealResponse[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Deals API service for interacting with the deals endpoints
 */
export class DealsApiService {
  private static BASE_URL = `/deals`;

  /**
   * Get all deals with optional filtering
   * @param filters Optional filters for the deals
   * @param page Page number
   * @param pageSize Items per page
   * @returns Promise with deals list response
   */
  static async getDeals(
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
      
      const response = await apiClient.get(`${this.BASE_URL}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting deals:', error);
      throw error;
    }
  }

  /**
   * Get a specific deal by ID
   * @param id Deal ID
   * @returns Promise with deal response
   */
  static async getDealById(id: string): Promise<DealResponse> {
    try {
      const response = await apiClient.get<DealResponse>(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting deal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new deal
   * @param deal Deal creation request data
   * @returns Promise with the created deal
   */
  static async createDeal(dealData: CreateDealRequest): Promise<DealResponse> {
    try {
      const response = await apiClient.post<DealResponse>(this.BASE_URL, dealData);
      return response.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update an existing deal
   * @param id Deal ID
   * @param deal Deal update request data
   * @returns Promise with the updated deal
   */
  static async updateDeal(id: string, dealData: UpdateDealRequest): Promise<DealResponse> {
    try {
      const response = await apiClient.put<DealResponse>(`${this.BASE_URL}/${id}`, dealData);
      return response.data;
    } catch (error) {
      console.error(`Error updating deal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a deal
   * @param id Deal ID
   * @returns Promise with the operation result
   */
  static async deleteDeal(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting deal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search for deals based on criteria
   * @param query Search query
   * @returns Promise with search results
   */
  static async searchDeals(searchParams: DealSearch): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add search parameters
      if (searchParams.query) queryParams.append('query', searchParams.query);
      if (searchParams.category) queryParams.append('category', searchParams.category);
      if (searchParams.min_price) queryParams.append('min_price', searchParams.min_price.toString());
      if (searchParams.max_price) queryParams.append('max_price', searchParams.max_price.toString());
      if (searchParams.sort_by) queryParams.append('sort_by', searchParams.sort_by);
      if (searchParams.page) queryParams.append('page', searchParams.page.toString());
      if (searchParams.limit) queryParams.append('limit', searchParams.limit.toString());
      
      const response = await apiClient.get(`${this.BASE_URL}/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching deals:', error);
      throw error;
    }
  }

  /**
   * Get deal price history
   * @param dealId Deal ID
   * @param timeRange Time range for history (default: 30d)
   * @returns Promise with price history data
   */
  static async getDealPriceHistory(dealId: string, timeRange: string = '30d'): Promise<PriceHistory> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/price-history?time_range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting price history for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Get AI analysis for a deal
   * @param dealId Deal ID
   * @returns Promise with AI analysis data
   */
  static async getDealAnalysis(dealId: string): Promise<AIAnalysis> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/analysis/${dealId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh AI analysis for a deal
   * @param dealId Deal ID
   * @returns Promise with the updated deal including fresh analysis
   */
  static async refreshDealAnalysis(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/analyze`, {});
      return response.data;
    } catch (error) {
      console.error(`Error refreshing analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh a deal's information from its source
   * @param dealId Deal ID
   * @returns Promise with the updated deal
   */
  static async refreshDeal(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/refresh`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Validate a deal
   * @param dealId Deal ID
   * @returns Promise with validation result
   */
  static async validateDeal(dealId: string): Promise<{is_valid: boolean; validation_details: any}> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/validate`);
      return response.data;
    } catch (error) {
      console.error(`Error validating deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Track a deal to add it to user's watchlist
   * @param dealId Deal ID
   * @returns Promise with the operation result
   */
  static async trackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_URL}/${dealId}/track`, {});
    } catch (error) {
      console.error(`Error tracking deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Untrack a deal to remove it from user's watchlist
   * @param dealId Deal ID
   * @returns Promise with the operation result
   */
  static async untrackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${dealId}/track`);
    } catch (error) {
      console.error(`Error untracking deal ${dealId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance for use across the app
export const dealsService = {
  getDeals: DealsApiService.getDeals,
  getDealById: DealsApiService.getDealById,
  createDeal: DealsApiService.createDeal,
  updateDeal: DealsApiService.updateDeal,
  deleteDeal: DealsApiService.deleteDeal,
  searchDeals: DealsApiService.searchDeals,
  getDealPriceHistory: DealsApiService.getDealPriceHistory,
  getDealAnalysis: DealsApiService.getDealAnalysis,
  refreshDealAnalysis: DealsApiService.refreshDealAnalysis,
  refreshDeal: DealsApiService.refreshDeal,
  validateDeal: DealsApiService.validateDeal,
  trackDeal: DealsApiService.trackDeal,
  untrackDeal: DealsApiService.untrackDeal,
}; 