export interface Deal {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  original_price?: number | string | null;
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
  latest_score?: number | null;
  deal_metadata?: Record<string, any>;
  price_metadata?: Record<string, any>;
  tags?: string[];
  verified?: boolean;
  featured?: boolean;
  ai_analysis?: AIAnalysis;
  best_seller?: boolean;
  is_amazons_choice?: boolean;
  metadata?: Record<string, any>;
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
    cost?: number;
    provider?: string;
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
  brand?: string;
  product_specifications?: Record<string, string>;
  delivery_options?: string;
  compare_prices_available?: boolean;
  compare_prices_link?: string;
  market_position?: string;
  match_description?: string;
  product_highlights?: string[];
  ratings_breakdown?: Record<string, number>;
  recommendations?: string[];
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

/**
 * AI Analysis response for a deal
 */
export interface AIAnalysis {
  status: 'completed' | 'pending' | 'error' | 'not_found';
  message: string;
  token_cost: number;
  request_time: string;
  analysis?: {
    score?: number;
    price_analysis?: Record<string, string | number>;
    market_analysis?: Record<string, string | number>;
    recommendations?: string[];
  };
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
  /** Optional search query text */
  query?: string;
  /** Product category filter */
  category?: string;
  /** Minimum price filter */
  min_price?: number;
  /** Maximum price filter */
  max_price?: number;
  /** Field to sort results by */
  sort_by?: string;
  /** Sort order (asc/desc) */
  sort_order?: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip for pagination */
  offset?: number;
  /** Whether to use real-time web scraping when no results are found */
  use_realtime_scraping?: boolean;
  /** 
   * Whether to use AI to enhance search results.
   * When enabled, AI will:
   * 1. Analyze the search query to extract structured parameters
   * 2. Filter results based on relevance to the original query
   * 3. Generate product recommendations and scores
   */
  use_ai_enhanced_search?: boolean;
  
  /** Whether to perform AI analysis on the search results */
  perform_ai_analysis?: boolean;
  
  /** Page number for pagination */
  page?: number;
  /** Number of items per page */
  page_size?: number;
  /** Additional filters */
  filters?: {
    category?: string;
    price_min?: number;
    price_max?: number;
    featured?: boolean;
    verified?: boolean;
    tags?: string[];
    [key: string]: any;
  };
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
  score?: number;
  deal_metadata?: Record<string, any>;
  price_metadata?: Record<string, any>;
  tags?: string[];
  verified?: boolean;
  featured?: boolean;
}

/**
 * Request model for creating a new deal
 */
export interface CreateDealRequest {
  title: string;
  description: string;
  url?: string;
  price?: number;
  currency?: string;
  category?: string;
  deal_type?: string;
  image_url?: string;
  tags?: string[];
  merchant?: {
    name: string;
    rating?: number;
    website?: string;
  };
  shipping_info?: {
    price?: number;
    estimated_delivery?: string;
    free_shipping?: boolean;
    international?: boolean;
  };
  coupon_code?: string;
  discount_percentage?: number;
  ends_at?: string;
}

/**
 * Request model for updating an existing deal
 */
export interface UpdateDealRequest {
  title?: string;
  description?: string;
  url?: string;
  price?: number;
  currency?: string;
  category?: string;
  deal_type?: string;
  image_url?: string;
  tags?: string[];
  merchant?: {
    name?: string;
    rating?: number;
    website?: string;
  };
  shipping_info?: {
    price?: number;
    estimated_delivery?: string;
    free_shipping?: boolean;
    international?: boolean;
  };
  coupon_code?: string;
  discount_percentage?: number;
  status?: string;
  ends_at?: string;
}