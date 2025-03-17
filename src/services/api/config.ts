// API Configuration with improved environment detection
// This ensures we always use the correct API URLs in production

// Determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Determine if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// HARDCODED PRODUCTION URL - this will be used as a fallback
const PRODUCTION_API_URL = 'https://7oxq7ujcmc.execute-api.us-east-1.amazonaws.com/prod';
const PRODUCTION_WS_URL = 'wss://1ze1jsv3qg.execute-api.us-east-1.amazonaws.com/prod';
const API_VERSION = 'v1';

// IMPORTANT: In production, ALWAYS use production URLs
// Only use localhost if we're explicitly in development mode AND not in a browser
// In browsers, we always force production URLs unless explicitly in development mode
const apiUrl = isDevelopment ? 'http://localhost:8000' : PRODUCTION_API_URL;
const apiVersion = API_VERSION;
const wsUrl = isDevelopment ? 'ws://localhost:8000' : PRODUCTION_WS_URL;

// For client-side code in browsers, we need to be extra careful and force production URLs
// This prevents the common issue where NODE_ENV might not be correctly set in the browser
const finalApiUrl = isBrowser && !isDevelopment ? PRODUCTION_API_URL : apiUrl;
const finalWsUrl = isBrowser && !isDevelopment ? PRODUCTION_WS_URL : wsUrl;

// Export the base URL for use in api-client.ts
export const API_BASE_URL = finalApiUrl;

// Always log configuration to help with debugging
if (isDevelopment) {
  console.log('API Configuration:', {
    providedApiUrl: apiUrl,
    finalApiUrl,
    apiVersion,
    finalWsUrl,
    isDevelopment,
    NODE_ENV: process.env.NODE_ENV,
    isBrowser,
    hostname: isBrowser ? window.location.hostname : 'not in browser'
  });
}

// Define API configuration
export const API_CONFIG = {
  // Use the final API URL that has been determined based on environment
  baseURL: finalApiUrl,
  version: apiVersion,
  timeout: 30000, // 30 seconds
  // For debugging - full URL that will be used
  get fullUrl() {
    return `${this.baseURL}/api/${this.version}`;
  }
};

// Define WebSocket URL with the final WS URL
export const WS_URL = isDevelopment
  ? `ws://localhost:8000/api/${apiVersion}/ws` 
  : `${finalWsUrl}/api/${apiVersion}/ws`;

// Always log the final configuration to help with debugging
if (isDevelopment) {
  console.log('Final API Configuration:', {
    baseURL: API_CONFIG.baseURL,
    version: API_CONFIG.version,
    fullUrl: API_CONFIG.fullUrl,
    wsUrl: WS_URL,
    isDevelopment,
    isBrowser,
    hostname: isBrowser ? window.location.hostname : 'not in browser'
  });
}

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.baseURL}/api/${API_CONFIG.version}${url}`;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh-token',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  
  // User
  USER_PROFILE: '/api/v1/users/profile',
  USER_SETTINGS: '/api/v1/users/settings',
  TOKEN_BALANCE: '/api/v1/users/token-balance',
  
  // Deals
  DEALS: '/api/v1/deals',
  DEALS_SEARCH: '/api/v1/deals/search',
  DEALS_RECENT: '/api/v1/deals/recent',
  DEALS_METRICS: '/api/v1/deals/metrics',
  DEAL_DETAILS: (id: string) => `/api/v1/deals/${id}`,
  SIMILAR_DEALS: (id: string) => `/api/v1/deals/${id}/similar`,
  
  // Goals
  GOALS: '/api/v1/goals',
  GOAL_DETAILS: (id: string) => `/api/v1/goals/${id}`,
  GOAL_ACTIVATE: (id: string) => `/api/v1/goals/${id}/activate`,
  GOAL_DEACTIVATE: (id: string) => `/api/v1/goals/${id}/deactivate`,
  
  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/api/v1/notifications/${id}/read`,
  NOTIFICATIONS_COUNT: '/api/v1/notifications/count',
  NOTIFICATION_SETTINGS: '/api/v1/notifications/settings',
  WEBSOCKET_TOKEN: '/api/v1/notifications/websocket-token',
  
  // Analytics
  DASHBOARD_ANALYTICS: '/api/v1/analytics/dashboard',
  PERFORMANCE_ANALYTICS: '/api/v1/analytics/performance',
  
  // Wallet
  TOKEN_TRANSACTIONS: '/api/v1/token/transactions',
} as const;

export default API_ENDPOINTS; 