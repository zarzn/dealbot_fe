import { api } from '@/lib/api';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { 
  Notification as ApiNotification, 
  NotificationPreferences as ApiNotificationPreferences 
} from '@/types/api';
import { API_CONFIG, WS_URL } from '@/services/api/config';

// Local service interfaces - to be eventually updated to match API types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  status: string; // Added to match API type
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  enabled_channels: string[];
  notification_frequency: Record<string, string>;
  time_windows: Record<string, {
    start_time: string;
    end_time: string;
    timezone: string;
  }>;
  muted_until: string | null;
  do_not_disturb: boolean;
  email_digest: boolean;
  push_enabled: boolean;
  minimum_priority: string;
}

// Create axios instance with default config
const notificationsApi = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/notifications`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the API URLs in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Notification Service using API URL:', `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/notifications`);
  console.log('Notification Service using WS URL:', WS_URL);
}

// Add auth token to requests
notificationsApi.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Helper to convert API notification to service notification format if needed
const convertApiNotification = (apiNotification: ApiNotification): ApiNotification => {
  return apiNotification;
};

// Helper to convert service preference to API preference format if needed
const convertToApiPreference = (pref: NotificationPreferences): ApiNotificationPreferences => {
  return pref as unknown as ApiNotificationPreferences;
};

interface WebSocketCallbacks {
  onNotification: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class NotificationService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks = {
    onNotification: () => {} // Default empty handler to satisfy the type
  };
  private connectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // Base delay in milliseconds
  
  private lastNotificationTime = 0;
  private readonly notificationThrottle = 2000; // 2 seconds throttle
  private notificationQueue: Set<string> = new Set(); // Queue for deduplication

  constructor() {
    // Log URLs in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationService] Using WebSocket URL:', WS_URL);
      console.log('[NotificationService] Using API URL:', API_CONFIG.baseURL);
    }
  }

  // Fetch notifications from the API with throttling
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await api.get('/notifications');
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  }

  async markMultipleAsRead(notificationIds: string[]) {
    const response = await api.put<Notification[]>('/notifications/read', { notification_ids: notificationIds });
    return response.data;
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/notifications/preferences');
    return response.data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  }

  async clearAll(): Promise<void> {
    await api.delete('/notifications');
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }

  // WebSocket connection for real-time notifications
  async setupWebSocket(callbacks: WebSocketCallbacks): Promise<() => void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[NotificationService] WebSocket already connected');
      return () => this.ws?.close();
    }

    console.log('[NotificationService] Setting up WebSocket...');
    
    try {
      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      const session = await getSession();
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      this.ws = new WebSocket(`${WS_URL}/notifications/ws?token=${session.accessToken}`);

      this.ws.onopen = () => {
        console.log('[NotificationService] WebSocket connected');
        this.connectAttempts = 0;
        callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle notification with throttling and deduplication
          if (message.type === 'notification' && message.data) {
            this.handleNotification(message.data, callbacks);
          } else if (message.type === 'error') {
            console.error('[NotificationService] Server error:', message.message);
            callbacks.onError?.(new ErrorEvent('error', { message: message.message }));
          }
        } catch (error) {
          console.error('[NotificationService] Error processing message:', error);
          callbacks.onError?.(new ErrorEvent('error', { error: error as Error }));
        }
      };

      this.ws.onclose = (event) => {
        console.log('[NotificationService] WebSocket closed:', event.code, event.reason);
        callbacks.onDisconnect?.();
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[NotificationService] WebSocket error:', error);
        callbacks.onError?.(error);
      };

      return () => {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      };
    } catch (error) {
      console.error('[NotificationService] Setup error:', error);
      callbacks.onError?.(new ErrorEvent('error', { error: error as Error }));
      throw error;
    }
  }

  private handleNotification(notification: Notification, callbacks: WebSocketCallbacks) {
    const now = Date.now();
    
    // Check throttle
    if (now - this.lastNotificationTime < this.notificationThrottle) {
      // Queue notification for later if not already queued
      if (!this.notificationQueue.has(notification.id)) {
        this.notificationQueue.add(notification.id);
        setTimeout(() => {
          this.processQueuedNotification(notification, callbacks);
        }, this.notificationThrottle);
      }
      return;
    }
    
    // Process notification immediately
    this.processNotification(notification, callbacks);
  }

  private processQueuedNotification(notification: Notification, callbacks: WebSocketCallbacks) {
    this.notificationQueue.delete(notification.id);
    this.processNotification(notification, callbacks);
  }

  private processNotification(notification: Notification, callbacks: WebSocketCallbacks) {
    this.lastNotificationTime = Date.now();
    callbacks.onNotification(notification);
  }

  private attemptReconnect() {
    if (this.connectAttempts >= this.maxReconnectAttempts) {
      console.log('[NotificationService] Max reconnect attempts reached');
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.connectAttempts);
    console.log(`[NotificationService] Attempting to reconnect in ${delay}ms (attempt ${this.connectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connectAttempts++;
      this.setupWebSocket(this.callbacks).catch(error => {
        console.error('[NotificationService] Reconnect failed:', error);
      });
    }, delay);
  }
}

export const notificationService = new NotificationService();