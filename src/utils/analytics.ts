import { AIAnalysis } from '@/types/deals';

/**
 * Analytics utility for tracking and retrieving AI analysis performance metrics.
 * This module handles storing and retrieving analytics data from localStorage.
 */

// Types for analytics tracking
export interface AnalysisEvent {
  dealId: string;
  type: 'request' | 'completion';
  status: 'pending' | 'success' | 'error' | 'cached';
  timestamp: number;
  duration?: number;
  tokenCost?: number;
  cached?: boolean;
}

export interface AnalysisMetrics {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  cachedResponses: number;
  totalDuration: number;
  averageResponseTime: number;
  tokenCosts: number;
  lastUpdated: number;
}

// Constants
const ANALYTICS_HISTORY_KEY = 'analytics_history';
const ANALYTICS_METRICS_KEY = 'analytics_metrics';
const MAX_HISTORY_ITEMS = 100;

/**
 * Track an analysis request in analytics
 * @param dealId The ID of the deal being analyzed
 */
export const trackAnalysisRequest = (dealId: string): void => {
  try {
    const event: AnalysisEvent = {
      dealId,
      type: 'request',
      status: 'pending',
      timestamp: Date.now(),
    };
    
    // Add to history
    const history = getAnalysisHistory();
    history.unshift(event);
    
    // Limit history size
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(ANALYTICS_HISTORY_KEY, JSON.stringify(limitedHistory));
    
    // Update metrics
    const metrics = getAnalysisMetrics();
    metrics.totalRequests += 1;
    metrics.lastUpdated = Date.now();
    localStorage.setItem(ANALYTICS_METRICS_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.error('Error tracking analysis request:', error);
  }
};

/**
 * Track an analysis completion in analytics
 * @param dealId The ID of the deal that was analyzed
 * @param status The status of the analysis (success, error, cached)
 * @param duration How long the analysis took in milliseconds
 * @param tokenCost How many tokens were consumed (if applicable)
 * @param cached Whether the response was served from cache
 */
export const trackAnalysisCompletion = (
  dealId: string,
  status: 'success' | 'error' | 'cached',
  duration?: number,
  tokenCost?: number,
  cached?: boolean
): void => {
  try {
    const event: AnalysisEvent = {
      dealId,
      type: 'completion',
      status,
      timestamp: Date.now(),
      duration,
      tokenCost,
      cached,
    };
    
    // Add to history
    const history = getAnalysisHistory();
    history.unshift(event);
    
    // Limit history size
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(ANALYTICS_HISTORY_KEY, JSON.stringify(limitedHistory));
    
    // Update metrics
    const metrics = getAnalysisMetrics();
    
    // Update based on status
    if (status === 'success') {
      metrics.successfulRequests += 1;
    } else if (status === 'error') {
      metrics.errorRequests += 1;
    }
    
    if (cached) {
      metrics.cachedResponses += 1;
    }
    
    // Update durations and costs
    if (duration) {
      metrics.totalDuration += duration;
      metrics.averageResponseTime = metrics.totalDuration / 
        (metrics.successfulRequests || 1); // Avoid division by zero
    }
    
    if (tokenCost) {
      metrics.tokenCosts += tokenCost;
    }
    
    metrics.lastUpdated = Date.now();
    localStorage.setItem(ANALYTICS_METRICS_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.error('Error tracking analysis completion:', error);
  }
};

/**
 * Get the analysis history from localStorage
 * @returns Array of analysis events
 */
export const getAnalysisHistory = (): AnalysisEvent[] => {
  try {
    const historyString = localStorage.getItem(ANALYTICS_HISTORY_KEY);
    if (historyString) {
      return JSON.parse(historyString);
    }
  } catch (error) {
    console.error('Error retrieving analysis history:', error);
  }
  
  return [];
};

/**
 * Get the analysis metrics from localStorage
 * @returns Analysis metrics object
 */
export const getAnalysisMetrics = (): AnalysisMetrics => {
  try {
    const metricsString = localStorage.getItem(ANALYTICS_METRICS_KEY);
    if (metricsString) {
      return JSON.parse(metricsString);
    }
  } catch (error) {
    console.error('Error retrieving analysis metrics:', error);
  }
  
  // Return default metrics if none exist
  return {
    totalRequests: 0,
    successfulRequests: 0,
    errorRequests: 0,
    cachedResponses: 0,
    totalDuration: 0,
    averageResponseTime: 0,
    tokenCosts: 0,
    lastUpdated: Date.now(),
  };
};

/**
 * Clear all analytics data
 */
export const clearAnalyticsData = (): void => {
  try {
    localStorage.removeItem(ANALYTICS_HISTORY_KEY);
    localStorage.removeItem(ANALYTICS_METRICS_KEY);
  } catch (error) {
    console.error('Error clearing analytics data:', error);
  }
};

/**
 * Get tracked deal IDs from localStorage
 * @returns Array of deal IDs that have been analyzed
 */
export const getTrackedDeals = (): string[] => {
  try {
    const history = getAnalysisHistory();
    const dealIds = new Set<string>();
    
    history.forEach(event => {
      if (event.dealId) {
        dealIds.add(event.dealId);
      }
    });
    
    return Array.from(dealIds);
  } catch (error) {
    console.error('Error getting tracked deals:', error);
    return [];
  }
};

/**
 * Clear cached analysis for a specific deal
 * @param dealId The ID of the deal to clear cache for
 */
export const clearCachedAnalysis = (dealId: string): void => {
  try {
    localStorage.removeItem(`deal_analysis_${dealId}`);
  } catch (error) {
    console.error(`Error clearing cached analysis for deal ${dealId}:`, error);
  }
};

/**
 * Clear all cached analyses
 */
export const clearAllCachedAnalyses = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('deal_analysis_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cached analyses:', error);
  }
};

/**
 * Get a list of all cached analyses
 * @returns Array of deal IDs with cached analyses
 */
export const getCachedAnalyses = (): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith('deal_analysis_'))
      .map(key => key.replace('deal_analysis_', ''));
  } catch (error) {
    console.error('Error getting cached analyses:', error);
    return [];
  }
}; 