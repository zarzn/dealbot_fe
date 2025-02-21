"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/services/analytics';
import { toast } from 'sonner';

interface TimeframeOption {
  label: string;
  value: 'daily' | 'weekly' | 'monthly';
}

const timeframeOptions: TimeframeOption[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

// Mockup data
const mockPerformanceMetrics = {
  daily: [
    { date: '2024-02-01', deals: 12, goals: 5, tokens: 45 },
    { date: '2024-02-02', deals: 15, goals: 7, tokens: 52 },
    { date: '2024-02-03', deals: 8, goals: 4, tokens: 38 },
    { date: '2024-02-04', deals: 20, goals: 8, tokens: 65 },
    { date: '2024-02-05', deals: 18, goals: 6, tokens: 58 },
    { date: '2024-02-06', deals: 25, goals: 10, tokens: 72 },
    { date: '2024-02-07', deals: 22, goals: 9, tokens: 68 },
  ],
  weekly: [
    { week: 'Week 1', deals: 85, goals: 32, tokens: 280 },
    { week: 'Week 2', deals: 92, goals: 38, tokens: 310 },
    { week: 'Week 3', deals: 78, goals: 28, tokens: 265 },
    { week: 'Week 4', deals: 105, goals: 42, tokens: 345 },
  ],
  monthly: [
    { month: 'Jan 2024', deals: 320, goals: 125, tokens: 1150 },
    { month: 'Feb 2024', deals: 360, goals: 140, tokens: 1280 },
    { month: 'Mar 2024', deals: 280, goals: 110, tokens: 980 },
    { month: 'Apr 2024', deals: 420, goals: 160, tokens: 1450 },
    { month: 'May 2024', deals: 380, goals: 145, tokens: 1320 },
    { month: 'Jun 2024', deals: 450, goals: 175, tokens: 1580 },
  ],
};

export function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState<TimeframeOption['value']>('weekly');
  const [metrics, setMetrics] = useState<typeof mockPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [timeframe]);

  const loadMetrics = async () => {
    try {
      // In production, this would fetch from the API
      // const data = await analyticsService.getPerformanceMetrics(timeframe);
      setMetrics(mockPerformanceMetrics);
    } catch (error) {
      toast.error('Failed to load performance metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-[300px] bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  const chartData = metrics?.[timeframe] || [];

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
      <div className="flex justify-between items-center">
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