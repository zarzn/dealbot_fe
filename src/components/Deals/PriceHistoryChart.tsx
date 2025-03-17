import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PriceHistory } from '@/types/deals';

interface PriceHistoryChartProps {
  data: PriceHistory[];
  currentPrice: number;
}

export default function PriceHistoryChart({ data, currentPrice }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Add current price point
    return [
      ...sortedData,
      {
        timestamp: new Date().toISOString(),
        price: currentPrice,
        source: 'Current',
      },
    ];
  }, [data, currentPrice]);

  const minPrice = useMemo(() => 
    Math.min(...chartData.map(d => d.price)) * 0.95, // 5% lower than min
    [chartData]
  );

  const maxPrice = useMemo(() => 
    Math.max(...chartData.map(d => d.price)) * 1.05, // 5% higher than max
    [chartData]
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return `$${typeof price === 'number' ? price.toFixed(2) : '0.00'}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <div className="text-sm font-medium">
            {formatDate(data.timestamp)}
          </div>
          <div className="text-lg font-bold text-purple">
            {formatPrice(data.price)}
          </div>
          <div className="text-sm text-white/70">
            {data.source}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatDate}
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.5)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tickFormatter={formatPrice}
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.5)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 