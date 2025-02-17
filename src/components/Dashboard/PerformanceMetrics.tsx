"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/services/analytics';
import type { PerformanceMetrics as PerformanceMetricsType } from '@/services/analytics';
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

export function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState<TimeframeOption['value']>('weekly');
  const [metrics, setMetrics] = useState<PerformanceMetricsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [timeframe]);

  const loadMetrics = async () => {
    try {
      const data = await analyticsService.getPerformanceMetrics(timeframe);
      setMetrics(data);
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
            />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="deals"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
            />
            <Line
              type="monotone"
              dataKey="goals"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="text-sm text-white/70">Total Deals</div>
          <div className="text-2xl font-semibold mt-1">
            {chartData.reduce((sum, item) => sum + item.deals, 0)}
          </div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="text-sm text-white/70">Active Goals</div>
          <div className="text-2xl font-semibold mt-1">
            {chartData.reduce((sum, item) => sum + item.goals, 0)}
          </div>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <div className="text-sm text-white/70">Token Usage</div>
          <div className="text-2xl font-semibold mt-1">
            {chartData.reduce((sum, item) => sum + item.tokens, 0)}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 