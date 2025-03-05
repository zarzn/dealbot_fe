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
  return data.prices || [];
};

export const trackDeal = async (dealId: string): Promise<void> => {
  await dealsApi.post(`/${dealId}/track`);
};

export const untrackDeal = async (dealId: string): Promise<void> => {
  await dealsApi.delete(`/${dealId}/track`);
}; 