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
  description?: string;
  url: string;
  imageUrl?: string;
  price: number;
  originalPrice: number;
  source: string;
  category: string;
  condition: string;
  warranty?: string;
  inStock: boolean;
  stockCount?: number;
  features: string[];
  score: number;
  expiresAt?: string;
  shippingInfo: {
    freeShipping: boolean;
    price: number;
    estimatedDays: number;
  };
  reviews: {
    averageRating: number;
    count: number;
  };
}

export interface PriceHistory {
  price: number;
  date: string;
  source: string;
}

export interface AIAnalysis {
  priceAnalysis: {
    trend: string;
    prediction: string;
    confidence: number;
  };
  buyingAdvice: string;
  alternatives?: Deal[];
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

export interface SearchQuery {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'relevance' | 'date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}