/**
 * User-related types
 */

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface NotificationPreference {
  in_app: boolean;
  email: boolean;
  push: boolean;
  telegram?: boolean;
  discord?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: 'all' | 'important' | 'minimal' | 'none';
  email_notifications: boolean;
  push_notifications: boolean;
  telegram_notifications?: boolean;
  discord_notifications?: boolean;
  deal_alert_threshold: number;
  auto_buy_enabled: boolean;
  auto_buy_threshold: number;
  max_auto_buy_amount: number;
  language: string;
  timezone: string;
  currency?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  sol_address?: string;
  referral_code?: string;
  referred_by?: string;
  preferences: UserPreferences;
  status: UserStatus;
  notification_channels: string[];
  email_verified: boolean;
  social_provider?: string;
  social_id?: string;
  created_at: string;
  updated_at: string;
  last_payment_at?: string;
  active_goals_count: number;
  total_deals_found: number;
  success_rate: number;
  total_tokens_spent: number;
  total_rewards_earned: number;
  token_balance?: number;
}

export interface UserSignUpData {
  email: string;
  password: string;
  name?: string;
  sol_address?: string;
  referral_code?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserUpdateData {
  email?: string;
  password?: string;
  name?: string;
  sol_address?: string;
  preferences?: Partial<UserPreferences>;
  notification_channels?: string[];
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
} 