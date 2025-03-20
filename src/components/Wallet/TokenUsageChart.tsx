import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TokenTransaction } from '@/types/wallet';

interface TokenUsageChartProps {
  data: TokenTransaction[];
}

export default function TokenUsageChart({ data }: TokenUsageChartProps) {
  const chartData = useMemo(() => {
    // Handle empty or undefined data
    if (!data || data.length === 0) {
      // Return some dummy data for empty state
      const today = new Date().toLocaleDateString();
      return [{ date: today, amount: 0 }];
    }
    
    // Group transactions by date and calculate daily balance
    const dailyData = data.reduce((acc: Record<string, number>, tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + (tx.type === 'credit' ? tx.amount : -tx.amount);
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-lg font-bold text-purple">
            {payload[0].value.toFixed(2)} AIDL
          </div>
        </div>
      );
    }
    return null;
  };

  // Show empty state message if there's no data
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        <p>No transaction data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <defs>
          <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.5)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.5)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={(value) => `${value.toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#tokenGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
} 