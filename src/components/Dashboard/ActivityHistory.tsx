"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Coins, Tag, Zap, Bell, AlertCircle, CheckCircle, Info, ExternalLink, Check } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date-utils';
import type { DashboardMetrics } from '@/services/analytics';
import { notificationService, Notification, NotificationType } from '@/services/notifications';
import Link from 'next/link';
import { toast } from 'sonner';

type Activity = DashboardMetrics['activity'][0];

interface ActivityHistoryProps {
  activities?: Activity[];
}

export function ActivityHistory({ activities = [] }: ActivityHistoryProps) {
  const [displayCount, setDisplayCount] = useState(5);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await notificationService.getNotifications();
        setNotifications(response.notifications || []);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load recent activity');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Function to mark a notification as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    // Prevent the event from bubbling up to the Link
    e.stopPropagation();
    e.preventDefault();
    
    try {
      await notificationService.markAsRead(id);
      
      // Update the notifications state
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'deal':
        return <Tag className="w-4 h-4" />;
      case 'goal':
        return <Target className="w-4 h-4" />;
      case 'token':
        return <Coins className="w-4 h-4" />;
      case 'system':
        return <Zap className="w-4 h-4" />;
      case 'price_alert':
        return <Bell className="w-4 h-4" />;
      case 'security':
        return <AlertCircle className="w-4 h-4" />;
      case 'market':
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'deal':
        return 'bg-green-500/20 text-green-400';
      case 'goal':
        return 'bg-blue-500/20 text-blue-400';
      case 'token':
        return 'bg-purple/20 text-purple';
      case 'system':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'price_alert':
        return 'bg-orange-500/20 text-orange-400';
      case 'security':
        return 'bg-red-500/20 text-red-400';
      case 'market':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-white/20 text-white';
    }
  };

  // Filter out read notifications
  const unreadNotifications = notifications.filter(notification => !notification.read);
  
  // For backward compatibility - use activities if no unread notifications are loaded yet
  const hasUnreadNotifications = !isLoading && unreadNotifications.length > 0;
  const showBackwardsCompatView = !hasUnreadNotifications && activities.length > 0;

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-white/[0.1] rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-white/70 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-purple hover:text-purple/80 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No activity to show
  if (!hasUnreadNotifications && !showBackwardsCompatView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-white/70">No new activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Link
          href="/dashboard/notifications"
          className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Display only unread notifications */}
        {hasUnreadNotifications && unreadNotifications.slice(0, displayCount).map((notification, index) => (
          <div
            key={notification.id}
            className="relative group"
          >
            <Link
              href="/dashboard/notifications"
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at))}
                  </p>
                </div>
              </motion.div>
            </Link>
            
            {/* Mark as read button - appears on hover */}
            <button
              onClick={(e) => handleMarkAsRead(notification.id, e)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              title="Mark as read"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}

        {/* Fallback to old activities if no notifications */}
        {showBackwardsCompatView && activities.slice(0, displayCount).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getActivityMessage(activity)}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp))}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Helper function for backwards compatibility
  function getActivityIcon(type: string) {
    switch (type) {
      case 'deal':
        return <Tag className="w-4 h-4" />;
      case 'goal':
        return <Target className="w-4 h-4" />;
      case 'token':
        return <Coins className="w-4 h-4" />;
      case 'system':
        return <Zap className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  }

  function getActivityColor(type: string) {
    switch (type) {
      case 'deal':
        return 'bg-green-500/20 text-green-400 preserve-color';
      case 'goal':
        return 'bg-blue-500/20 text-blue-400 preserve-color';
      case 'token':
        return 'bg-purple/20 text-purple preserve-color';
      case 'system':
        return 'bg-yellow-500/20 text-yellow-400 preserve-color';
      default:
        return 'bg-white/20 text-white';
    }
  }

  function getActivityMessage(activity: Activity) {
    switch (activity.type) {
      case 'deal':
        return `Price dropped on ${activity.details.dealTitle} to $${activity.details.price}`;
      case 'goal':
        if (activity.action === 'Goal Completed') {
          return `Completed goal "${activity.details.goalTitle}" with $${activity.details.savings} in savings`;
        }
        return `Created new goal "${activity.details.goalTitle}"`;
      case 'token':
        return `Earned ${activity.details.amount} tokens from ${activity.details.source}`;
      case 'system':
        return `Completed market analysis for ${activity.details.category} with ${activity.details.insights} insights`;
      default:
        return activity.action;
    }
  }
} 