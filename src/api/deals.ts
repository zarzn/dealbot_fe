import axios from 'axios';
import { DealResponse, DealSearch, PriceHistory, AIAnalysis } from '@/types/deals';
import { SearchResponse } from '@/services/deals';
import { API_CONFIG } from '@/services/api/config';

// Create axios instance with default config
const dealsApi = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/deals`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the API URL in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Deals API using URL:', `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/deals`);
}

// Add request interceptor to include auth token
dealsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchDeals = async (searchParams: DealSearch & { 
  scrape?: boolean, 
  real_time?: boolean,
  perform_ai_analysis?: boolean
}): Promise<SearchResponse> => {
  try {
    console.log('Searching deals with params:', searchParams);
    
    // Create a unique ID for this search for tracking
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Search ID: ${searchId}`);

    // Include scraping parameters in headers if specified
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Search-ID': searchId
    };
    
    if (searchParams.scrape) {
      headers['X-Enable-Scraping'] = 'true';
      console.log('Enabling scraping for this search');
    }
    
    if (searchParams.real_time) {
      headers['X-Real-Time-Search'] = 'true';
      console.log('Enabling real-time search');
    }

    // Use the full API URL instead of a relative path
    const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/deals/search`;
    console.log('Making API request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search deals');
    }

    const data = await response.json();
    console.log('Original API response:', data);

    // Transform each deal to ensure all required properties
    const transformedDeals = data.deals.map((deal: any) => {
      // Extract score from AI analysis or use provided score
      let score = 5; // Default score
      if (deal.ai_analysis?.score !== undefined) {
        score = typeof deal.ai_analysis.score === 'number' 
          ? deal.ai_analysis.score 
          : parseFloat(String(deal.ai_analysis.score));
      } else if (deal.latest_score !== undefined) {
        score = typeof deal.latest_score === 'number'
          ? deal.latest_score
          : parseFloat(String(deal.latest_score));
      } else if (deal.score !== undefined) {
        score = typeof deal.score === 'number'
          ? deal.score
          : parseFloat(String(deal.score));
      }
      
      // Normalize score to 0-10 range
      if (score <= 1) {
        score = score * 10; // Convert 0-1 scale to 0-10
      }
      score = Math.min(Math.max(score, 0), 10); // Ensure between 0-10
      
      // Extract and normalize ratings from multiple sources
      let averageRating = 0;
      let reviewCount = 0;
      
      // First try reviews object
      if (deal.reviews) {
        if (deal.reviews.average_rating !== undefined) {
          averageRating = typeof deal.reviews.average_rating === 'number'
            ? deal.reviews.average_rating
            : parseFloat(String(deal.reviews.average_rating));
        }
        if (deal.reviews.count !== undefined) {
          reviewCount = typeof deal.reviews.count === 'number'
            ? deal.reviews.count
            : parseInt(String(deal.reviews.count));
        }
      }
      
      // If not found, try seller_info
      if (!averageRating && deal.seller_info?.rating !== undefined) {
        averageRating = typeof deal.seller_info.rating === 'number'
          ? deal.seller_info.rating
          : parseFloat(String(deal.seller_info.rating));
      }
      
      if (!reviewCount && deal.seller_info?.reviews !== undefined) {
        reviewCount = typeof deal.seller_info.reviews === 'number'
          ? deal.seller_info.reviews
          : parseInt(String(deal.seller_info.reviews));
      }
      
      // Last resort, try deal_metadata
      if (!averageRating && deal.deal_metadata?.rating !== undefined) {
        averageRating = typeof deal.deal_metadata.rating === 'number'
          ? deal.deal_metadata.rating
          : parseFloat(String(deal.deal_metadata.rating));
      }
      
      if (!reviewCount && deal.deal_metadata?.review_count !== undefined) {
        reviewCount = typeof deal.deal_metadata.review_count === 'number'
          ? deal.deal_metadata.review_count
          : parseInt(String(deal.deal_metadata.review_count));
      }
      
      // Handle possible NaN values
      if (isNaN(averageRating)) averageRating = 0;
      if (isNaN(reviewCount)) reviewCount = 0;
      
      // Ensure averageRating is in range 0-5
      averageRating = Math.min(Math.max(averageRating, 0), 5);
      
      // Create a properly structured deal
      return {
        ...deal,
        score, // Normalized score
        seller_info: {
          ...(deal.seller_info || {}),
          rating: averageRating, // Ensure consistent rating
          name: deal.seller_info?.name || "Unknown Seller",
          condition: deal.seller_info?.condition || "New",
        },
        reviews: {
          average_rating: averageRating,
          count: reviewCount
        }
      };
    });

    console.log('First transformed deal:', transformedDeals[0]);

    return {
      ...data,
      deals: transformedDeals
    };
  } catch (error) {
    console.error('Error searching deals:', error);
    throw error;
  }
};

export const getDeal = async (dealId: string): Promise<DealResponse> => {
  const { data } = await dealsApi.get(`/${dealId}`);
  return data;
};

export const getDealAnalysis = async (dealId: string): Promise<AIAnalysis> => {
  const { data } = await dealsApi.get(`/analysis/${dealId}`);
  return data;
};

export const getPriceHistory = async (dealId: string, days: number = 30): Promise<PriceHistory[]> => {
  const { data } = await dealsApi.get(`/${dealId}/price-history`, {
    params: { days },
  });
  return data.prices || [];
};

export const trackDeal = async (dealId: string): Promise<void> => {
  await dealsApi.post(`/${dealId}/track`);
};

export const untrackDeal = async (dealId: string): Promise<void> => {
  await dealsApi.delete(`/${dealId}/track`);
}; 