import { apiClient } from '@/lib/api-client';
import type { DealSuggestion, AIAnalysis, PriceHistory, DealSearch, DealResponse } from '@/types/deals';

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

export class DealsService {
  async searchDeals(query: DealSearch): Promise<SearchResponse> {
    try {
      // Log the full URL that will be used
      const fullEndpoint = `${apiClient.defaults.baseURL}/api/v1/deals/search`;
      console.log('Making DealsService.searchDeals request to:', fullEndpoint);
      console.log('Using apiClient with baseURL:', apiClient.defaults.baseURL);
      console.log('Query parameters:', query);
      
      const response = await apiClient.post(`/api/v1/deals/search`, query);
      return response.data;
    } catch (error) {
      console.error('Error searching deals:', error);
      throw error;
    }
  }

  async getDealDetails(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.get(`/api/v1/deals/${dealId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting deal details for ${dealId}:`, error);
      throw error;
    }
  }

  async getAIAnalysis(dealId: string): Promise<AIAnalysis> {
    try {
      const response = await apiClient.get(`/api/v1/deals/analysis/${dealId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting AI analysis for ${dealId}:`, error);
      throw error;
    }
  }

  async getPriceHistory(dealId: string): Promise<PriceHistory[]> {
    try {
      const response = await apiClient.get(`/api/v1/deals/${dealId}/price-history`);
      return response.data.prices || [];
    } catch (error) {
      console.error(`Error getting price history for ${dealId}:`, error);
      throw error;
    }
  }

  async trackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/deals/${dealId}/track`);
    } catch (error) {
      console.error(`Error tracking deal ${dealId}:`, error);
      throw error;
    }
  }

  async untrackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/deals/${dealId}/track`);
    } catch (error) {
      console.error(`Error untracking deal ${dealId}:`, error);
      throw error;
    }
  }

  async validateDeal(dealId: string): Promise<{is_valid: boolean; validation_details: any}> {
    try {
      const response = await apiClient.post(`/api/v1/deals/${dealId}/validate`);
      return response.data;
    } catch (error) {
      console.error(`Error validating deal ${dealId}:`, error);
      throw error;
    }
  }

  async refreshDeal(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`/api/v1/deals/${dealId}/refresh`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing deal ${dealId}:`, error);
      throw error;
    }
  }

  async getSimilarDeals(dealId: string, limit: number = 10): Promise<DealResponse[]> {
    try {
      const response = await apiClient.get(`/api/v1/deals/${dealId}/similar?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting similar deals for ${dealId}:`, error);
      throw error;
    }
  }

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
      
      const response = await apiClient.get(`/api/v1/deals?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting deals:', error);
      throw error;
    }
  }

  async createDeal(dealData: any): Promise<DealResponse> {
    try {
      console.log('Creating new deal with data:', dealData);
      const response = await apiClient.post('/api/v1/deals', dealData);
      return response.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDeal(dealId: string, dealData: any): Promise<DealResponse> {
    try {
      console.log(`Updating deal ${dealId} with data:`, dealData);
      const response = await apiClient.put(`/api/v1/deals/${dealId}`, dealData);
      return response.data;
    } catch (error) {
      console.error(`Error updating deal ${dealId}:`, error);
      throw error;
    }
  }

  async deleteDeal(dealId: string): Promise<void> {
    try {
      console.log(`Deleting deal ${dealId}`);
      await apiClient.delete(`/api/v1/deals/${dealId}`);
    } catch (error) {
      console.error(`Error deleting deal ${dealId}:`, error);
      throw error;
    }
  }
}

export const dealsService = new DealsService(); 