import { apiClient } from '@/lib/api-client';
import { PriceTracker, PricePrediction, PriceStatistics } from '@/types/price';

export const priceService = {
  // Price Tracking
  async createTracker(dealId: string, thresholdPrice?: number) {
    const response = await apiClient.post('/api/v1/price-tracking/trackers', {
      deal_id: dealId,
      threshold_price: thresholdPrice,
    });
    return response.data;
  },

  async getTrackers() {
    const response = await apiClient.get('/api/v1/price-tracking/trackers');
    return response.data;
  },

  async getPriceHistory(dealId: string) {
    const response = await apiClient.get(`/api/v1/deals/${dealId}/price-history`);
    return response.data;
  },

  // Price Predictions
  async getPrediction(dealId: string) {
    const response = await apiClient.get(`/api/v1/deals/${dealId}/predictions`);
    return response.data;
  },

  async getPriceTrends(dealId: string) {
    const response = await apiClient.get(`/api/v1/deals/${dealId}/trends`);
    return response.data;
  },

  async analyzeDealPrice(dealId: string) {
    const response = await apiClient.get(`/api/v1/deals/analysis/${dealId}`);
    return response.data;
  }
}; 