import { api } from '@/lib/api';
import { PriceTracker, PricePrediction, PriceStatistics } from '@/types/price';

export const priceService = {
  // Price Tracking
  async createTracker(dealId: string, thresholdPrice?: number) {
    const response = await api.post('/price-tracking/trackers', {
      deal_id: dealId,
      threshold_price: thresholdPrice,
    });
    return response.data;
  },

  async getTrackers() {
    const response = await api.get('/price-tracking/trackers');
    return response.data;
  },

  async getPriceHistory(dealId: string) {
    const response = await api.get(`/price-tracking/history/${dealId}`);
    return response.data;
  },

  // Price Predictions
  async getPrediction(dealId: string) {
    const response = await api.get(`/price-prediction/deals/${dealId}/predictions`);
    return response.data;
  },

  async getPriceTrends(dealId: string) {
    const response = await api.get(`/price-prediction/deals/${dealId}/trends`);
    return response.data;
  },

  async analyzeDealPrice(dealId: string) {
    const response = await api.get(`/price-prediction/deals/${dealId}/analysis`);
    return response.data;
  }
}; 