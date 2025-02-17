"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Tag, Coins } from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import type { DashboardMetrics } from '@/services/analytics';
import { formatDistanceToNow } from '@/lib/date-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type ActivityItem = DashboardMetrics['activity'][0];

const activityConfig = {
  deal: {
    icon: Tag,
    color: 'text-purple',
    bgColor: 'bg-purple/20',
  },
  goal: {
    icon: Target,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  token: {
    icon: Coins,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  system: {
    icon: Activity,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
  },
};

export function ActivityHistory() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [page]);

  const loadActivities = async () => {
    try {
      const data = await analyticsService.getActivityHistory(page);
      if (page === 1) {
        setActivities(data.items);
      } else {
        setActivities(prev => [...prev, ...data.items]);
      }
      setHasMore(page < data.pages);
    } catch (error) {
      toast.error('Failed to load activity history');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'deal':
        return `${activity.action} deal "${activity.details.title}"`;
      case 'goal':
        return `${activity.action} goal "${activity.details.title}"`;
      case 'token':
        return `${activity.action} ${Math.abs(activity.details.amount)} tokens`;
      default:
        return activity.action;
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-1/2 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition"
              >
                <div className={`p-2 ${config.bgColor} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{getActivityMessage(activity)}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {formatDistanceToNow(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPage(p => p + 1)}
            >
              Load More
            </Button>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
} 