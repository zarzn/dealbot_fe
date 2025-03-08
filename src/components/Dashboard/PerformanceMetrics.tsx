"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import type { PerformanceMetrics as PerformanceMetricsType } from '@/services/analytics';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TimeframeOption {
  label: string;
  value: 'daily' | 'weekly' | 'monthly';
}

const timeframeOptions: TimeframeOption[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState<TimeframeOption['value']>('weekly');
  
  // Use React Query to fetch performance metrics
  const { 
    data: metrics, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['performanceMetrics', timeframe],
    queryFn: () => analyticsService.getPerformanceMetrics(timeframe),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
  
  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Performance metrics fetch error:', error);
    }
  }, [error]);

  // Common header component regardless of data/error state
  const HeaderComponent = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Performance Metrics</h2>
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
          <h3 className="text-lg font-medium mb-2">Unable to load performance data</h3>
          <p className="text-white/70 mb-4">We encountered an issue while retrieving your performance metrics.</p>
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

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <HeaderComponent />
        <div className="h-[300px] bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  const chartData = metrics[timeframe] || [];

  const formatXAxis = (value: string) => {
    if (timeframe === 'daily') {
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return value;
  };

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'deals':
        return `${value} Deals`;
      case 'goals':
        return `${value} Goals`;
      case 'tokens':
        return `${value} Tokens`;
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium mb-2">{formatXAxis(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {formatTooltipValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <HeaderComponent />

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey={timeframe === 'monthly' ? 'month' : timeframe === 'weekly' ? 'week' : 'date'}
              stroke="rgba(255,255,255,0.5)"
              tickFormatter={formatXAxis}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="deals"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
              name="deals"
            />
            <Line
              type="monotone"
              dataKey="goals"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
              name="goals"
            />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
              name="tokens"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="text-sm text-white/70">Total Deals</div>
          <div className="text-2xl font-semibold mt-1">
            {chartData.reduce((sum, item) => sum + (item.deals || 0), 0)}
          </div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="text-sm text-white/70">Active Goals</div>
          <div className="text-2xl font-semibold mt-1">
            {chartData.reduce((sum, item) => sum + (item.goals || 0), 0)}
          </div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="text-sm text-white/70">Token Usage</div>
          <div className="text-2xl font-semibold mt-1">
            {chartData.reduce((sum, item) => sum + (item.tokens || 0), 0)}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 