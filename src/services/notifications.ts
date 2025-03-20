import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { API_CONFIG, WS_URL } from '@/services/api/config';

// Backend notification types (from backend enum)
export type NotificationType = 
  | 'system'
  | 'deal'
  | 'goal'
  | 'price_alert'
  | 'token'
  | 'security'
  | 'market';

// Visual style types for UI
export type NotificationStyleType = 'info' | 'success' | 'warning' | 'error';

// Map backend types to visual styles
export function getNotificationStyle(type: NotificationType): NotificationStyleType {
  switch (type) {
    case 'system':
      return 'info';
    case 'deal':
      return 'success';
    case 'goal':
      return 'success';
    case 'price_alert':
      return 'info';
    case 'token':
      return 'info';
    case 'security':
      return 'warning';
    case 'market':
      return 'info';
    default:
      return 'info';
  }
}

// Notification type definition
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  read_at?: string;
  link?: string;
  deal_id?: string;
  created_at: string;
  expires_at?: string;
  meta?: Record<string, any>;
}

// WebSocket connection options
export interface WebSocketOptions {
  onNotification?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: (event?: CloseEvent) => void;
  onError?: (error: Event) => void;
}

/**
 * Notification API service for interacting with notification endpoints and WebSocket
 */
class NotificationApiService {
  private static BASE_URL = `/api/v1/notifications`;
  private webSocket: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private lastConnectionAttempt: number = 0;
  // Minimum time between connection attempts in milliseconds (5 seconds)
  private readonly MIN_CONNECTION_INTERVAL = 5000;

  /**
   * Get all notifications for the current user
   * @param page Page number
   * @param limit Items per page
   * @returns Promise with notifications list
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<{ 
    notifications: Notification[]; 
    total: number; 
    unread: number; 
  }> {
    try {
      const response = await apiClient.get(
        `${NotificationApiService.BASE_URL}?page=${page}&limit=${limit}`
      );
      
      // Handle both response formats - direct array or object with notifications field
      let notifications: any[] = [];
      
      if (Array.isArray(response.data)) {
        // Backend is returning an array directly - convert to expected format
        console.log('Backend returned array format, converting to object format');
        notifications = response.data;
      } else if (response.data.notifications) {
        // Backend is returning expected object format
        notifications = response.data.notifications;
      } else {
        console.warn('Unexpected response format from notifications API', response.data);
        notifications = [];
      }
      
      // Convert read_at to read boolean for each notification
      const processedNotifications = notifications.map(notification => ({
        ...notification,
        // Set read property based on read_at timestamp
        read: !!notification.read_at,
        // Keep read_at for reference if needed
        read_at: notification.read_at
      }));
      
      const unreadCount = processedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: processedNotifications,
        total: processedNotifications.length,
        unread: unreadCount
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Promise with operation result
   */
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiClient.put(`${NotificationApiService.BASE_URL}/${id}/read`);
      
      // Process the response to ensure it has the correct read property
      const notification = response.data;
      
      // Ensure the notification has a read property based on read_at
      if (notification) {
        notification.read = !!notification.read_at;
      }
      
      return notification;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @returns Promise with operation result
   */
  async markAllAsRead(): Promise<Notification[]> {
    try {
      const response = await apiClient.put(`${NotificationApiService.BASE_URL}/read-all`);
      
      // Process the response to ensure all notifications have the correct read property
      let notifications: Notification[] = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          notifications = response.data;
        } else if (response.data.notifications) {
          notifications = response.data.notifications;
        }
        
        // Ensure each notification has a read property
        notifications = notifications.map(notification => ({
          ...notification,
          read: !!notification.read_at
        }));
      }
      
      return notifications;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   * @returns Promise with operation result
   */
  async clearAll(): Promise<void> {
    try {
      await apiClient.delete(`${NotificationApiService.BASE_URL}/all`);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Promise with operation result
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`${NotificationApiService.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Setup WebSocket connection for real-time notifications
   * @param options WebSocket connection options
   * @returns Cleanup function
   */
  async setupWebSocket(options: WebSocketOptions): Promise<() => void> {
    // Prevent too frequent connection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.MIN_CONNECTION_INTERVAL) {
      console.log('Skipping WebSocket connection attempt (too soon after previous attempt)');
      return () => {};
    }
    
    this.lastConnectionAttempt = now;
    
    try {
      // Clean up any existing connection
      this.cleanupWebSocket();
      
      // Get authentication token for WebSocket
      let token;
      try {
        // First try to get the token from the API
        const tokenResponse = await apiClient.get(`${NotificationApiService.BASE_URL}/websocket-token`);
        token = tokenResponse.data.token;
      } catch (error) {
        console.warn('Failed to get WebSocket token from API, using test token');
        // Fallback to test token for development/testing
        token = 'test_websocket_token_test';
      }
      
      // TEMPORARY: Direct connection to backend for testing
      const wsUrl = `ws://localhost:8000/api/v1/notifications/ws?token=${token}`;
      console.log('TESTING: Direct connection to WebSocket server');
      
      // Log connection attempts in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Connecting to WebSocket:', wsUrl.replace(token, '[REDACTED]'));
      }
      
      try {
        this.webSocket = new WebSocket(wsUrl);
        
        // Setup event handlers with minimal logging
        this.webSocket.onopen = (event) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('WebSocket connection established successfully');
          }
          
          if (options.onConnect) {
            options.onConnect();
          }
        };
        
        this.webSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Enhanced logging to debug notification issues
            console.log('Raw WebSocket message received:', event.data);
            console.log('Parsed WebSocket message:', data);
            
            // Only log important messages or in development mode
            if (process.env.NODE_ENV === 'development' && data.type !== 'pong') {
              console.log('WebSocket message received:', data);
            }
            
            if (data.type === 'notification' && options.onNotification) {
              console.log('Notification received, passing to handler:', data.notification);
              options.onNotification(data.notification);
            } else if (data.type === 'notification') {
              console.warn('Notification received but no handler available');
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
        
        this.webSocket.onclose = (event) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('WebSocket connection closed:', event);
          }
          
          if (options.onDisconnect) {
            options.onDisconnect(event);
          }
        };
        
        this.webSocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          
          if (options.onError) {
            options.onError(error);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        
        if (options.onError) {
          options.onError(error as Event);
        }
      }
      
      // Return cleanup function
      return () => this.cleanupWebSocket();
    } catch (error) {
      console.error('Error in setupWebSocket:', error);
      
      if (options.onError) {
        options.onError(error as Event);
      }
      
      return () => {};
    }
  }
  
  /**
   * Clean up WebSocket connection
   */
  private cleanupWebSocket(): void {
    if (this.webSocket) {
      try {
        // Only close if connection is open or connecting
        if (this.webSocket.readyState === WebSocket.OPEN || 
            this.webSocket.readyState === WebSocket.CONNECTING) {
          this.webSocket.close(1000, "Deliberately closed by client");
        }
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.webSocket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationApiService();