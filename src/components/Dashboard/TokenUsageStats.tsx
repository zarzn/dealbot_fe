"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { toast } from 'sonner';
import { Coins, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';

interface TimeframeOption {
  label: string;
  value: 'day' | 'week' | 'month' | 'year';
}

const timeframeOptions: TimeframeOption[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b'];

export function TokenUsageStats() {
  const [timeframe, setTimeframe] = useState<TimeframeOption['value']>('week');
  
  // Use React Query to fetch token usage data
  const { 
    data: usageData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['tokenUsage', timeframe],
    queryFn: () => analyticsService.getTokenUsage(timeframe),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
  
  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Token usage data fetch error:', error);
    }
  }, [error]);

  // Common header component
  const HeaderComponent = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Token Usage</h2>
      <div className="flex gap-2">
        {timeframeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeframe(option.value)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              timeframe === option.value
                ? 'bg-purple text-white'
                : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Error state component
  if (error) {
    return (
      <div className="space-y-4">
        <HeaderComponent />
        <div className="rounded-lg border border-white/10 p-6 text-center bg-white/[0.02]">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-400" />
          <h3 className="text-lg font-medium mb-2">Unable to load token usage data</h3>
          <p className="text-white/70 mb-4">We encountered an issue while retrieving your token usage statistics.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !usageData) {
    return (
      <div className="space-y-4">
        <HeaderComponent />
        <div className="h-[300px] bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  const pieData = Object.entries(usageData.summary.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const totalSpent = usageData.summary.total || 0;
  const dailyAverage = totalSpent / (timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <HeaderComponent />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Coins className="w-4 h-4" />
            <span>Total Usage</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{totalSpent.toFixed(2)}</div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <TrendingUp className="w-4 h-4" />
            <span>Daily Average</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{dailyAverage.toFixed(2)}</div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <TrendingDown className="w-4 h-4" />
            <span>Most Used</span>
          </div>
          <div className="text-2xl font-semibold mt-1">
            {pieData.length > 0 ? pieData[0].name : 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/[0.05] rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Usage by Category</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-white/70">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.05] rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {usageData.usage.slice(0, 5).map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]"
              >
                <div>
                  <div className="text-sm font-medium">{transaction.category}</div>
                  <div className="text-xs text-white/50">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-medium">{transaction.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 