export interface Deal {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  url?: string;
  imageUrl?: string;
  seller?: string;
  shippingInfo?: {
    cost: number;
    freeShipping: boolean;
  };
  reviews?: {
    count: number;
    averageRating: number;
  };
  warranty?: string;
  inStock?: boolean;
  stockCount?: number;
  features?: string[];
  isTracked?: boolean;
}

export interface DealSuggestion {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  source: string;
  category: string;
  imageUrl: string;
  score: number;
  expiresAt: string;
  url: string;
  isTracked: boolean;
  reviews: {
    averageRating: number;
    count: number;
  };
  shippingInfo: {
    freeShipping: boolean;
    estimatedDays: number;
  };
  inStock: boolean;
  stockCount: number;
  features: string[];
}

export interface ShippingInfo {
  estimated_days?: number;
  provider?: string;
  method?: string;
}

export interface PriceHistory {
  price: number;
  currency: string;
  timestamp: string;
  source: string;
  meta_data?: Record<string, any>;
}

export interface AIAnalysis {
  score: number;
  confidence: number;
  price_trend: string;
  price_prediction: number;
  recommendations: string[];
  meta_data?: Record<string, any>;
}

export interface DealTrend {
  category: string;
  period: string;
  data: {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    priceVolatility: number;
    dealFrequency: number;
  };
  seasonalFactors: Array<{
    factor: string;
    impact: number;
  }>;
  bestTimeToBuy: {
    timeframe: string;
    confidence: number;
    reasoning: string;
  };
}

export interface SimilarDeal {
  dealId: string;
  similarity: number;
  priceDifference: number;
  advantages: string[];
  disadvantages: string[];
}

export interface DealBase {
  title: string;
  description: string;
  url: string;
  price: number;
  original_price?: number;
  currency: string;
  source: string;
  image_url?: string;
  category?: string;
  seller_info?: Record<string, any>;
  shipping_info?: ShippingInfo;
}

export interface DealSearch {
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
}

export interface DealResponse extends DealBase {
  id: string;
  is_tracked: boolean;
  lowest_price?: number;
  highest_price?: number;
  price_history: PriceHistory[];
  ai_analysis?: AIAnalysis;
  found_at: string;
  expires_at?: string;
  status: string;
}