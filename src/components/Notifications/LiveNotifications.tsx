"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [webSocketCleanup, setWebSocketCleanup] = useState<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const MAX_RETRIES = 3; // Reduced from 5 to 3
  const MIN_RETRY_DELAY = 10000; // Minimum 10 seconds between retries

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Ensure cleanup happens when component unmounts
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Calculate backoff time for retries (exponential with higher initial delay)
  const getRetryDelay = useCallback(() => {
    // Start with 10 seconds minimum, then increase exponentially
    return Math.min(MIN_RETRY_DELAY * Math.pow(2, retryCount), 120000); // Max 2 minutes
  }, [retryCount]);

  // Setup WebSocket for real-time notifications with retry
  const setupWebSocket = useCallback(async () => {
    if (status !== 'authenticated' || !isMounted) return null;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Setting up WebSocket connection (attempt ${retryCount + 1})`);
      }
      
      // Store the options for reconnection attempts
      const wsOptions = {
        onNotification: (notification) => {
          if (!isMounted) return;
          
          // Enhanced debug logging
          console.log('LiveNotifications: New notification received:', notification);
          console.log('Current notifications state:', notifications);
          console.log('Current unread count:', unreadCount);
          
          // Handle new notification
          if (process.env.NODE_ENV === 'development') {
            console.log('New notification received');
          }
          
          // Update state
          setNotifications(prev => {
            console.log('Updating notifications state with new notification');
            return [notification, ...prev];
          });
          setUnreadCount(prev => {
            console.log('Incrementing unread count');
            return prev + 1;
          });
          
          // Show toast notification
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
            icon: 'ℹ️',
          });
          
          // Call optional callback
          if (onNewNotification) {
            console.log('Calling onNewNotification callback');
            onNewNotification(notification);
          }
        },
        onConnect: () => {
          if (!isMounted) return;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('WebSocket connected successfully');
          }
          setWsConnected(true);
          setIsError(false);
          setRetryCount(0); // Reset retry count on successful connection
        },
        onDisconnect: (event) => {
          if (!isMounted) return;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('WebSocket disconnected');
          }
          setWsConnected(false);
          
          // Only attempt to reconnect if still mounted and under max retries
          // Check if this was a normal closure (code 1000)
          const wasCleanDisconnect = event && event.code === 1000;
          
          if (isMounted && retryCount < MAX_RETRIES && !wasCleanDisconnect) {
            const delay = getRetryDelay();
            if (process.env.NODE_ENV === 'development') {
              console.log(`Will attempt to reconnect in ${delay/1000} seconds`);
            }
            
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, delay);
          } else if (retryCount >= MAX_RETRIES || wasCleanDisconnect) {
            // Don't set error if this was a clean disconnect
            if (!wasCleanDisconnect) {
              setIsError(true);
            }
            if (process.env.NODE_ENV === 'development') {
              if (wasCleanDisconnect) {
                console.log(`WebSocket closed normally, no reconnection needed`);
              } else {
                console.log(`Max retries (${MAX_RETRIES}) reached, stopping reconnection attempts`);
              }
            }
          }
        },
        onError: (error) => {
          if (!isMounted) return;
          
          console.error('WebSocket error');
          setIsError(true);
          
          // Only attempt to reconnect if still mounted and under max retries
          if (isMounted && retryCount < MAX_RETRIES) {
            const delay = getRetryDelay();
            if (process.env.NODE_ENV === 'development') {
              console.log(`Will attempt to reconnect after error in ${delay/1000} seconds`);
            }
            
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, delay);
          }
        }
      };
      
      // Set up WebSocket with our options
      const cleanup = await notificationService.setupWebSocket(wsOptions);
      
      // Store the cleanup function
      if (typeof cleanup === 'function') {
        cleanupRef.current = cleanup;
        return cleanup;
      }
      
      return null;
    } catch (error) {
      console.error('Error setting up WebSocket');
      
      // Try again later with backoff
      if (isMounted && retryCount < MAX_RETRIES) {
        const delay = getRetryDelay();
        setTimeout(() => {
          if (isMounted) {
            setRetryCount(prev => prev + 1);
          }
        }, delay);
      } else {
        setIsError(true);
      }
      
      return null;
    }
  }, [isMounted, onNewNotification, retryCount, status, getRetryDelay]);

  // Setup WebSocket connection with retry logic
  useEffect(() => {
    // Only attempt to set up WebSocket if the component is mounted 
    // and we're authenticated
    if (!isMounted || status !== 'authenticated') return;

    const initWebSocket = async () => {
      // Clean up any existing connection first
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      
      const cleanup = await setupWebSocket();
      if (cleanup) {
        cleanupRef.current = cleanup;
      }
    };
    
    initWebSocket();
    
    // Cleanup on unmount or dependency change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [setupWebSocket, isMounted, status, retryCount]);

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

  // Return the NotificationBell component with our data
  return (
    <NotificationBell
      count={unreadCount}
      notifications={notifications}
      isLoading={false}
      hasError={isError}
      isConnected={wsConnected}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onClearAll={handleClearAll}
    />
  );
};

// Export the component as default
export default LiveNotifications; 