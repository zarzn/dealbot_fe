export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
} as const;

export const getApiUrl = (endpoint: string): string => {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.baseURL}/api/${API_CONFIG.version}${url}`;
};

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  REFRESH_TOKEN: '/users/refresh-token',
  
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