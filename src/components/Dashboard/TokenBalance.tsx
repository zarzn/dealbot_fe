"use client";

import { useEffect, useState } from 'react';
import { Coins, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { toast } from 'sonner';
import Link from 'next/link';

const TokenBalance = () => {
  // Use React Query to fetch token balance
  const { 
    data: dashboardMetrics, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Also refetch every 30 seconds
    retry: 1,
  });
  
  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      toast.error('Failed to load token balance');
      console.error('Token balance fetch error:', error);
    }
  }, [error]);

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log('[TokenBalance] Received balance update event, refetching...');
      refetch();
    };

    window.addEventListener('token-balance-updated', handleBalanceUpdate);
    return () => window.removeEventListener('token-balance-updated', handleBalanceUpdate);
  }, [refetch]);

  // Get token balance from dashboard metrics
  const balance = dashboardMetrics?.tokens.balance ?? null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Token Balance</h3>
        <div className="flex gap-1">
          <button 
            onClick={() => refetch()} 
            className="hover:bg-white/[0.05] p-1 rounded-lg transition" 
            title="Refresh token balance"
          >
            <RefreshCcw className="w-4 h-4 text-white/50" />
          </button>
          <Link href="/dashboard/wallet" className="hover:bg-white/[0.05] p-1 rounded-lg transition">
            <Coins className="w-5 h-5 text-purple" />
          </Link>
        </div>
      </div>
      
      {isLoading || balance === null ? (
        <div className="animate-pulse">
          <div className="h-8 bg-white/[0.1] rounded w-24 mb-2"></div>
          <div className="h-4 bg-white/[0.1] rounded w-32"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-purple">
            {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg">AGNT</span>
          </div>
          <div className="text-white/70 text-sm mt-2">
            Available for deal searches
          </div>
        </>
      )}
    </div>
  );
};

export default TokenBalance; 