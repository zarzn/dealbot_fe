"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Percent, Target, Clock, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
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

// Change color palette to make Pending status gray
const COLORS = ['rgb(74, 222, 128)', 'rgb(156, 163, 175)', 'rgb(239, 68, 68)', 'rgb(187, 247, 208)'];

// Create a default/placeholder category data when real data is not available
const DEFAULT_CATEGORIES: CategoryData[] = [
  { name: 'Completed', value: 0 }, // Green
  { name: 'Pending', value: 0 },   // Gray
  { name: 'Failed', value: 0 }     // Red
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
        
        console.log('Fetching deal metrics...');
        
        // Use apiClient instead of fetch for automatic token handling
        const response = await apiClient.get('/api/v1/deals/metrics');
        
        console.log('Deal metrics response:', response.data);
        
        // Validate response data structure
        if (!response.data || typeof response.data !== 'object') {
          console.error('Invalid metrics data structure:', response.data);
          throw new Error('Invalid metrics data received from server');
        }
        
        // Extract the backend metrics
        const backendMetrics = response.data as BackendMetrics;
        
        // Log specific metrics for debugging
        console.log('Metrics details:', {
          total_deals: backendMetrics.total_deals,
          successful_deals: backendMetrics.successful_deals,
          pending_deals: backendMetrics.pending_deals,
          failed_deals: backendMetrics.failed_deals,
          total_value: backendMetrics.total_value
        });
        
        // Calculate success rate
        const totalDeals = backendMetrics.total_deals || 0;
        const successfulDeals = backendMetrics.successful_deals || 0;
        const successRate = totalDeals > 0 ? Math.round((successfulDeals / totalDeals) * 100) : 0;
        
        // Use a placeholder for average discount since it's not provided by the backend
        const averageDiscount = 0; // No real data available
        
        // Create category breakdown from available data in specific order to match our color scheme
        const dealsByCategory: CategoryData[] = [];
        
        // First: Completed (green)
        if (successfulDeals > 0) {
          dealsByCategory.push({ name: 'Completed', value: successfulDeals });
        }
        
        // Second: Pending (gray)
        const pendingDeals = backendMetrics.pending_deals || 0;
        if (pendingDeals > 0) {
          dealsByCategory.push({ name: 'Pending', value: pendingDeals });
        }
        
        // Third: Failed (red)
        const failedDeals = backendMetrics.failed_deals || 0;
        if (failedDeals > 0) {
          dealsByCategory.push({ name: 'Failed', value: failedDeals });
        }
        
        // If we have no data, add at least one category with zero value to prevent empty chart
        if (dealsByCategory.length === 0 && totalDeals > 0) {
          // If we have deals but no categorized data, add a default category
          dealsByCategory.push({ name: 'Uncategorized', value: totalDeals });
        } else if (dealsByCategory.length === 0) {
          // If we don't have any deals, use default categories for visual display
          dealsByCategory.push(...DEFAULT_CATEGORIES);
        }
        
        console.log('Processed categories:', dealsByCategory);
        
        // Transform into the expected format with adaptations
        const metricsData = {
          totalDeals: totalDeals,
          successRate: successRate,
          averageDiscount: averageDiscount,
          dealsByCategory: dealsByCategory,
          // Additional metrics from backend
          pendingDeals: pendingDeals,
          failedDeals: failedDeals,
          avgCompletionTime: backendMetrics.avg_completion_time || 0,
          mostActiveMarket: backendMetrics.most_active_market
        };
        
        console.log('Final metrics data:', metricsData);
        setMetrics(metricsData);
      } catch (err: any) {
        console.error('Error fetching deal metrics:', err);
        setError(err.response?.data?.detail || err.message || `We couldn't load the deal metrics at this time.`);
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

  // Helper to check if we have any non-zero category values
  const hasVisibleData = metrics.dealsByCategory.some(cat => cat.value > 0);
  
  // Check if we have only a single category with 100%
  const hasSingleCategory = metrics.dealsByCategory.length === 1 && metrics.dealsByCategory[0].value > 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
      
      {/* Chart Section */}
      <div className="bg-white/[0.05] rounded-lg p-4 h-64">
        {hasVisibleData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.dealsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={hasSingleCategory ? 30 : 25}
                outerRadius={hasSingleCategory ? 60 : 70}
                paddingAngle={hasSingleCategory ? 0 : 4}
                fill="rgb(74, 222, 128)"
                strokeWidth={0}
                dataKey="value"
                label={({ name, percent }) => {
                  // Get a shorter label for single category with 100%
                  const isSingleCategory = metrics.dealsByCategory.length === 1;
                  const percentText = `${(percent * 100).toFixed(0)}%`;
                  
                  // For single categories that take up 100%, just show the percentage
                  if (isSingleCategory && percentText === "100%") {
                    return percentText;
                  }
                  
                  // For multiple categories or non-100% values, show name and percentage
                  return percent > 0 ? `${name}: ${percentText}` : '';
                }}
                // Add fontSize and color for better control
                style={{ 
                  fontSize: hasSingleCategory ? '16px' : '12px', 
                  fontWeight: 'bold', 
                  fill: 'rgb(107, 114, 128)' // Darker gray color
                }}
              >
                {metrics.dealsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} deals`, 'Count']}
                contentStyle={{ backgroundColor: '#1e1e2e', borderColor: 'rgb(74, 222, 128)' }}
                itemStyle={{ color: '#e2e2e2' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="mb-2">
              <HelpCircle className="h-10 w-10 text-[rgb(74,222,128)] mb-2 mx-auto" />
            </div>
            <p className="text-gray-400 text-center">No deal data to display yet</p>
            <p className="text-gray-500 text-sm text-center mt-2">
              Data will appear here as you add and manage deals
            </p>
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
            <Clock className="w-4 h-4 text-[rgb(74,222,128)]" />
            <p className="text-sm text-gray-400">Average Completion Time</p>
          </div>
          <p className="text-lg font-medium">{metrics.avgCompletionTime.toFixed(1)} hours</p>
        </div>
      )}
    </div>
  );
};

export default DealMetrics;