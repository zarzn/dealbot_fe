"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Coins, Tag, Zap } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date-utils';
import type { DashboardMetrics } from '@/services/analytics';

type Activity = DashboardMetrics['activity'][0];

interface ActivityHistoryProps {
  activities?: Activity[];
}

export function ActivityHistory({ activities = [] }: ActivityHistoryProps) {
  const [displayCount, setDisplayCount] = useState(5);

  const getActivityIcon = (type: string) => {
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
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deal':
        return 'bg-green-500/20 text-green-400';
      case 'goal':
        return 'bg-blue-500/20 text-blue-400';
      case 'token':
        return 'bg-purple/20 text-purple';
      case 'system':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-white/20 text-white';
    }
  };

  const getActivityMessage = (activity: Activity) => {
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {activities.length > displayCount && (
          <button
            onClick={() => setDisplayCount(prev => prev + 5)}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            View More
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activities.slice(0, displayCount).map((activity, index) => (
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
} 