export interface PricePoint {
  id?: string;
  timestamp: string;
  price: number;
  source: string;
  currency?: string;
  meta_data?: Record<string, any>;
}

export interface PricePrediction {
  id: string;
  deal_id: string;
  price: number;
  confidence: number;
  prediction_date: string;
  model_name: string;
  features_used: string[];
  trend_direction?: string;
  trend_strength?: number;
  seasonality_score?: number;
  meta_data?: Record<string, any>;
}

export interface PriceTrends {
  direction: 'up' | 'down' | 'stable';
  strength: number;
  seasonality_score: number;
  trend_period: string;
  support_price?: number;
  resistance_price?: number;
  breakout_probability?: number;
  volume_impact?: number;
  confidence: number;
  meta_data?: Record<string, any>;
}

export interface PriceTracker {
  id: string;
  deal_id: string;
  threshold_price?: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  last_checked_at: string;
  initial_price: number;
  current_price?: number;
  price_change?: number;
  price_change_percentage?: number;
  notification_settings?: Record<string, any>;
  meta_data?: Record<string, any>;
}

export interface PriceStatistics {
  min_price: number;
  max_price: number;
  avg_price: number;
  median_price: number;
  price_volatility: number;
  total_points: number;
  time_range: string;
  last_update: string;
  trend: string;
  meta_data?: Record<string, any>;
}

export interface PriceHistoryResponse {
  deal_id: string;
  prices: PricePoint[];
  average_price: number;
  lowest_price: number;
  highest_price: number;
  start_date: string;
  end_date: string;
  trend: string;
} 