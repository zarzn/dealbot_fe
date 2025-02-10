 export interface DealSuggestion {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  source: string;
  score: number;
  url: string;
  imageUrl?: string;
  expiresAt?: string;
  status: string;
  marketId: string;
  sellerRating?: number;
  matchScore: number;
  relevanceExplanation: string;
  category: string;
  condition: string;
  shippingInfo: {
    price: number;
    estimatedDays: number;
    freeShipping: boolean;
  };
  warranty?: string;
  reviews: {
    count: number;
    averageRating: number;
  };
  features: string[];
  inStock: boolean;
  stockCount?: number;
  isTracked?: boolean;
}

export interface PriceHistory {
  date: string;
  price: number;
  source: string;
  isLowestPrice: boolean;
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