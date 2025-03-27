"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, Pause, Play, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { goalsService } from '@/services/goals';
import type { Goal } from '@/services/goals';

interface GoalStatusManagerProps {
  goal: Goal;
  onStatusChange?: (newStatus: Goal['status']) => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-500/20 text-green-400 preserve-color',
    icon: Play,
    description: 'Goal is actively being monitored',
  },
  paused: {
    label: 'Paused',
    color: 'bg-yellow-500/20 text-yellow-400 preserve-color',
    icon: Pause,
    description: 'Goal monitoring is paused',
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-500/20 text-blue-400 preserve-color',
    icon: Check,
    description: 'Goal has been achieved',
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-500/20 text-red-400 preserve-color',
    icon: X,
    description: 'Goal has expired',
  },
};

export function GoalStatusManager({ goal, onStatusChange }: GoalStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Calculate time left and progress
  useEffect(() => {
    const updateTimeAndProgress = () => {
      if (goal.deadline) {
        const now = new Date().getTime();
        const deadline = new Date(goal.deadline).getTime();
        const createdAt = goal.createdAt ? new Date(goal.createdAt).getTime() : now;
        
        // Calculate time left
        const timeLeftMs = deadline - now;
        if (timeLeftMs <= 0) {
          setTimeLeft('Expired');
          setProgress(100);
        } else {
          const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeLeft(`${days}d ${hours}h left`);
          
          // Calculate progress
          const totalDuration = deadline - createdAt;
          const elapsed = now - createdAt;
          // Prevent NaN by ensuring totalDuration is not zero
          const calculatedProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
          setProgress(calculatedProgress);
        }
      } else {
        // Handle case when no deadline exists
        setTimeLeft('No deadline');
        setProgress(0);
      }
    };

    updateTimeAndProgress();
    const interval = setInterval(updateTimeAndProgress, 1000 * 60); // Update every minute
    
    return () => clearInterval(interval);
  }, [goal.deadline, goal.createdAt]);

  const handleStatusChange = async (newStatus: Goal['status']) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await goalsService.updateGoalStatus(goal.id!, newStatus);
      onStatusChange?.(newStatus);
      toast.success(`Goal ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal status');
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = statusConfig[goal.status].icon;

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full',
                  statusConfig[goal.status].color
                )}
              >
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {statusConfig[goal.status].label}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusConfig[goal.status].description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {goal.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('paused')}
              disabled={isUpdating}
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}
          {goal.status === 'paused' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('active')}
              disabled={isUpdating}
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          )}
          {(goal.status === 'active' || goal.status === 'paused') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('completed')}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Progress and Deadline */}
      {goal.deadline && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="w-4 h-4" />
              {timeLeft}
            </div>
            <span className="text-white/70">
              {!isNaN(progress) ? `${Math.round(progress)}% Complete` : '0% Complete'}
            </span>
          </div>
          <Progress value={isNaN(progress) ? 0 : progress} />
        </div>
      )}

      {/* Analytics */}
      <div
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-white/[0.05] rounded-lg p-3">
          <div className="text-sm text-white/70">Matches Found</div>
          <div className="text-lg font-semibold">{goal.matchesFound || 0}</div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-3">
          <div className="text-sm text-white/70">Success Rate</div>
          <div className="text-lg font-semibold">
            {goal.successRate != null && !isNaN(goal.successRate) ? 
              `${Math.round(goal.successRate * 100)}%` : '0%'}
          </div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-3">
          <div className="text-sm text-white/70">Tokens Spent</div>
          <div className="text-lg font-semibold">
            {goal.tokensSpent != null && !isNaN(goal.tokensSpent) ? 
              goal.tokensSpent.toFixed(2) : '0'}
          </div>
        </div>
      </div>
    </div>
  );
} 