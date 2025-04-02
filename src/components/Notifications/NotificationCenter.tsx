"use client"

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { FiBell, FiX, FiCheck, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { notificationService, Notification } from '@/services/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { NotificationItem } from './NotificationItem';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/services/api/config';
import { useSafeSession } from '@/lib/use-safe-session';

// Define tabs for filtering notifications
type NotificationTab = 'all' | 'unread' | 'deals' | 'system';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [isClient, setIsClient] = useState(false);
  const [wsSetupComplete, setWsSetupComplete] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const session = useSafeSession();

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
    return () => {
      setIsClient(false);
    };
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isClient]);

  // Load notifications when component is opened
  useEffect(() => {
    if (!isClient) return;
    
    if (isOpen && session.status === 'authenticated') {
      loadNotifications();
    }
  }, [isOpen, isClient, session.status]);

  // WebSocket connection
  useEffect(() => {
    if (!isClient || !session.data?.accessToken || wsSetupComplete) return;

    let wsCleanup: (() => void) | undefined;
    let retryTimeout: NodeJS.Timeout | undefined;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    
    // Calculate backoff time for retries (exponential)
    const getRetryDelay = () => {
      return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
    };
    
    // Setup websocket connection when component mounts
    const setupWs = async () => {
      if (retryCount >= MAX_RETRIES) {
        console.error(`Failed to setup WebSocket after ${MAX_RETRIES} attempts.`);
        setIsError(true);
        return;
      }
      
      try {
        console.log(`Attempting to get websocket token (attempt ${retryCount + 1})...`);
        
        // Check if we have an access token before making the request
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.log('No access token available for WebSocket setup, skipping...');
          return;
        }
        
        // Use apiClient instead of direct fetch for proper token and error handling
        const tokenResponse = await apiClient.get(API_ENDPOINTS.WEBSOCKET_TOKEN, {
          // Add cache busting to prevent stale responses
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        // Use proper status check (response.status is a number, not an object with a status)
        if (tokenResponse.status !== 200) {
          throw new Error(`Failed to get websocket token: ${tokenResponse.status}`);
        }
        
        const data = tokenResponse.data;
        const token = data?.token;
        
        if (!token) {
          throw new Error('No token received for WebSocket connection');
        }
        
        // Connect to websocket with the token
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || ''}/notifications/ws?token=${token}`;
        console.log(`Connecting to WebSocket at: ${wsUrl.replace(token, 'REDACTED')}`);
        
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          // Reset retry count on successful connection
          retryCount = 0;
          setWsSetupComplete(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              handleNewNotification(data.notification as Notification);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsError(true);
          
          // Only retry if component is mounted
          if (isClient && retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = getRetryDelay();
            console.log(`WebSocket error. Will retry in ${delay}ms...`);
            
            retryTimeout = setTimeout(setupWs, delay);
          }
        };
        
        ws.onclose = (event) => {
          console.log(`WebSocket closed with code ${event.code}`);
          
          // Only retry unexpected closes if component is mounted
          if (isClient && event.code !== 1000 && retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = getRetryDelay();
            console.log(`WebSocket closed unexpectedly. Will retry in ${delay}ms...`);
            
            retryTimeout = setTimeout(setupWs, delay);
          }
        };
        
        wsCleanup = () => {
          console.log('Cleaning up WebSocket connection');
          ws.close();
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }
        };
      } catch (error) {
        console.error("Failed to setup WebSocket:", error);
        setIsError(true);
        
        // Retry with exponential backoff
        if (isClient && retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = getRetryDelay();
          console.log(`Failed to setup WebSocket. Will retry in ${delay}ms...`);
          
          retryTimeout = setTimeout(setupWs, delay);
        }
      }
    };
    
    // Only attempt to set up WebSocket if we're authenticated
    if (session.status === 'authenticated') {
      setupWs();
    }
    
    return () => {
      // Clean up websocket connection when component unmounts
      if (wsCleanup) wsCleanup();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [isClient, session.status, session.data?.accessToken, wsSetupComplete]);

  // Load notifications from API
  const loadNotifications = async () => {
    if (!isClient || session.status !== 'authenticated') return;
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      const result = await notificationService.getNotifications();
      
      // Check if the result actually contains notifications
      if (!result || !result.notifications) {
        throw new Error('Invalid response format');
      }
      
      setNotifications(result.notifications as unknown as Notification[]);
      
      // Count unread notifications
      const unread = result.notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setIsError(true);
      // Don't show toast on initial load to avoid overwhelming the user
      if (notifications.length > 0) {
        toast.error('Failed to load notifications');
      }
      // Set empty array to prevent undefined errors
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new notification from WebSocket
  const handleNewNotification = (notification: Notification) => {
    if (!isClient) return;
    
    setNotifications(prev => [notification, ...prev]);
    
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
      toast.message(notification.title, {
        description: notification.message,
      });
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!isClient) return;
    
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isClient) return;
    
    try {
      await notificationService.markAllAsRead();
      
      // Update all unread notifications to read in local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete a notification - not implemented in API yet, only UI update
  const deleteNotification = (id: string) => {
    if (!isClient) return;
    
    // Remove from local state first for immediate feedback
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // If the notification was unread, update the count
    const wasUnread = notifications.find(n => n.id === id)?.read;
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Since we don't have a delete API yet, we just show success toast
    toast.success('Notification removed');
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  // Filter notifications based on active tab
  const filteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'deals':
        return notifications.filter(n => ['deal', 'goal', 'price_alert'].includes(n.type));
      case 'system':
        return notifications.filter(n => ['system', 'security', 'token', 'market'].includes(n.type));
      case 'all':
      default:
        return notifications;
    }
  };

  // Don't render anything during static build
  if (!isClient) {
    // Return minimal representation for static generation
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label="Notifications"
        >
          <FiBell size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-hidden bg-white rounded-md shadow-lg z-50 border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  aria-label="Mark all as read"
                >
                  <FiCheck size={16} className="mr-1" />
                  <span className="text-xs">Mark all read</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <FiX size={16} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'unread' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'deals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('deals')}
              >
                Deals
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'system' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('system')}
              >
                System
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <Loader />
              </div>
            ) : isError ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-3">
                  We couldn&apos;t load notifications
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadNotifications}
                >
                  <FiRefreshCw className="mr-2" size={16} />
                  Try Again
                </Button>
              </div>
            ) : filteredNotifications().length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {activeTab === 'all' 
                  ? "No notifications yet" 
                  : activeTab === 'unread'
                    ? "You've read all your notifications"
                    : `No ${activeTab} notifications`
                }
              </div>
            ) : (
              <div>
                {filteredNotifications().map((notification) => (
                  <div key={notification.id} className="border-b border-gray-100 last:border-b-0">
                    <NotificationItem 
                      id={notification.id}
                      title={notification.title}
                      message={notification.message}
                      timestamp={notification.created_at}
                      isRead={notification.read}
                      type={notification.type}
                      actionUrl={notification.link}
                      onMarkAsRead={() => markAsRead(notification.id)}
                      onDelete={() => deleteNotification(notification.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 