import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export const NotificationIndicator: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateTime = useRef(0);
  const queuedCount = useRef(0);
  const { unreadCount, markAllAsRead } = useNotifications();

  const updateCount = useCallback((newCount: number) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    // If we're within the throttle period, queue the update
    if (timeSinceLastUpdate < 2000) {
      queuedCount.current = newCount;
      if (!updateTimeoutRef.current) {
        updateTimeoutRef.current = setTimeout(() => {
          setCount(queuedCount.current);
          setIsAnimating(true);
          lastUpdateTime.current = Date.now();
          updateTimeoutRef.current = undefined;
          
          // Reset animation after 300ms
          if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
          }
          animationTimeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
          }, 300);
        }, 2000 - timeSinceLastUpdate);
      }
      return;
    }

    // Immediate update if outside throttle period
    setCount(newCount);
    setIsAnimating(true);
    lastUpdateTime.current = now;

    // Reset animation after 300ms
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, []);

  useEffect(() => {
    updateCount(unreadCount);
  }, [unreadCount, updateCount]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Bell className="h-6 w-6" />
      {count > 0 && (
        <Badge
          className={cn(
            'absolute -top-2 -right-2 h-5 min-w-[20px] transition-transform duration-300',
            isAnimating ? 'scale-110' : 'scale-100'
          )}
          variant="destructive"
        >
          {count}
        </Badge>
      )}
    </div>
  );
}; 