"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Percent, Target, Clock, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { API_CONFIG } from '@/services/api/config';
import apiClient from '@/lib/api-client';

interface CategoryData {
  name: string;
  value: number;
}

// Update interface to match the backend response structure
interface BackendMetrics {
  total_deals: number;
  total_value: number;
  successful_deals: number;
  pending_deals: number;
  failed_deals: number;
  avg_completion_time: number;
  most_active_market: {
    id: string;
    name: string;
    deals_count: number;
  } | null;
}

// Keep the frontend expected structure but make it adaptable
interface Metrics {
  totalDeals: number;
  successRate: number;
  averageDiscount: number;
  dealsByCategory: CategoryData[];
  // Add additional fields from backend
  pendingDeals: number;
  failedDeals: number;
  avgCompletionTime: number;
  mostActiveMarket: {
    id: string;
    name: string;
    deals_count: number;
  } | null;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

// Create a default/placeholder category data when real data is not available
const DEFAULT_CATEGORIES: CategoryData[] = [
  { name: 'Completed', value: 0 },
  { name: 'Pending', value: 0 },
  { name: 'Failed', value: 0 }
];

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
        
        // Extract the backend metrics
        const backendMetrics = response.data as BackendMetrics;
        
        // Calculate success rate
        const totalDeals = backendMetrics.total_deals || 0;
        const successfulDeals = backendMetrics.successful_deals || 0;
        const successRate = totalDeals > 0 ? Math.round((successfulDeals / totalDeals) * 100) : 0;
        
        // Use a placeholder for average discount since it's not provided by the backend
        const averageDiscount = 0; // No real data available
        
        // Create category breakdown from available data
        const dealsByCategory: CategoryData[] = [];
        
        if (successfulDeals > 0) {
          dealsByCategory.push({ name: 'Completed', value: successfulDeals });
        }
        if (backendMetrics.pending_deals > 0) {
          dealsByCategory.push({ name: 'Pending', value: backendMetrics.pending_deals });
        }
        if (backendMetrics.failed_deals > 0) {
          dealsByCategory.push({ name: 'Failed', value: backendMetrics.failed_deals });
        }
        
        // Use default category data if we don't have any real data
        const finalCategoryData = dealsByCategory.length > 0 ? dealsByCategory : DEFAULT_CATEGORIES;
        
        // Transform into the expected format with adaptations
        setMetrics({
          totalDeals: backendMetrics.total_deals || 0,
          successRate: successRate,
          averageDiscount: averageDiscount,
          dealsByCategory: finalCategoryData,
          // Additional metrics from backend
          pendingDeals: backendMetrics.pending_deals || 0,
          failedDeals: backendMetrics.failed_deals || 0,
          avgCompletionTime: backendMetrics.avg_completion_time || 0,
          mostActiveMarket: backendMetrics.most_active_market
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Pending Deals</p>
          </div>
          <p className="text-2xl font-semibold">{metrics.pendingDeals}</p>
        </div>
      </div>
      
      {/* Additional Stats */}
      {metrics.mostActiveMarket && (
        <div className="bg-white/[0.05] rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-400 mb-2">Most Active Market</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">{metrics.mostActiveMarket.name}</p>
            <p className="text-sm text-gray-400">{metrics.mostActiveMarket.deals_count} deals</p>
          </div>
        </div>
      )}
      
      {metrics.avgCompletionTime > 0 && (
        <div className="bg-white/[0.05] rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-gray-400">Average Completion Time</p>
          </div>
          <p className="text-lg font-medium">{metrics.avgCompletionTime.toFixed(1)} hours</p>
        </div>
      )}
    </div>
  );
};

export default DealMetrics;