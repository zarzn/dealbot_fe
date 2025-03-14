import { apiClient } from '@/lib/api-client';

// Define interfaces for market-related data
export interface MarketResponse {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  api_endpoint?: string;
  config?: Record<string, any>;
  success_rate?: number;
  avg_response_time?: number;
  total_requests?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MarketStats {
  avgResponseTime: number;
  successRate: number;
  totalDeals: number;
}

export interface MarketWithStats extends MarketResponse {
  stats: MarketStats;
}

/**
 * Market API service for interacting with the markets endpoints
 */
class MarketApiService {
  private static BASE_URL = `/api/v1/markets`;

  /**
   * Get all markets
   * @returns Promise with all markets
   */
  async getAllMarkets(): Promise<MarketResponse[]> {
    try {
      const response = await apiClient.get(`${MarketApiService.BASE_URL}/list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all markets:', error);
      throw error;
    }
  }

  /**
   * Get active markets
   * @returns Promise with active markets
   */
  async getActiveMarkets(): Promise<MarketResponse[]> {
    try {
      const response = await apiClient.get(`${MarketApiService.BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active markets:', error);
      throw error;
    }
  }

  /**
   * Get a specific market by ID
   * @param id Market ID
   * @returns Promise with market details
   */
  async getMarketById(id: string): Promise<MarketResponse> {
    try {
      const response = await apiClient.get(`${MarketApiService.BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching market ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get supported market platforms
   * @returns Promise with list of supported market platforms
   */
  async getSupportedMarkets(): Promise<{id: string; name: string; status: string}[]> {
    try {
      const response = await apiClient.get(`${MarketApiService.BASE_URL}/supported`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supported markets:', error);
      throw error;
    }
  }

  /**
   * Transform raw market data into MarketWithStats format with UI-friendly fields
   * @param markets Raw market data from API
   * @returns Markets with stats for UI consumption
   */
  transformMarketsForUI(markets: MarketResponse[]): MarketWithStats[] {
    return markets.map(market => {
      // Calculate or use defaults for stats
      const stats: MarketStats = {
        successRate: market.success_rate || 95,
        avgResponseTime: market.avg_response_time || 150,
        totalDeals: 500 // Default value as this may not be in the API response
      };

      return {
        ...market,
        stats
      };
    });
  }
}

// Export a singleton instance for use across the app
export const marketService = new MarketApiService(); 