"use client";

import { useEffect, useState } from 'react';
import { Target, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

interface Goal {
  id: string;
  title: string;
  deadline: string;
  status: 'active' | 'paused' | 'completed' | 'expired';
  priority: number; // Backend returns priority as a number (1, 2, 3)
  constraints: {
    price_range?: {
      min: number;
      max: number;
    };
    max_price?: number;
    min_price?: number;
  };
  last_checked_at: string | null;
  matches_found: number;
  deals_processed: number;
  tokens_spent: number;
  best_match_score: number | null;
  average_match_score: number | null;
  active_deals_count: number;
  success_rate: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Goals service function to get active goals
const getActiveGoals = async (): Promise<Goal[]> => {
  const response = await apiClient.get('/api/v1/goals?status=active');
  return response.data; // Backend returns array directly, not { goals: [] }
};

const ActiveGoals = () => {
  // Use React Query to fetch active goals
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: getActiveGoals,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
  
  // Get goals from response data and filter out expired goals
  const allGoals = data || []; 
  const goals = allGoals.filter(goal => {
    // If the goal has a deadline and it's in the past, consider it expired
    // even if the backend hasn't updated its status yet
    if (goal.deadline && new Date(goal.deadline) < new Date()) {
      return false;
    }
    return true;
  });
  
  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Active goals fetch error:', error);
    }
  }, [error]);

  // Calculate goal progress based on matches found and best match score
  const calculateProgress = (goal: Goal): number => {
    if (goal.best_match_score) {
      // If we have a best match score, use it as a percentage
      return Math.round(goal.best_match_score * 100);
    } else if (goal.matches_found > 0) {
      // If we have matches but no best score, show some progress
      return Math.min(50, goal.matches_found * 10);
    }
    // Default to 0% if no matches or scores
    return 0;
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 1:
        return 'text-red-400';
      case 2:
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  // Handle error state
  if (error) {
    return (
      <div className="rounded-lg border border-white/10 p-6 text-center bg-white/[0.02]">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-400" />
        <h3 className="text-lg font-medium mb-2">Unable to load goals</h3>
        <p className="text-white/70 mb-4">We encountered an issue while retrieving your active goals.</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition inline-flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-white/[0.1] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
        <p className="text-white/70">Create your first goal to start tracking deals</p>
      </div>
    );
  }

  // Calculate the actual match rate across all truly active goals
  const calculateMatchRate = () => {
    if (goals.length === 0) return 0;
    
    const goalsWithMatches = goals.filter(goal => goal.matches_found > 0);
    return Math.round((goalsWithMatches.length / goals.length) * 100);
  };

  return (
    <div className="space-y-4">
      {allGoals.length !== goals.length && (
        <div className="mb-4 text-sm text-amber-400">
          Showing {goals.length} active goals ({allGoals.length - goals.length} have expired)
        </div>
      )}
      
      {goals.length > 0 && (
        <div className="mb-4 text-sm text-white/70">
          Match rate: {calculateMatchRate()}%
        </div>
      )}
      
      {goals.map((goal) => (
        <Link 
          key={goal.id}
          href={`/dashboard/goals/${goal.id}`}
          className="block"
        >
          <div 
            className="bg-white/[0.03] rounded-lg p-4 hover:bg-white/[0.05] transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold mb-1">{goal.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                  <div className={`flex items-center ${getPriorityColor(goal.priority)}`}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {goal.priority === 1 ? 'High' : goal.priority === 2 ? 'Medium' : 'Low'} Priority
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-purple">
                  {calculateProgress(goal)}%
                </div>
                <div className="text-sm text-white/70">
                  Complete
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/[0.1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple transition-all duration-500 ease-out rounded-full"
                style={{ width: `${calculateProgress(goal)}%` }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ActiveGoals; 