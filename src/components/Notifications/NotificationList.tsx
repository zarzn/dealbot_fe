import React from 'react';
import { Notification } from '@/services/notifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
}

export function NotificationList({
  notifications,
  isLoading,
  error,
  onMarkAsRead,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-[350px]">
      <div className="p-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-4 p-3 rounded-lg transition-colors ${
              notification.read
                ? "bg-muted/50"
                : "bg-muted hover:bg-muted/80 cursor-pointer"
            }`}
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
          >
            <h4 className="text-sm font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 