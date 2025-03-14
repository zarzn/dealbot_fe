import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from './api/config';

export interface NotificationPreferences {
  email_alerts: boolean;
  browser_alerts: boolean;
  sms_alerts: boolean;
  price_drop_alerts: boolean;
  deal_expiration_alerts: boolean;
  token_alerts: boolean;
  daily_digest: boolean;
  weekly_summary: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  language: string;
  theme: string;
  deal_filters?: Record<string, any>;
  notification_preferences: NotificationPreferences;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  subscription_tier?: string;
  token_balance: number;
  active_goals_count: number;
  total_deals_found: number;
  success_rate: number;
  total_tokens_spent: number;
  total_rewards_earned: number;
  created_at: string;
  last_login?: string;
  email_verified: boolean;
}

/**
 * User service for managing user data and settings
 */
export class UserService {
  /**
   * Get user profile
   * @returns {Promise<UserProfile>} - User profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Partial<UserProfile>} data - Profile data to update
   * @returns {Promise<UserProfile>} - Updated user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USER_PROFILE, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user settings
   * @returns {Promise<UserSettings>} - User settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_SETTINGS);
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   * @param {Partial<UserSettings>} data - Settings data to update
   * @returns {Promise<UserSettings>} - Updated user settings
   */
  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USER_SETTINGS, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  /**
   * Get user token balance
   * @returns {Promise<{balance: number}>} - User token balance
   */
  async getTokenBalance(): Promise<{balance: number}> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TOKEN_BALANCE);
      return response.data;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userService = new UserService(); 