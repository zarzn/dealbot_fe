/**
 * Search-related types
 */

import { DealResponse } from './deal';

export interface SearchFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  rating?: number;
  market_type?: string[];
  term?: string;
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  query: string;
  filters?: SearchFilters;
  results: DealResponse[];
  total: number;
  total_pages: number;
  current_page: number;
  execution_time?: number;
  search_id?: string;
  markets_searched?: string[];
  category_suggestions?: string[];
  related_terms?: string[];
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters?: SearchFilters;
  result_count: number;
  executed_at: string;
  saved: boolean;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  created_at: string;
  updated_at: string;
  last_execution?: string;
  last_result_count?: number;
  notification_enabled?: boolean;
  notification_frequency?: 'daily' | 'weekly' | 'instant';
}

export interface SearchSuggestion {
  term: string;
  score: number;
  category?: string;
  source?: 'history' | 'popular' | 'trending' | 'ai';
}

export interface SearchAnalytics {
  query: string;
  execution_count: number;
  average_results: number;
  conversion_rate?: number;
  last_executed?: string;
} 