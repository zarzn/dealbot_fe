"use client";

import { useEffect, useState } from 'react';
import { Target, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  progress: number;
  deadline: string;
  status: 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// Goals service function to get active goals
const getActiveGoals = async (): Promise<{ goals: Goal[] }> => {
  const response = await apiClient.get('/api/v1/goals?status=active');
  return response.data;
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
  
  // Get goals from response data
  const goals = data?.goals || [];
  
  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Active goals fetch error:', error);
    }
  }, [error]);

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
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

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div 
          key={goal.id}
          className="bg-white/[0.03] rounded-lg p-4 hover:bg-white/[0.05] transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold mb-1">{goal.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-white/70">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(goal.deadline).toLocaleDateString()}
                </div>
                <div className={`flex items-center ${getPriorityColor(goal.priority)}`}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-purple">
                {goal.progress}%
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
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveGoals; 