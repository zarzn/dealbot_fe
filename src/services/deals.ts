import { apiClient } from '@/lib/api-client';
import type { DealSuggestion, AIAnalysis, PriceHistory, SearchQuery } from '@/types/deals';

export interface SearchResponse {
  deals: DealSuggestion[];
  total: number;
}

export class DealsService {
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