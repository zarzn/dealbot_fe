import React, { useState, useRef, useEffect } from 'react';
import { Notification, getNotificationStyle } from '@/services/notifications';
import { NotificationList } from './NotificationList';
import { 
  Bell, 
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface NotificationBellProps {
  count: number;
  notifications: Notification[];
  isLoading: boolean;
  hasError: boolean;
  isConnected: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

// Function to get notification icon based on style type
export const getNotificationIcon = (type: string) => {
  const styleType = getNotificationStyle(type as any);
  
  switch (styleType) {
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

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count,
  notifications,
  isLoading,
  hasError,
  isConnected,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {count}
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
          error={hasError ? "Failed to load notifications" : null}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAll={onClearAll}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell; 