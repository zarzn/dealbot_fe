"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { analyticsService } from '@/services/analytics';
import type { DashboardMetrics } from '@/services/analytics';
import { toast } from 'sonner';
import { PerformanceMetrics } from '@/components/Dashboard/PerformanceMetrics';
import { ActivityHistory } from '@/components/Dashboard/ActivityHistory';
import { TokenUsageStats } from '@/components/Dashboard/TokenUsageStats';

import TokenBalance from '@/components/Dashboard/TokenBalance';
import ActiveGoals from '@/components/Dashboard/ActiveGoals';
import RecentDeals from '@/components/Dashboard/RecentDeals';
import DealMetrics from '@/components/Dashboard/DealMetrics';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';

export default function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In production, this would fetch from the API
      // const data = await analyticsService.getDashboardMetrics();
      const mockData: DashboardMetrics = {
        deals: {
          total: 156,
          active: 42,
          completed: 98,
          saved: 16,
          successRate: 78.5,
          averageDiscount: 32,
          totalSavings: 4521.50
        },
        goals: {
          total: 24,
          active: 12,
          completed: 8,
          expired: 4,
          averageSuccess: 85.2,
          matchRate: 72.8
        },
        tokens: {
          balance: 450.75,
          spent: {
            total: 325.50,
            deals: 180.25,
            goals: 95.25,
            other: 50.00
          },
          earned: {
            total: 776.25,
            referrals: 300.00,
            achievements: 376.25,
            other: 100.00
          },
          history: [
            { date: '2024-02-01', amount: 50, type: 'earned', category: 'referrals' },
            { date: '2024-02-02', amount: -25, type: 'spent', category: 'deals' },
            { date: '2024-02-03', amount: 100, type: 'earned', category: 'achievements' },
            { date: '2024-02-04', amount: -35, type: 'spent', category: 'goals' },
            { date: '2024-02-05', amount: 75, type: 'earned', category: 'referrals' },
            { date: '2024-02-06', amount: -45, type: 'spent', category: 'deals' },
            { date: '2024-02-07', amount: 150, type: 'earned', category: 'achievements' }
          ]
        },
        activity: [
          {
            id: '1',
            type: 'deal',
            action: 'Deal Found',
            details: {
              dealTitle: 'LG 27" UltraGear Monitor',
              discount: '25%',
              price: 299.99
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
          },
          {
            id: '2',
            type: 'goal',
            action: 'Goal Completed',
            details: {
              goalTitle: 'Gaming Setup Upgrade',
              savings: 450.25
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
          },
          {
            id: '3',
            type: 'token',
            action: 'Tokens Earned',
            details: {
              amount: 100,
              source: 'Achievement Reward'
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
          },
          {
            id: '4',
            type: 'system',
            action: 'Market Analysis',
            details: {
              category: 'Gaming Laptops',
              insights: 3
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
          }
        ]
      };
      setMetrics(mockData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-6 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Loading State */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <div className="h-[300px] bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <div className="h-[400px] bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Metrics */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <PerformanceMetrics />
          </div>

          {/* Token Usage Stats */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <TokenUsageStats />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Activity History */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <ActivityHistory />
          </div>
        </div>
      </div>
    </div>
  );
} 