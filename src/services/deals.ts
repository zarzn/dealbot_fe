import { apiClient } from '@/lib/api-client';
import type { DealSuggestion, AIAnalysis, PriceHistory, DealSearch } from '@/types/deals';

export interface SearchResponse {
  deals: DealSuggestion[];
  total: number;
  metadata?: {
    scraping_attempted?: boolean;
    [key: string]: any;
  };
}

export class DealsService {
  async searchDeals(query: DealSearch): Promise<SearchResponse> {
    try {
      const response = await apiClient.post(`/api/v1/deals/search`, query);
      return response.data;
    } catch (error) {
      console.error('Error searching deals:', error);
      // Return empty results for errors
      return { deals: [], total: 0 };
    }
  }

  async getDealDetails(dealId: string): Promise<DealSuggestion> {
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
      const response = await apiClient.get(`/api/v1/deals/${dealId}/analysis`);
      return response.data;
    } catch (error) {
      console.error(`Error getting AI analysis for ${dealId}:`, error);
      // Return minimal analysis object instead of throwing
      return {
        deal_id: dealId,
        score: 0,
        confidence: 0,
        price_analysis: { 
          price_trend: 'unknown',
          is_good_deal: false
        },
        market_analysis: { 
          availability: 'unknown'
        },
        recommendations: ['Unable to retrieve AI analysis'],
        analysis_date: new Date().toISOString()
      };
    }
  }

  async getPriceHistory(dealId: string): Promise<PriceHistory[]> {
    try {
      const response = await apiClient.get(`/api/v1/deals/${dealId}/price-history`);
      return response.data;
    } catch (error) {
      console.error(`Error getting price history for ${dealId}:`, error);
      return []; // Return empty array instead of throwing
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
}

export const dealsService = new DealsService(); 