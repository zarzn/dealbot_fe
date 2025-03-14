import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// Notification type definition
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
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
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

/**
 * Notification API service for interacting with notification endpoints and WebSocket
 */
class NotificationApiService {
  private static BASE_URL = `/api/v1/notifications`;
  private webSocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

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
      return response.data;
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
  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.put(`${NotificationApiService.BASE_URL}/${id}/read`);
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @returns Promise with operation result
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put(`${NotificationApiService.BASE_URL}/read-all`);
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
      await apiClient.delete(`${NotificationApiService.BASE_URL}/clear-all`);
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
    try {
      // Clean up any existing connection
      this.cleanupWebSocket();
      
      // Get authentication token for WebSocket
      const tokenResponse = await apiClient.get(`${NotificationApiService.BASE_URL}/websocket-token`);
      const token = tokenResponse.data.token;
      
      // Create WebSocket URL (adjust based on your API configuration)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/notifications/ws?token=${token}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.webSocket = new WebSocket(wsUrl);
      
      // Setup event handlers
      this.webSocket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        if (options.onConnect) {
          options.onConnect();
        }
      };
      
      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'notification' && options.onNotification) {
            options.onNotification(data.notification);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      this.webSocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        
        if (options.onDisconnect) {
          options.onDisconnect();
        }
        
        // Attempt to reconnect if not a clean close
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.setupWebSocket(options);
          }, delay);
        }
      };
      
      this.webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (options.onError) {
          options.onError(error);
        }
      };
      
      // Return cleanup function
      return () => this.cleanupWebSocket();
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      toast.error('Failed to connect to notification service');
      
      // Return no-op cleanup function
      return () => {};
    }
  }
  
  /**
   * Clean up WebSocket connection
   */
  private cleanupWebSocket(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.webSocket) {
      // Remove all event listeners
      this.webSocket.onopen = null;
      this.webSocket.onmessage = null;
      this.webSocket.onclose = null;
      this.webSocket.onerror = null;
      
      // Close connection if not already closed
      if (this.webSocket.readyState === WebSocket.OPEN || 
          this.webSocket.readyState === WebSocket.CONNECTING) {
        this.webSocket.close();
      }
      
      this.webSocket = null;
    }
  }
}

// Export a singleton instance for use across the app
export const notificationService = new NotificationApiService();