"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { notificationService, Notification } from '@/services/notifications';
import { NotificationBell } from './NotificationBell';

interface LiveNotificationsProps {
  onNewNotification?: (notification: Notification) => void;
}

export const LiveNotifications: React.FC<LiveNotificationsProps> = ({
  onNewNotification
}) => {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Calculate backoff time for retries (exponential)
  const getRetryDelay = useCallback(() => {
    return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
  }, [retryCount]);

  // Setup WebSocket for real-time notifications with retry
  const setupWebSocket = useCallback(async () => {
    if (status !== 'authenticated' || !isMounted) return;
    
    try {
      console.log(`Setting up WebSocket connection for notifications (attempt ${retryCount + 1})...`);
      
      return await notificationService.setupWebSocket({
        onNotification: (notification) => {
          if (!isMounted) return;
          
          // Handle new notification
          console.log('New notification received:', notification);
          
          // Update state
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
            icon: 'ℹ️',
          });
          
          // Call optional callback
          if (onNewNotification) {
            onNewNotification(notification);
          }
        },
        onConnect: () => {
          if (!isMounted) return;
          
          console.log('WebSocket connected successfully');
          setWsConnected(true);
          setIsError(false);
          setRetryCount(0); // Reset retry count on successful connection
        },
        onDisconnect: () => {
          if (!isMounted) return;
          
          console.log('WebSocket disconnected');
          setWsConnected(false);
          
          // Attempt to reconnect if component is still mounted
          if (isMounted && retryCount < MAX_RETRIES) {
            const delay = getRetryDelay();
            console.log(`Will attempt to reconnect in ${delay}ms...`);
            
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, delay);
          }
        },
        onError: (error) => {
          if (!isMounted) return;
          
          console.error('WebSocket error:', error);
          setWsConnected(false);
          setIsError(true);
          
          // Attempt to reconnect if component is still mounted
          if (isMounted && retryCount < MAX_RETRIES) {
            const delay = getRetryDelay();
            console.log(`Connection error. Will retry in ${delay}ms...`);
            
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, delay);
          } else if (retryCount >= MAX_RETRIES) {
            console.log("Maximum retry attempts reached. Giving up on WebSocket connection.");
          }
        },
      });
    } catch (err) {
      if (!isMounted) return;
      
      console.error('Error setting up WebSocket:', err);
      setIsError(true);
      
      // Retry connection with exponential backoff
      if (isMounted && retryCount < MAX_RETRIES) {
        const delay = getRetryDelay();
        console.log(`Failed to set up WebSocket. Will retry in ${delay}ms...`);
        
        setTimeout(() => {
          if (isMounted) {
            setRetryCount(prev => prev + 1);
          }
        }, delay);
      }
      
      return undefined;
    }
  }, [status, onNewNotification, isMounted, retryCount, getRetryDelay]);

  // Setup WebSocket connection with retry logic
  useEffect(() => {
    // Only attempt to set up WebSocket if the component is mounted
    if (!isMounted) return;

    let cleanup: (() => void) | undefined;
    
    const initWebSocket = async () => {
      cleanup = await setupWebSocket();
    };
    
    initWebSocket();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupWebSocket, isMounted, retryCount]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (!isMounted) return;
    
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Don't show toast for this error - it's not critical
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!isMounted) return;
    
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error("Couldn't mark all as read. Please try again later.");
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (!isMounted) return;
    
    try {
      await notificationService.clearAll();
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error("Couldn't clear notifications. Please try again later.");
    }
  };

  // Don't render anything on the server
  if (!isMounted) {
    return null;
  }

  // The actual component is managed by NotificationCenter, so we don't need to return anything visible
  return null;
};

// Export the component as default
export default LiveNotifications; 