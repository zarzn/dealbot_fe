import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Notification } from '@/services/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {notifications.some(n => !n.read_at) && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          {notifications.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div
      className={`
        rounded-lg border p-4 transition-colors
        ${notification.read_at ? 'bg-background' : 'bg-muted/50'}
        ${notification.action_url ? 'cursor-pointer hover:bg-muted' : ''}
      `}
      onClick={handleClick}
    >
      <div className="mb-1 flex items-center justify-between gap-4">
        <h4 className="font-medium">{notification.title}</h4>
        <time className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </time>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {notification.message}
      </p>

      {notification.data && (
        <div className="mt-2 text-sm">
          {/* Render additional data based on notification type */}
          {notification.type === 'deal_match' && (
            <div className="flex items-center gap-2 text-green-600">
              <span>Price: ${notification.data.price}</span>
              {notification.data.savings_percentage && (
                <span>Save {notification.data.savings_percentage}%</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 