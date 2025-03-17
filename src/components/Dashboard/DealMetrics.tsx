"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Percent, Target } from 'lucide-react';
import { API_CONFIG } from '@/services/api/config';
import apiClient from '@/lib/api-client';

interface CategoryData {
  name: string;
  value: number;
}

interface Metrics {
  totalDeals: number;
  successRate: number;
  averageDiscount: number;
  dealsByCategory: CategoryData[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

const DealMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Only fetch if component is mounted
    if (!isMounted) return;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use apiClient instead of fetch for automatic token handling
        const response = await apiClient.get('/api/v1/deals/metrics');
        
        // Ensure we always have the expected structure with proper fallbacks
        setMetrics({
          totalDeals: response.data.totalDeals || 0,
          successRate: response.data.successRate || 0,
          averageDiscount: response.data.averageDiscount || 0,
          dealsByCategory: Array.isArray(response.data.dealsByCategory) ? response.data.dealsByCategory : []
        });
      } catch (err: any) {
        console.error('Error fetching deal metrics:', err);
        setError(`We couldn't load the deal metrics at this time.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [isMounted]);

  // Early return for server-side rendering
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
        <div className="animate-pulse">
          <div className="h-40 bg-white/[0.1] rounded-lg mb-4"></div>
          <div className="h-20 bg-white/[0.1] rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
        <div className="animate-pulse">
          <div className="h-40 bg-white/[0.1] rounded-lg mb-4"></div>
          <div className="h-20 bg-white/[0.1] rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
        <div className="bg-white/[0.05] rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Data might be loading or empty
  if (!metrics) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
        <div className="bg-white/[0.05] rounded-lg p-4 text-center">
          <p className="text-gray-400">No metrics available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
      
      {/* Chart Section */}
      <div className="bg-white/[0.05] rounded-lg p-4 h-64">
        {metrics.dealsByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.dealsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {metrics.dealsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} deals`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No category data available</p>
          </div>
        )}
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.05] rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Deals</p>
          <p className="text-2xl font-semibold">{metrics.totalDeals}</p>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <p className="text-sm text-gray-400">Success Rate</p>
          <p className="text-2xl font-semibold">{metrics.successRate}%</p>
        </div>
        <div className="bg-white/[0.05] rounded-lg p-4">
          <p className="text-sm text-gray-400">Avg. Discount</p>
          <p className="text-2xl font-semibold">{metrics.averageDiscount}%</p>
        </div>
      </div>
    </div>
  );
};

export default DealMetrics;