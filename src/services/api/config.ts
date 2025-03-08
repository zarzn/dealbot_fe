// API Configuration with improved environment detection
// This ensures we always use the correct API URLs in production

// Determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Determine if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// HARDCODED PRODUCTION URLS - these will be used in production
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

// Always log configuration to help with debugging
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
console.log('Final API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  version: API_CONFIG.version,
  fullUrl: API_CONFIG.fullUrl,
  wsUrl: WS_URL,
  isDevelopment,
  isBrowser,
  hostname: isBrowser ? window.location.hostname : 'not in browser'
});

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.baseURL}/api/${API_CONFIG.version}${url}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  
  // User
  USER_PROFILE: '/users/profile',
  USER_SETTINGS: '/users/settings',
  
  // Goals
  GOALS: '/goals',
  GOAL_BY_ID: (id: string) => `/goals/${id}`,
  
  // Deals
  DEALS: '/deals',
  DEAL_BY_ID: (id: string) => `/deals/${id}`,
  DEAL_SEARCH: '/deals/search',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_BY_ID: (id: string) => `/notifications/${id}`,
  
  // Token
  TOKEN_BALANCE: '/token/balance',
  TOKEN_TRANSACTIONS: '/token/transactions',
} as const; 