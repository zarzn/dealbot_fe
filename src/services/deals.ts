import axios from 'axios';
import { DealSuggestion } from '@/types/deals';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SearchQuery {
  query: string;
  constraints?: {
    maxPrice?: number;
    minPrice?: number;
    brands?: string[];
    categories?: string[];
    deadline?: string;
    condition?: string[];
    freeShippingOnly?: boolean;
    inStockOnly?: boolean;
    minRating?: number;
    maxShippingDays?: number;
    hasWarranty?: boolean;
  };
}

export interface AIAnalysis {
  relevanceScore: number;
  priceAnalysis: {
    isGoodDeal: boolean;
    confidence: number;
    reasoning: string;
    historicalContext: string;
    priceProjection: {
      trend: 'rising' | 'falling' | 'stable';
      confidence: number;
      nextWeekEstimate?: number;
    };
  };
  dealQuality: {
    score: number;
    factors: Array<{
      factor: string;
      impact: number;
      explanation: string;
    }>;
  };
  alternatives: Array<{
    dealId: string;
    reason: string;
    priceDifference: number;
  }>;
  buyingAdvice: {
    recommendation: string;
    timing: string;
    confidence: number;
  };
}

export const dealsService = {
  async searchDeals(searchQuery: SearchQuery) {
    try {
      const response = await axios.post(`${API_URL}/api/v1/deals/search`, searchQuery);
      return response.data;
    } catch (error) {
      console.error('Failed to search deals:', error);
      throw error;
    }
  },

  async getAIAnalysis(dealId: string): Promise<AIAnalysis> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/deals/${dealId}/analysis`);
      return response.data;
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
      throw error;
    }
  },

  async getDealById(id: string): Promise<DealSuggestion> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/deals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deal:', error);
      throw error;
    }
  },

  async getPriceHistory(id: string) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/deals/${id}/price-history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      throw error;
    }
  },

  async getSimilarDeals(id: string) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/deals/${id}/similar`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch similar deals:', error);
      throw error;
    }
  },

  async analyzeDealTrends(category: string) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/deals/trends/${category}`);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze trends:', error);
      throw error;
    }
  }
}; 