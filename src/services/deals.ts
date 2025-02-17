import { apiClient } from '@/lib/api-client';
import { DealSuggestion, AIAnalysis, PriceHistory } from '@/types/deals';

export interface SearchQuery {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface SearchCost {
  tokenCost: number;
  features: string[];
}

export interface SearchResponse {
  deals: DealSuggestion[];
  total: number;
  cost: SearchCost;
}

class DealsService {
  async getSearchCost(query: SearchQuery): Promise<SearchCost> {
    const response = await apiClient.get('/api/v1/deals/search/cost', { params: query });
    return response.data;
  }

  async searchDeals(query: SearchQuery): Promise<SearchResponse> {
    const response = await apiClient.post('/api/v1/deals/search', query);
    return response.data;
  }

  async getDealDetails(dealId: string): Promise<DealSuggestion> {
    const response = await apiClient.get(`/api/v1/deals/${dealId}`);
    return response.data;
  }

  async getAIAnalysis(dealId: string): Promise<AIAnalysis> {
    const response = await apiClient.get(`/api/v1/deals/${dealId}/analysis`);
    return response.data;
  }

  async getPriceHistory(dealId: string): Promise<PriceHistory[]> {
    const response = await apiClient.get(`/api/v1/deals/${dealId}/price-history`);
    return response.data;
  }

  async trackDeal(dealId: string): Promise<void> {
    await apiClient.post(`/api/v1/deals/${dealId}/track`);
  }

  async untrackDeal(dealId: string): Promise<void> {
    await apiClient.delete(`/api/v1/deals/${dealId}/track`);
  }
}

export const dealsService = new DealsService(); 