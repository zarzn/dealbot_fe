import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationList } from './NotificationList';
import { Notification, notificationService } from '@/services/notifications';
import { Badge } from '@/components/ui/badge';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    console.log('[NotificationBell] Component mounted');
    let cleanup: (() => void) | undefined;
    let loadingTimeout: NodeJS.Timeout;

    const setupNotifications = async () => {
      console.log('[NotificationBell] Starting initial setup');
      try {
        // Load initial notifications with a minimum loading time
        console.log('[NotificationBell] Loading initial notifications');
        setIsLoading(true);
        loadingTimeout = setTimeout(() => setIsLoading(false), 1000); // Minimum loading time
        await loadNotifications();
        
        // Setup WebSocket connection
        console.log('[NotificationBell] Setting up WebSocket connection');
        cleanup = await notificationService.setupWebSocket({
          onNotification: (notification) => {
            console.log('[NotificationBell] New notification received:', notification);
            // Check if notification already exists
            const exists = notifications.some(n => n.id === notification.id);
            if (exists) {
              console.log('[NotificationBell] Notification already exists, skipping');
              return;
            }
            
            setNotifications(prev => [notification, ...prev]);
            if (!notification.read) {
              console.log('[NotificationBell] Incrementing unread count');
              setUnreadCount(prev => prev + 1);
            }
          },
          onConnect: () => {
            console.log('[NotificationBell] WebSocket connected successfully');
            setIsConnected(true);
            setConnectionStatus('connected');
            // Only reload if we don't have notifications
            if (notifications.length === 0) {
              loadNotifications();
            }
          },
          onDisconnect: () => {
            console.log('[NotificationBell] WebSocket disconnected');
            setIsConnected(false);
            setConnectionStatus('disconnected');
          },
          onError: (error) => {
            console.error('[NotificationBell] WebSocket error:', error);
            setIsConnected(false);
            setConnectionStatus('error');
            setError('Failed to connect to notification service');
          }
        });
      } catch (error) {
        console.error('[NotificationBell] Setup error:', error);
        setError('Failed to setup notifications');
        setConnectionStatus('error');
      }
    };

    const loadNotifications = async () => {
      console.log('[NotificationBell] Loading notifications...');
      setIsLoading(true);
      try {
        const notifications = await notificationService.getNotifications();
        console.log('[NotificationBell] Loaded notifications:', notifications);
        setNotifications(notifications);
        const unreadCount = notifications.filter(n => !n.read).length;
        console.log('[NotificationBell] Setting unread count:', unreadCount);
        setUnreadCount(unreadCount);
        setError(null);
      } catch (error) {
        console.error('[NotificationBell] Error loading notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    setupNotifications();

    return () => {
      console.log('[NotificationBell] Component unmounting, cleaning up');
      clearTimeout(loadingTimeout);
      if (cleanup) {
        console.log('[NotificationBell] Running WebSocket cleanup');
        cleanup();
      }
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    console.log('[NotificationBell] Marking notification as read:', notificationId);
    try {
      // Update local state optimistically
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        console.log('[NotificationBell] Updated notifications after marking as read:', updated);
        return updated;
      });
      
      setUnreadCount(count => {
        const newCount = Math.max(0, count - 1);
        console.log('[NotificationBell] Updated unread count:', newCount);
        return newCount;
      });

      // Call API
      await notificationService.markAsRead(notificationId);
      console.log('[NotificationBell] Successfully marked notification as read on server');
    } catch (error) {
      console.error('[NotificationBell] Error marking notification as read:', error);
      // Revert on error
      setNotifications(prev => {
        const reverted = prev.map(n =>
          n.id === notificationId ? { ...n, read: false } : n
        );
        console.log('[NotificationBell] Reverted notifications after error:', reverted);
        return reverted;
      });
      
      setUnreadCount(count => {
        const revertedCount = count + 1;
        console.log('[NotificationBell] Reverted unread count:', revertedCount);
        return revertedCount;
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          onMarkAsRead={handleMarkAsRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 