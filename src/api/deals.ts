import axios from 'axios';
import { DealResponse, DealSearch, PriceHistory, AIAnalysis } from '@/types/deals';

// Import the SearchResponse interface from the deals service
import { SearchResponse } from '@/services/deals';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const dealsApi = axios.create({
  baseURL: `${API_URL}/deals`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
dealsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchDeals = async (searchParams: DealSearch): Promise<SearchResponse> => {
  try {
    const { data } = await dealsApi.post('/search', searchParams);
    return data;
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
  return data;
};

export const trackDeal = async (dealId: string): Promise<void> => {
  await dealsApi.post(`/${dealId}/track`);
};

export const untrackDeal = async (dealId: string): Promise<void> => {
  await dealsApi.delete(`/${dealId}/track`);
}; 