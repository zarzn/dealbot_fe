"use client";

import { useEffect } from 'react';
import { Coins, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { toast } from 'sonner';
import Link from 'next/link';

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
  
  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      toast.error('Failed to load user metrics');
      console.error('User metrics fetch error:', error);
    }
  }, [error]);

  // Extract metrics from dashboard data
  const tokenBalance = dashboardMetrics?.tokens?.balance ?? null;
  const activeDeals = dashboardMetrics?.deals?.active ?? null;

  // For loading state
  if (isLoading || tokenBalance === null || activeDeals === null) {
    return (
      <div className="animate-pulse flex flex-col gap-1">
        <div className="h-3 bg-white/[0.1] rounded w-20"></div>
        <div className="h-3 bg-white/[0.1] rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center text-xs text-white/60">
        <Coins className="w-3 h-3 mr-1 text-purple preserve-color" />
        <span className="text-purple preserve-color">{tokenBalance.toLocaleString()} AGNT</span>
      </div>
      <div className="flex items-center text-xs text-white/60 mt-1">
        <Tag className="w-3 h-3 mr-1 text-blue-400 preserve-color" />
        <span>{activeDeals} active deals</span>
      </div>
    </div>
  );
};

export default UserStatusBar; 