import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bell,
  AlertCircle,
  Tag,
  ShoppingCart,
  User,
  Settings,
  Check,
  Trash,
  ArrowDown,
  ArrowUp,
  MessageCircle,
} from 'lucide-react';

export interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: string;
  actionUrl?: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

export function NotificationItem({
  id,
  title,
  message,
  timestamp,
  isRead,
  type,
  actionUrl,
  onMarkAsRead,
  onDelete
}: NotificationItemProps) {
  const formattedTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return '';
    }
  }, [timestamp]);

  const getIcon = () => {
    switch (type) {
      case 'deal':
      case 'price_alert':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      case 'goal':
        return <Tag className="h-5 w-5 text-green-500" />;
      case 'security':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'token':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'market':
        return <ArrowDown className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const notificationContent = (
    <div className={`
      group p-4 border rounded-lg transition-all
      ${isRead ? 'bg-white' : 'bg-blue-50'} 
      hover:shadow
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm">{title}</h4>
            <div className="flex items-center gap-1">
              {!isRead && (
                <Badge variant="default" className="text-xs px-1.5 py-0 h-auto">
                  New
                </Badge>
              )}
              <span className="text-xs text-gray-500">{formattedTime}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{message}</p>
        </div>
      </div>
      
      <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        {!isRead && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 px-2"
            onClick={handleReadClick}
          >
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Mark as read</span>
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDeleteClick}
        >
          <Trash className="h-4 w-4 mr-1" />
          <span className="text-xs">Delete</span>
        </Button>
      </div>
    </div>
  );

  return actionUrl ? (
    <Link href={actionUrl} className="block no-underline text-inherit">
      {notificationContent}
    </Link>
  ) : (
    notificationContent
  );
}

export default NotificationItem; 