/**
 * API Base URL
 * - Uses environment variable in production
 * - Falls back to localhost in development
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Site Base URL
 * - Uses environment variable in production
 * - Falls back to localhost in development
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * WebSocket URL for real-time updates
 * - Uses environment variable in production
 * - Falls back to localhost in development
 */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

/**
 * Default pagination limit for API requests
 */
export const DEFAULT_PAGINATION_LIMIT = 20;

/**
 * Authentication token storage key
 */
export const AUTH_TOKEN_KEY = 'auth_token';

/**
 * User data storage key
 */
export const USER_DATA_KEY = 'user_data';

/**
 * Deal statuses
 */
export const DEAL_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PENDING: 'pending',
  DELETED: 'deleted',
};

/**
 * Deal categories
 */
export const DEAL_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Books & Media',
  'Travel',
  'Food & Drink',
  'Services',
  'Other',
];

/**
 * Deal types
 */
export const DEAL_TYPES = [
  'discount',
  'coupon',
  'freebie',
  'bundle',
  'sale',
  'clearance',
  'exclusive',
];

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  DEAL: 'deal',
  PRICE_ALERT: 'price_alert',
  GOAL: 'goal',
  SECURITY: 'security',
  TOKEN: 'token',
  MARKET: 'market',
};

/**
 * Date format for display
 */
export const DATE_FORMAT = 'MMMM d, yyyy';

/**
 * Time format for display
 */
export const TIME_FORMAT = 'h:mm a';

/**
 * Full datetime format for display
 */
export const DATETIME_FORMAT = `${DATE_FORMAT} '${TIME_FORMAT}'`;

/**
 * Maximum file upload size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed file types for uploads
 */
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Currencies supported by the app
 */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

/**
 * Rate limit for API requests per minute
 */
export const API_RATE_LIMIT = 60; 