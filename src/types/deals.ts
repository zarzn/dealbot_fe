export interface Deal {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  url?: string;
  image_url?: string;
  seller_info?: {
    name: string;
    rating: number;
    reviews?: number;
    condition?: string;
  };
  shipping_info?: {
    cost: number;
    free_shipping: boolean;
    estimated_days?: number;
  };
  availability?: {
    in_stock: boolean;
    quantity?: number;
  };
  category?: string;
  source?: string;
  status?: string;
  market_id?: string;
  user_id?: string;
  goal_id?: string;
  found_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  features?: string[];
  is_tracked?: boolean;
  latest_score?: number;
  deal_metadata?: Record<string, any>;
  price_metadata?: Record<string, any>;
}

export interface DealSuggestion {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number;
  source: string;
  category: string;
  image_url: string;
  score: number;
  expires_at: string;
  url: string;
  is_tracked: boolean;
  reviews: {
    average_rating: number;
    count: number;
  };
  shipping_info: {
    free_shipping: boolean;
    estimated_days: number;
  };
  availability: {
    in_stock: boolean;
    quantity?: number;
  };
  features: string[];
  seller_info: {
    name: string;
    rating: number;
    condition?: string;
  };
  match_score?: number;
  relevance_explanation?: string;
}

export interface ShippingInfo {
  cost?: number;
  estimated_days?: number;
  provider?: string;
  method?: string;
  free_shipping?: boolean;
}

export interface PriceHistory {
  id?: string;
  price: number;
  currency: string;
  timestamp: string;
  source: string;
  meta_data?: Record<string, any>;
}

export interface AIAnalysis {
  deal_id: string;
  score: number;
  confidence: number;
  price_analysis: {
    discount_percentage?: number;
    is_good_deal?: boolean;
    price_trend?: string;
  };
  market_analysis: {
    competition?: string;
    availability?: string;
  };
  recommendations: string[];
  analysis_date: string;
  expiration_analysis?: string;
}

export interface DealTrend {
  category: string;
  period: string;
  data: {
    average_price: number;
    lowest_price: number;
    highest_price: number;
    price_volatility: number;
    deal_frequency: number;
  };
  seasonal_factors: Array<{
    factor: string;
    impact: number;
  }>;
  best_time_to_buy: {
    timeframe: string;
    confidence: number;
    reasoning: string;
  };
}

export interface SimilarDeal {
  deal_id: string;
  similarity: number;
  price_difference: number;
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
  deal_metadata?: {
    scraped_at?: string;
    source?: string;
    search_query?: string;
    [key: string]: any;
  };
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
  price_history?: PriceHistory[];
  ai_analysis?: AIAnalysis;
  found_at: string;
  expires_at?: string;
  status: string;
  market_id: string;
  user_id?: string;
  goal_id?: string;
  created_at?: string;
  updated_at?: string;
  availability?: {
    in_stock: boolean;
    quantity?: number;
  };
  seller_info?: {
    name: string;
    rating: number;
    reviews?: number;
    condition?: string;
    features?: string[];
    warranty?: string;
  };
  latest_score?: number;
}