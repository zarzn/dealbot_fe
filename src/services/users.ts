import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from './api/config';

// Frontend interface for simplified notification preferences display
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

// This matches the actual backend structure
export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  timezone: string;
  enabled_channels: string[];
  notification_frequency: {
    [key: string]: string | { type: string; frequency: string };
  };
  time_windows: Record<string, any>;
  muted_until: string | null;
  do_not_disturb: boolean;
  email_digest: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  telegram_enabled: boolean;
  discord_enabled: boolean;
  minimum_priority: string;
  deal_alert_settings: Record<string, any>;
  price_alert_settings: Record<string, any>;
  email_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // For UI display
  currency?: string;
  deal_filters?: Record<string, any>;
  notification_preferences?: NotificationPreferences;
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

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * User service for managing user data and settings
 */
export class UserService {
  private profileCache: CacheItem<UserProfile> | null = null;
  private settingsCache: CacheItem<UserSettings> | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private profilePromise: Promise<UserProfile> | null = null;
  private settingsPromise: Promise<UserSettings> | null = null;

  /**
   * Get user profile with caching
   * @param {boolean} forceRefresh - Force refresh from API ignoring cache
   * @returns {Promise<UserProfile>} - User profile
   */
  async getProfile(forceRefresh = false): Promise<UserProfile> {
    // Check if we have a valid cached profile and not forcing refresh
    const now = Date.now();
    if (!forceRefresh && this.profileCache && this.profileCache.expiresAt > now) {
      console.log('Using cached profile data');
      return this.profileCache.data;
    }

    // If we're already fetching the profile, reuse that promise
    if (this.profilePromise) {
      console.log('Reusing in-flight profile request');
      return this.profilePromise;
    }

    // Otherwise, fetch from API
    console.log('Fetching fresh profile data from API');
    this.profilePromise = apiClient.get(API_ENDPOINTS.USER_PROFILE)
      .then(response => {
        const profile = response.data;
        
        // Cache the profile
        this.profileCache = {
          data: profile,
          timestamp: now,
          expiresAt: now + this.CACHE_DURATION
        };
        
        // Return the profile data
        return profile;
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        throw error;
      })
      .finally(() => {
        // Clear the promise after it's done
        setTimeout(() => {
          this.profilePromise = null;
        }, 100);
      });
    
    return this.profilePromise;
  }

  /**
   * Update user profile
   * @param {Partial<UserProfile>} data - Profile data to update
   * @returns {Promise<UserProfile>} - Updated user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_PROFILE, data);
      
      // Update cache with the new profile data
      const now = Date.now();
      this.profileCache = {
        data: response.data,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION
      };
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user settings with caching
   * @param {boolean} forceRefresh - Force refresh from API ignoring cache
   * @returns {Promise<UserSettings>} - User settings
   */
  async getSettings(forceRefresh = false): Promise<UserSettings> {
    // Check if we have a valid cached settings and not forcing refresh
    const now = Date.now();
    if (!forceRefresh && this.settingsCache && this.settingsCache.expiresAt > now) {
      console.log('Using cached settings data');
      return this.settingsCache.data;
    }

    // If we're already fetching the settings, reuse that promise
    if (this.settingsPromise) {
      console.log('Reusing in-flight settings request');
      return this.settingsPromise;
    }

    // Otherwise, fetch from API
    console.log('Fetching fresh settings data from API');
    this.settingsPromise = apiClient.get(API_ENDPOINTS.USER_SETTINGS)
      .then(response => {
        const settings = response.data;
        
        // Cache the settings
        this.settingsCache = {
          data: settings,
          timestamp: now,
          expiresAt: now + this.CACHE_DURATION
        };
        
        // Return the settings data
        return settings;
      })
      .catch(error => {
        console.error('Error fetching user settings:', error);
        throw error;
      })
      .finally(() => {
        // Clear the promise after it's done
        setTimeout(() => {
          this.settingsPromise = null;
        }, 100);
      });
    
    return this.settingsPromise;
  }

  /**
   * Update user settings
   * @param {Partial<UserSettings>} data - Settings data to update
   * @returns {Promise<UserSettings>} - Updated user settings
   */
  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    try {
      console.log('Sending settings update request with data:', JSON.stringify(data, null, 2));
      
      // Make the API call
      const response = await apiClient.patch(API_ENDPOINTS.USER_SETTINGS, data);
      console.log('Settings update response raw:', response);
      console.log('Settings update response data:', JSON.stringify(response.data, null, 2));
      
      // Get the updated settings from the response
      const updatedSettings = { ...response.data };
      
      // Make sure all required properties are present
      if (!updatedSettings.enabled_channels) {
        console.log('Initializing enabled_channels as it was missing');
        updatedSettings.enabled_channels = [];
      }
      
      if (!updatedSettings.notification_frequency) {
        console.log('Initializing notification_frequency as it was missing');
        updatedSettings.notification_frequency = {};
      }
      
      // Ensure we have all key notification types with default values
      const notificationTypes = ['deal', 'price_alert', 'token', 'market', 'goal', 'security', 'system'];
      for (const type of notificationTypes) {
        if (!updatedSettings.notification_frequency[type]) {
          console.log(`Setting default value for missing notification type: ${type}`);
          updatedSettings.notification_frequency[type] = type === 'market' ? 'weekly' : 'immediate';
        }
      }
      
      // Update cache with the new settings data
      const now = Date.now();
      this.settingsCache = {
        data: updatedSettings,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION
      };
      
      console.log('Final processed settings update response:', JSON.stringify(updatedSettings, null, 2));
      return updatedSettings;
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

  /**
   * Clear all caches
   * Used when logging out or when cache data is known to be invalid
   */
  clearCaches(): void {
    this.profileCache = null;
    this.settingsCache = null;
    this.profilePromise = null;
    this.settingsPromise = null;
    console.log('User service caches cleared');
  }
}

// Export a singleton instance
export const userService = new UserService(); 