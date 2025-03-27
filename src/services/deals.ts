import { apiClient } from '@/lib/api-client';
import type { DealSuggestion, AIAnalysis, PriceHistory, DealSearch, DealResponse, CreateDealRequest, UpdateDealRequest } from '@/types/deals';
import { trackAnalysisRequest, trackAnalysisCompletion } from '@/utils/analytics';

/**
 * Interface for search response from the deals API
 */
export interface SearchResponse {
  deals: DealResponse[];
  total?: number;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
  metadata?: {
    scraping_attempted?: boolean;
    scraping_success?: boolean;
    real_time_search?: boolean;
    search_time_ms?: number;
    data_sources?: string[];
    [key: string]: any;
  };
}

/**
 * Service for interacting with the deals API endpoints
 */
export class DealsService {
  private readonly BASE_URL = '/api/v1/deals';

  /**
   * Search for deals based on query criteria
   * @param query The search parameters
   * @returns Promise with search results
   */
  async searchDeals(query: DealSearch): Promise<SearchResponse> {
    try {
      // Enhanced debug logging
      console.log('🔍 [DealsService] searchDeals called with:', {
        query: query.query,
        category: query.category,
        page: query.page,
        pageSize: query.page_size || query.limit,
        filters: query.filters,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
        min_price: query.min_price,
        max_price: query.max_price
      });
      
      // Log the request details in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Making DealsService.searchDeals request to:', `${this.BASE_URL}/search`);
        console.log('Using apiClient with baseURL:', apiClient.defaults.baseURL);
        console.log('Full query parameters for debugging:', JSON.stringify(query, null, 2));
      }
      
      // Support both GET and POST search patterns
      let response;
      if (query.query || query.perform_ai_analysis) {
        // Use POST for more complex searches
        console.log('🔍 [DealsService] Using POST method for search');
        response = await apiClient.post(`${this.BASE_URL}/search`, query);
      } else {
        // Use GET with query params for simple searches
        const queryParams = new URLSearchParams();
        if (query.category) queryParams.append('category', query.category);
        if (query.min_price) queryParams.append('min_price', query.min_price.toString());
        if (query.max_price) queryParams.append('max_price', query.max_price.toString());
        if (query.sort_by) queryParams.append('sort_by', query.sort_by);
        if (query.sort_order) queryParams.append('sort_order', query.sort_order);
        if (query.page) queryParams.append('page', query.page.toString());
        if (query.limit) queryParams.append('limit', query.limit.toString());
        if (query.page_size) queryParams.append('page_size', query.page_size.toString());
        
        console.log('🔍 [DealsService] Using GET method for search with params:', queryParams.toString());
        response = await apiClient.get(`${this.BASE_URL}/search?${queryParams.toString()}`);
      }
      
      // Log the response for debugging
      console.log('🔍 [DealsService] Search response received:', {
        totalDeals: response.data.deals?.length,
        totalCount: response.data.total,
        page: query.page,
        appliedSortBy: response.data.sort_by,
        appliedSortOrder: response.data.sort_order
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching deals:', error);
      throw error;
    }
  }

  /**
   * Get similar deals based on a deal ID
   * @param dealId The ID of the deal to find similar deals for
   * @returns Promise with similar deals
   */
  async getSimilarDeals(dealId: string): Promise<DealResponse[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/similar`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar deals:', error);
      throw error;
    }
  }

  /**
   * Get price history for a deal
   * @param dealId Deal ID
   * @param timeRange Optional time range (e.g., '30d', '90d')
   * @returns Promise with price history data
   */
  async getDealPriceHistory(dealId: string, timeRange: string = '30d'): Promise<PriceHistory> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/price-history?time_range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting price history for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Alias for getDealPriceHistory to maintain compatibility with existing code
   * @param dealId Deal ID
   * @param timeRange Optional time range (e.g., '30d', '90d')
   * @returns Promise with price history data
   */
  async getPriceHistory(dealId: string, timeRange: string = '30d'): Promise<PriceHistory> {
    return this.getDealPriceHistory(dealId, timeRange);
  }

  /**
   * Get all deals with optional filtering
   * @param filters Optional filters for the deals
   * @param page Page number
   * @param pageSize Items per page
   * @returns Promise with deals list
   */
  async getDeals(
    filters: any = {}, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<DealResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', page.toString());
      queryParams.append('page_size', pageSize.toString());
      
      // Add filters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.price_min) queryParams.append('price_min', filters.price_min.toString());
      if (filters.price_max) queryParams.append('price_max', filters.price_max.toString());
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
      
      // Check if user is authenticated by looking for token
      const hasAuthToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
      
      // Use the new public endpoint when not authenticated
      const endpoint = hasAuthToken ? `${this.BASE_URL}` : `/api/v1/public-deals`;
      
      const response = await apiClient.get(`${endpoint}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting deals:', error);
      throw error;
    }
  }

  /**
   * Get a specific deal by ID
   * @param dealId The ID of the deal
   * @returns Promise with the deal
   */
  async getDealById(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}`);
      const dealData = response.data;
      
      // Check if we have cached analysis data for this deal
      if (!dealData.ai_analysis) {
        try {
          const cachedAnalysis = this.getCachedAnalysis(dealId);
          if (cachedAnalysis && cachedAnalysis.status === 'completed') {
            console.log(`[DealsService] Attaching cached analysis to deal ${dealId}`);
            dealData.ai_analysis = cachedAnalysis;
          }
        } catch (e) {
          console.error(`[DealsService] Error attaching cached analysis:`, e);
        }
      }
      
      return dealData;
    } catch (error) {
      console.error(`Error getting deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Alias for getDealById to maintain compatibility with existing code
   * @param dealId The ID of the deal
   * @returns Promise with the deal
   */
  async getDealDetails(dealId: string): Promise<DealResponse> {
    return this.getDealById(dealId);
  }

  /**
   * Create a new deal
   * @param dealData The deal data to create
   * @returns Promise with the created deal
   */
  async createDeal(dealData: CreateDealRequest): Promise<DealResponse> {
    try {
      console.log('Creating new deal with data:', dealData);
      const response = await apiClient.post(`${this.BASE_URL}`, dealData);
      return response.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update an existing deal
   * @param dealId The ID of the deal to update
   * @param dealData The updated deal data
   * @returns Promise with the updated deal
   */
  async updateDeal(dealId: string, dealData: UpdateDealRequest): Promise<DealResponse> {
    try {
      console.log(`Updating deal ${dealId} with data:`, dealData);
      const response = await apiClient.put(`${this.BASE_URL}/${dealId}`, dealData);
      return response.data;
    } catch (error) {
      console.error(`Error updating deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a deal
   * @param dealId The ID of the deal to delete
   */
  async deleteDeal(dealId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${dealId}`);
    } catch (error) {
      console.error(`Error deleting deal ${dealId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get AI analysis for a deal
   * @param dealId Deal ID
   * @returns Promise with AI analysis data
   */
  async getDealAnalysis(dealId: string): Promise<AIAnalysis> {
    try {
      const startTime = Date.now();
      
      // Check for cached analysis first
      try {
        const cachedAnalysis = this.getCachedAnalysis(dealId);

        if (cachedAnalysis && cachedAnalysis.status === 'completed') {
          console.log(`[DealsService] Using cached analysis for deal ${dealId}`);
          
          // Verify the analysis structure for cached data
          this.validateAnalysisStructure(cachedAnalysis, "CACHED");
          
          // Track metrics for cached analysis
          const duration = Date.now() - startTime;
          trackAnalysisCompletion(dealId, 'cached', duration, 0, true);
          
          return cachedAnalysis;
        }
      } catch (e) {
        console.error(`[DealsService] Error reading cached analysis:`, e);
        // Continue with API call if localStorage fails
      }

      // If no cache hit, fetch from API
      trackAnalysisRequest(dealId); // Track that we're making a new request
      
      const apiStartTime = Date.now();
      const response = await apiClient.get(`${this.BASE_URL}/${dealId}/analysis`);
      const analysisData = response.data;
      const duration = Date.now() - apiStartTime;

      // Log complete response for debugging
      console.log(`[DealsService] Received analysis for deal ${dealId}:`, 
        JSON.stringify(analysisData, null, 2));
        
      // Validate the structure of the analysis data
      this.validateAnalysisStructure(analysisData, "API");

      // Cache successful and completed responses
      if (analysisData && analysisData.status === 'completed') {
        try {
          // Cache the analysis
          this.saveCachedAnalysis(dealId, analysisData);
          
          // Track metrics for completed analysis
          // Extract token cost from the response if available
          const tokenCost = analysisData.token_cost || 0;
          
          trackAnalysisCompletion(dealId, 'success', duration, tokenCost, false);
        } catch (e) {
          console.error(`[DealsService] Error caching analysis:`, e);
        }
      } else if (analysisData && analysisData.status === 'error') {
        // Track error completion
        trackAnalysisCompletion(dealId, 'error', duration, 0, false);
      }

      return analysisData;
    } catch (error) {
      console.error(`Error getting analysis for deal ${dealId}:`, error);
      trackAnalysisCompletion(dealId, 'error', 0, 0, false);
      throw error;
    }
  }
  
  /**
   * Validate the structure of an analysis object and log warnings for missing expected fields
   * @param analysisData The analysis data to validate
   * @param source Source of the analysis (API or CACHED)
   */
  private validateAnalysisStructure(analysisData: AIAnalysis, source: string): void {
    console.log(`[DealsService][${source}] Validating analysis structure`);
    
    if (!analysisData) {
      console.warn(`[DealsService][${source}] Analysis data is null or undefined`);
      return;
    }
    
    if (!analysisData.status) {
      console.warn(`[DealsService][${source}] Analysis is missing status field`);
    }
    
    if (analysisData.status === 'completed') {
      if (!analysisData.analysis) {
        console.warn(`[DealsService][${source}] Completed analysis is missing analysis object`);
        // Initialize empty analysis object if missing
        analysisData.analysis = {
          score: 0,
          price_analysis: {},
          market_analysis: {},
          recommendations: []
        };
      }
      
      // Check for expected fields
      const fieldsToCheck = [
        { name: 'score', type: 'number', fallback: 0 },
        { name: 'price_analysis', type: 'object', fallback: {} },
        { name: 'market_analysis', type: 'object', fallback: {} },
        { name: 'recommendations', type: 'array', fallback: [] }
      ];
      
      let dataStructure = {};
      
      fieldsToCheck.forEach(field => {
        const value = analysisData.analysis?.[field.name];
        const valueType = value === null ? 'null' : typeof value;
        const isArray = Array.isArray(value);
        
        dataStructure[field.name] = {
          present: value !== undefined,
          type: isArray ? 'array' : valueType,
          isEmpty: isArray ? value.length === 0 : 
                   valueType === 'object' ? Object.keys(value || {}).length === 0 : 
                   value === null || value === ''
        };
        
        if (value === undefined) {
          console.warn(`[DealsService][${source}] Analysis is missing ${field.name} field, adding fallback`);
          // Add fallback value
          if (analysisData.analysis) {
            analysisData.analysis[field.name] = field.fallback;
          }
        } else if ((field.type === 'object' && !isArray && typeof value !== 'object') || 
                   (field.type === 'array' && !isArray)) {
          console.warn(`[DealsService][${source}] Analysis ${field.name} has unexpected type: ${valueType}, expected ${field.type}. Fixing.`);
          // Fix incorrect types with fallback
          if (analysisData.analysis) {
            analysisData.analysis[field.name] = field.fallback;
          }
        }
      });
      
      console.log(`[DealsService][${source}] Analysis structure:`, dataStructure);
      
      // If price_analysis or market_analysis are present but empty, log warning
      if (analysisData.analysis.price_analysis && 
          Object.keys(analysisData.analysis.price_analysis).length === 0) {
        console.warn(`[DealsService][${source}] price_analysis is an empty object, adding example data`);
        // Add example data if empty
        analysisData.analysis.price_analysis = {
          "price_trend": "Stable",
          "price_rating": "Good",
          "price_comparison": "Lower than average"
        };
      }
      
      if (analysisData.analysis.market_analysis && 
          Object.keys(analysisData.analysis.market_analysis).length === 0) {
        console.warn(`[DealsService][${source}] market_analysis is an empty object, adding example data`);
        // Add example data if empty
        analysisData.analysis.market_analysis = {
          "market_position": "Competitive",
          "similar_deals": "Few alternatives",
          "market_trend": "Stable"
        };
      }
      
      // If recommendations is present but empty, log warning
      if (analysisData.analysis.recommendations && 
          analysisData.analysis.recommendations.length === 0) {
        console.warn(`[DealsService][${source}] recommendations is an empty array, adding example data`);
        // Add example recommendations if empty
        analysisData.analysis.recommendations = [
          "This is a good deal compared to similar offers.",
          "Consider purchasing soon as the price is competitive.",
          "Check for additional fees before completing purchase."
        ];
      }
      
      // Ensure score is a proper number between 0 and 1
      if (typeof analysisData.analysis.score !== 'number' || 
          isNaN(analysisData.analysis.score) || 
          analysisData.analysis.score < 0 || 
          analysisData.analysis.score > 1) {
        console.warn(`[DealsService][${source}] score is invalid: ${analysisData.analysis.score}, fixing`);
        analysisData.analysis.score = 0.7; // Default to a reasonable score
      }
    }
  }

  /**
   * Request a new AI analysis for a deal
   * This is a premium feature that consumes tokens, with the first analysis being free
   * @param dealId Deal ID
   * @returns Promise with AI analysis request status
   */
  async analyzeDeal(dealId: string): Promise<AIAnalysis> {
    try {
      // Track the analysis request
      trackAnalysisRequest(dealId);
      
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/analyze`);
      const analysisData = response.data;

      // Cache the analysis request status
      try {
        const cachedDeals = JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');

        cachedDeals[dealId] = analysisData;
        localStorage.setItem('cached_deal_analyses', JSON.stringify(cachedDeals));
        console.log(`[DealsService] Cached analysis request for deal ${dealId}`);
      } catch (e) {
        console.error(`[DealsService] Error caching analysis request:`, e);
      }

      return analysisData;
    } catch (error) {
      console.error(`Error requesting analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh a deal's information from its source
   * @param dealId Deal ID
   * @returns Promise with the updated deal
   */
  async refreshDeal(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/refresh`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh AI analysis for a deal
   * @param dealId Deal ID
   * @returns Promise with the updated deal including fresh analysis
   */
  async refreshDealAnalysis(dealId: string): Promise<DealResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/analyze`);
      const dealData = response.data;
      
      // Update the analysis cache if the response includes analysis data
      if (dealData && dealData.ai_analysis) {
        try {
          const cachedDeals = JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');
          cachedDeals[dealId] = dealData.ai_analysis;
          localStorage.setItem('cached_deal_analyses', JSON.stringify(cachedDeals));
          console.log(`[DealsService] Updated cached analysis for deal ${dealId}`);
        } catch (e) {
          console.error(`[DealsService] Error updating cached analysis:`, e);
        }
      }
      
      return dealData;
    } catch (error) {
      console.error(`Error refreshing analysis for deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Validate a deal
   * @param dealId Deal ID
   * @returns Promise with validation result
   */
  async validateDeal(dealId: string): Promise<{is_valid: boolean; validation_details: any}> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/${dealId}/validate`, {});
      return response.data;
    } catch (error) {
      console.error(`Error validating deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Track a deal (start monitoring)
   * @param dealId Deal ID
   */
  async trackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_URL}/${dealId}/track`);
    } catch (error) {
      console.error(`Error tracking deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Untrack a deal (stop monitoring)
   * @param dealId Deal ID
   */
  async untrackDeal(dealId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${dealId}/track`);
    } catch (error) {
      console.error(`Error untracking deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Get all deals tracked by the current user
   * @returns Promise with tracked deals
   */
  async getTrackedDeals(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/tracked`);
      return response.data;
    } catch (error) {
      console.error('Error getting tracked deals:', error);
      throw error;
    }
  }

  /**
   * Clear cached analysis for a specific deal
   * @param dealId Deal ID
   * @returns Boolean indicating success
   */
  clearCachedAnalysis(dealId: string): boolean {
    try {
      const cachedDeals = JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');
      if (dealId in cachedDeals) {
        delete cachedDeals[dealId];
        localStorage.setItem('cached_deal_analyses', JSON.stringify(cachedDeals));
        console.log(`[DealsService] Cleared cached analysis for deal ${dealId}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`[DealsService] Error clearing cached analysis:`, e);
      return false;
    }
  }

  /**
   * Clear all cached analyses
   * @returns Boolean indicating success
   */
  clearAllCachedAnalyses(): boolean {
    try {
      localStorage.removeItem('cached_deal_analyses');
      console.log(`[DealsService] Cleared all cached analyses`);
      return true;
    } catch (e) {
      console.error(`[DealsService] Error clearing all cached analyses:`, e);
      return false;
    }
  }

  /**
   * Get all cached deal analyses
   * @returns Object mapping deal IDs to their cached analyses
   */
  getAllCachedAnalyses(): Record<string, AIAnalysis> {
    try {
      return JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');
    } catch (e) {
      console.error(`[DealsService] Error retrieving cached analyses:`, e);
      return {};
    }
  }

  /**
   * Check if analysis is cached for a deal
   * @param dealId Deal ID
   * @returns Boolean indicating if analysis is cached
   */
  isAnalysisCached(dealId: string): boolean {
    try {
      const cachedDeals = JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');
      return dealId in cachedDeals && cachedDeals[dealId].status === 'completed';
    } catch (e) {
      console.error(`[DealsService] Error checking cached analysis:`, e);
      return false;
    }
  }

  /**
   * Get cached analysis for a deal without making an API call
   * @param dealId Deal ID
   * @returns Cached analysis or null if not found
   */
  getCachedAnalysis(dealId: string): AIAnalysis | null {
    try {
      const cachedDeals = JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');
      return cachedDeals[dealId] || null;
    } catch (e) {
      console.error(`[DealsService] Error retrieving cached analysis:`, e);
      return null;
    }
  }

  /**
   * Save cached analysis for a deal
   * @param dealId Deal ID
   * @param analysisData AI analysis data
   */
  saveCachedAnalysis(dealId: string, analysisData: AIAnalysis): void {
    try {
      const cachedDeals = JSON.parse(localStorage.getItem('cached_deal_analyses') || '{}');
      cachedDeals[dealId] = analysisData;
      localStorage.setItem('cached_deal_analyses', JSON.stringify(cachedDeals));
      console.log(`[DealsService] Cached analysis for deal ${dealId}`);
    } catch (e) {
      console.error(`[DealsService] Error caching analysis:`, e);
    }
  }
}

// Export a singleton instance for use across the app
export const dealsService = new DealsService(); 