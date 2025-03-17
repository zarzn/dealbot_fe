"use client"

import React, { useEffect, useState } from 'react';
import { notificationService, Notification } from '@/services/notifications';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications. Please try again.');
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications || []);
      toast.success('Notifications refreshed');
    } catch (err) {
      console.error('Error refreshing notifications:', err);
      setError('Failed to refresh notifications');
      toast.error('Failed to refresh notifications');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      
      // Update local state
      setNotifications([]);
      
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Notifications" 
          description="Manage your notifications and alerts"
        />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={isLoading || notifications.every(n => n.read)}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearAll}
            disabled={isLoading || notifications.length === 0}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="bg-white/[0.05] border border-white/10 rounded-lg p-6 text-center backdrop-blur-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            {error}
          </h3>
          <Button onClick={loadNotifications}>
            Try Again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white/[0.05] border border-white/10 rounded-lg p-12 text-center backdrop-blur-lg">
          <Bell className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Notifications
          </h3>
          <p className="text-white/70 max-w-md mx-auto mb-6">
            You don't have any notifications at the moment. When you receive notifications, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 rounded-lg border backdrop-blur-lg ${
                notification.read 
                  ? 'bg-white/[0.02] border-white/10' 
                  : 'bg-white/[0.05] border-white/20 shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-base font-medium ${
                      notification.read ? 'text-white/80' : 'text-white'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-white/50">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={`mt-1 ${
                    notification.read ? 'text-white/60' : 'text-white/80'
                  }`}>
                    {notification.message}
                  </p>
                  
                  {notification.link && (
                    <a 
                      href={notification.link}
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                    >
                      View details
                    </a>
                  )}
                </div>
                
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex-shrink-0"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}