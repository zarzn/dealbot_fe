// API Configuration with improved environment detection
// This ensures we always use the correct API URLs in production

// Determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Determine if we're running on localhost based ONLY on hostname
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

// HARDCODED PRODUCTION URLS - these will be used when not on localhost
const PRODUCTION_API_URL = 'https://7oxq7ujcmc.execute-api.us-east-1.amazonaws.com/prod';
const PRODUCTION_WS_URL = 'wss://1ze1jsv3qg.execute-api.us-east-1.amazonaws.com/prod';
const API_VERSION = 'v1';

// Get environment variables with fallbacks - only used in development
const apiUrl = isLocalhost ? 'http://localhost:8000' : PRODUCTION_API_URL;
const apiVersion = API_VERSION;
const wsUrl = isLocalhost ? 'ws://localhost:8000' : PRODUCTION_WS_URL;

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Always log configuration to help with debugging
console.log('API Configuration:', {
  apiUrl,
  apiVersion,
  wsUrl,
  isLocalhost,
  isDevelopment,
  NODE_ENV: process.env.NODE_ENV,
  hostname: isBrowser ? window.location.hostname : 'not in browser'
});

// Define API configuration
export const API_CONFIG = {
  // Use localhost ONLY if we're actually on localhost
  // Otherwise use the production API URL
  baseURL: apiUrl,
  version: apiVersion,
  // For debugging - full URL that will be used
  get fullUrl() {
    return `${this.baseURL}/api/${this.version}`;
  }
};

// Define WebSocket URL
export const WS_URL = isLocalhost 
  ? `ws://localhost:8000/api/${apiVersion}/ws` 
  : `${wsUrl}/api/${apiVersion}/ws`;

// Always log the final configuration to help with debugging
console.log('Final API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  version: API_CONFIG.version,
  fullUrl: API_CONFIG.fullUrl,
  wsUrl: WS_URL,
  isLocalhost,
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