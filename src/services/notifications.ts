import { api } from '@/lib/api';
import { getSession } from 'next-auth/react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  read_at: string | null;
  action_url: string | null;
  data?: any;
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

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay

  // Constants
  private WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

  async getNotifications(params: { limit?: number; offset?: number; unread_only?: boolean } = {}) {
    const response = await api.get<Notification[]>('/notifications', { params });
    return response.data;
  }

  async markAsRead(notificationId: string) {
    const response = await api.put<Notification>(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markMultipleAsRead(notificationIds: string[]) {
    const response = await api.put<Notification[]>('/notifications/read', { notification_ids: notificationIds });
    return response.data;
  }

  async getPreferences() {
    const response = await api.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    const response = await api.put<NotificationPreferences>('/notifications/preferences', preferences);
    return response.data;
  }

  // WebSocket connection for real-time notifications
  async setupWebSocket(onNotification: (notification: Notification) => void) {
    if (!this.WS_URL) {
      console.error('WebSocket URL not configured');
      return () => {};
    }

    // Get the session token from NextAuth
    const session = await getSession();
    if (!session?.accessToken) {
      console.error('No authentication session found');
      return () => {};
    }

    const wsUrl = `${this.WS_URL}/ws/notifications?token=${session.accessToken}`