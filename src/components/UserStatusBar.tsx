"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';

const UserStatusBar = () => {
  // Use React Query to fetch dashboard metrics
  const { 
    data: dashboardMetrics, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
  
  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [error]);

  // Get token balance and active deals count
  const balance = dashboardMetrics?.tokens?.balance ?? 0;
  const activeDeals = dashboardMetrics?.deals?.active ?? 0;
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <p className="text-sm font-medium">Test User</p>
        <div className="flex items-center text-xs text-white/60">
          <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium">Test User</p>
      <div className="flex items-center text-xs">
        <span className="text-purple font-medium">{balance} AGNT</span>
        <span className="mx-1 text-white/60">•</span>
        <span className="text-white/60">{activeDeals} Deals</span>
      </div>
    </div>
  );
};

export default UserStatusBar; 