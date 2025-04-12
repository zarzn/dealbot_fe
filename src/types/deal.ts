/**
 * Types related to deals and product listings
 */

export interface BaseDeal {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  currency?: string;
  url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  source?: string;
  market_type?: string;
  market_name?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  review_count?: number;
  metadata?: Record<string, any>;
}

export interface ShippingInfo {
  price?: number;
  is_free?: boolean;
  estimated_delivery?: string;
  provider?: string;
  options?: ShippingOption[];
}

export interface ShippingOption {
  name: string;
  price: number;
  estimated_delivery: string;
  provider?: string;
}

export interface SellerInfo {
  name: string;
  id?: string;
  rating?: number;
  review_count?: number;
  is_verified?: boolean;
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface AIAnalysis {
  analysis?: {
    score?: number;
    summary?: string;
    pros?: string[];
    cons?: string[];
    recommendations?: string[];
    value_assessment?: string;
    price_analysis?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
  created_at?: string;
  version?: string;
}

export interface Deal extends BaseDeal {
  is_favorite?: boolean;
  score?: number;
  features?: string[];
  ai_analysis?: AIAnalysis;
  market_id?: string;
  market_name?: string;
  goal_id?: string;
  user_id?: string;
  shipping_info?: ShippingInfo;
  seller_info?: SellerInfo;
  price_history?: PriceHistory[];
  similar_products?: BaseDeal[];
  is_tracked?: boolean;
  is_in_stock?: boolean;
  expires_at?: string;
  deal_score?: number;
  deal_url?: string;
  deal_type?: string;
}

export interface DealResponse extends BaseDeal {
  is_favorite?: boolean;
  ai_analysis?: AIAnalysis;
  market_id?: string;
  market_name?: string;
  goal_id?: string;
  user_id?: string;
  shipping_info?: {
    price?: number;
    is_free?: boolean;
    estimated_delivery?: string;
    provider?: string;
  };
  seller_info?: SellerInfo;
  price_history?: PriceHistory[];
  is_tracked?: boolean;
  is_in_stock?: boolean;
  expires_at?: string;
  deal_score?: number;
  deal_url?: string;
  deal_type?: string;
}

export interface DealFiltersState {
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  rating?: number;
  is_tracked?: boolean;
  is_favorite?: boolean;
  market_type?: string[];
  search?: string;
  tag?: string[];
}

export interface DealSearch extends DealFiltersState {
  page?: number;
  per_page?: number;
  goal_id?: string;
  deal_type?: string;
  user_id?: string;
}

export interface DealPaginationResponse {
  items: DealResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
} 