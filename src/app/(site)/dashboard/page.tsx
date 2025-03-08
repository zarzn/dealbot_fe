"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { PerformanceMetrics } from '@/components/Dashboard/PerformanceMetrics';
import { ActivityHistory } from '@/components/Dashboard/ActivityHistory';
import { TokenUsageStats } from '@/components/Dashboard/TokenUsageStats';
import TokenBalance from '@/components/Dashboard/TokenBalance';
import ActiveGoals from '@/components/Dashboard/ActiveGoals';
import RecentDeals from '@/components/Dashboard/RecentDeals';
import DealMetrics from '@/components/Dashboard/DealMetrics';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';
import { analyticsService } from '@/services/analytics';
import type { DashboardMetrics } from '@/services/analytics';
import { toast } from 'sonner';

// Error component for individual dashboard widgets
const WidgetError = ({ title, onRetry }: { title: string; onRetry: () => void }) => (
  <div className="bg-white/[0.05] rounded-xl p-4 backdrop-blur-lg text-center h-full flex flex-col justify-center items-center">
    <h3 className="text-lg text-red-400 mb-2">{title} Unavailable</h3>
    <p className="text-white/70 mb-4">
      We couldn&apos;t load your dashboard data. Please try again later.
    </p>
    <button 
      onClick={onRetry} 
      className="px-3 py-1.5 bg-purple/80 rounded-lg hover:bg-purple transition text-sm"
    >
      Retry
    </button>
  </div>
);

export default function DashboardPage() {
  // Use React Query to fetch dashboard metrics with proper caching
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
  
  // Handle errors with useEffect
  useEffect(() => {
    if (metricsError) {
      toast.error(`Unable to load some dashboard data. Certain widgets may be unavailable.`);
      console.error('Dashboard data fetch error:', metricsError);
    }
  }, [metricsError]);

  return (
    <div className="space-y-8">
      <DashboardHeader 
        heading="Dashboard" 
        text="View your deals, goals, and activity at a glance."
      />
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsLoading ? (
          // Loading skeleton for stats
          <>
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg h-[100px] animate-pulse"
              />
            ))}
          </>
        ) : metricsError ? (
          // Error state for stats row
          <>
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg"
              >
                <h3 className="text-sm text-white/70">Stats Unavailable</h3>
                <div className="text-white/50 text-sm mt-2">Unable to load metrics</div>
              </motion.div>
            ))}
          </>
        ) : (
          // Actual stats data
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg"
            >
              <h3 className="text-sm text-white/70">Active Deals</h3>
              <div className="text-2xl font-bold mt-2">{metrics?.deals.active}</div>
              <div className="text-sm text-white/50 mt-1">
                {metrics?.deals.successRate.toFixed(0)}% success rate
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg"
            >
              <h3 className="text-sm text-white/70">Active Goals</h3>
              <div className="text-2xl font-bold mt-2">{metrics?.goals.active}</div>
              <div className="text-sm text-white/50 mt-1">
                {metrics?.goals.matchRate.toFixed(0)}% match rate
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg"
            >
              <h3 className="text-sm text-white/70">Token Balance</h3>
              <div className="text-2xl font-bold mt-2">{metrics?.tokens.balance.toFixed(2)}</div>
              <div className="text-sm text-white/50 mt-1">
                {metrics?.tokens.spent.total.toFixed(2)} spent this month
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg"
            >
              <h3 className="text-sm text-white/70">Total Savings</h3>
              <div className="text-2xl font-bold mt-2">${metrics?.deals.totalSavings.toFixed(2)}</div>
              <div className="text-sm text-white/50 mt-1">
                {metrics?.deals.averageDiscount.toFixed(0)}% avg. discount
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Metrics */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <PerformanceMetrics />
          </div>

          {/* Token Usage Stats */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <TokenUsageStats />
          </div>

          {/* Recent Deals */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h2 className="text-lg font-semibold mb-6">Recent Deals</h2>
            <RecentDeals />
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Token Balance */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <TokenBalance />
          </div>

          {/* Active Goals */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h2 className="text-lg font-semibold mb-6">Active Goals</h2>
            <ActiveGoals />
          </div>

          {/* Deal Metrics */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <DealMetrics />
          </div>

          {/* Activity History */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            {metricsError ? (
              <WidgetError title="Activity History" onRetry={refetchMetrics} />
            ) : (
              <ActivityHistory activities={metrics?.activity} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 