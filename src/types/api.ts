// Common Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  referral_code: string;
  referred_by?: string;
  token_balance: number;
  is_active: boolean;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notification_settings?: NotificationSettings;
  theme?: 'light' | 'dark';
  language?: string;
}

export interface NotificationSettings {
  email: boolean;
  in_app: boolean;
  deal_alerts: boolean;
  price_changes: boolean;
}

// Goal Types
export interface Goal {
  id: string;
  user_id: string;
  item_category: string;
  title: string;
  constraints: GoalConstraints;
  deadline?: string;
  status: 'active' | 'paused' | 'completed' | 'expired';
  priority: number;
  created_at: string;
  updated_at: string;
  last_checked_at?: string;
}

export interface GoalConstraints {
  max_price?: number;
  min_price?: number;
  brands?: string[];
  conditions?: string[];
  keywords?: string[];
}

// Deal Types
export interface Deal {
  id: string;
  goal_id: string;
  product_name: string;
  description?: string;
  price: number;
  original_price?: number;
  currency: string;
  source: string;
  url: string;
  image_url?: string;
  found_at: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'invalid';
  metadata?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  deal_id?: string;
  type: 'email' | 'in_app' | 'chat';
  status: 'pending' | 'sent' | 'failed' | 'read';
  content: NotificationContent;
  error?: string;
  created_at: string;
  sent_at?: string;
  read_at?: string;
}

export interface NotificationContent {
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Token Types
export interface TokenTransaction {
  id: string;
  user_id: string;
  type: 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  referral_code?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
} 