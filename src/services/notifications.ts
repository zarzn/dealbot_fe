import { api } from '@/lib/api';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { Notification, NotificationPreferences } from '@/types/api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
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
}

interface WebSocketCallbacks {
  onNotification: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // Base delay in milliseconds
  private readonly WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private lastNotificationTime = 0;
  private readonly notificationThrottle = 2000; // 2 seconds throttle
  private notificationQueue: Set<string> = new Set(); // Queue for deduplication

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

      this.ws = new WebSocket(`${this.WS_URL}/notifications/ws?token=${session.accessToken}`);

      this.ws.onopen = () => {
        console.log('[NotificationService] WebSocket connected');
        this.reconnectAttempts = 0;
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
          this.reconnect(callbacks);
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

  private async reconnect(callbacks: WebSocketCallbacks) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[NotificationService] Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`[NotificationService] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.setupWebSocket(callbacks).catch(error => {
      console.error('[NotificationService] Reconnection failed:', error);
    });
  }
}

export const notificationService = new NotificationService();