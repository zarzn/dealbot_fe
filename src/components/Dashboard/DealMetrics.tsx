"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Percent, Target } from 'lucide-react';
import { API_CONFIG } from '@/services/api/config';

interface Metrics {
  totalDeals: number;
  successRate: number;
  averageDiscount: number;
  dealsByCategory: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

const DealMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch if component is mounted
    if (!isMounted) return;

    const fetchMetrics = async () => {
      try {
        // Use the full API URL instead of a relative path
        const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/deals/metrics`;
        console.log('Making API request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure we always have the expected structure with proper fallbacks
        setMetrics({
          totalDeals: data.totalDeals || 0,
          successRate: data.successRate || 0,
          averageDiscount: data.averageDiscount || 0,
          dealsByCategory: Array.isArray(data.dealsByCategory) ? data.dealsByCategory : []
        });
      } catch (err) {
        console.error('Error fetching deal metrics:', err);
        setError(`We couldn&apos;t load the deal metrics at this time.`);
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

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
        <div className="bg-white/[0.05] rounded-lg p-6 text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setIsMounted(false); // Reset to trigger refetch
              setTimeout(() => setIsMounted(true), 100);
            }}
            className="px-3 py-1.5 bg-purple/80 rounded-lg hover:bg-purple transition text-sm mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle case where metrics is null or dealsByCategory is missing
  if (!metrics || !metrics.dealsByCategory) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
        <div className="bg-white/[0.05] rounded-lg p-6 text-center">
          <p className="text-white/70">No deal metrics available yet.</p>
        </div>
      </div>
    );
  }

  // Create a safe local variable with fallback to empty array
  const dealsByCategory = Array.isArray(metrics.dealsByCategory) ? metrics.dealsByCategory : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/[0.05] rounded-lg p-4 flex items-center">
          <div className="bg-purple/20 p-2 rounded-full mr-4">
            <TrendingUp className="w-5 h-5 text-purple" />
          </div>
          <div>
            <div className="text-sm text-white/70">Total Deals</div>
            <div className="text-xl font-semibold">{metrics.totalDeals}</div>
          </div>
        </div>
        
        <div className="bg-white/[0.05] rounded-lg p-4 flex items-center">
          <div className="bg-purple/20 p-2 rounded-full mr-4">
            <Percent className="w-5 h-5 text-purple" />
          </div>
          <div>
            <div className="text-sm text-white/70">Success Rate</div>
            <div className="text-xl font-semibold">{metrics.successRate}%</div>
          </div>
        </div>
        
        <div className="bg-white/[0.05] rounded-lg p-4 flex items-center">
          <div className="bg-purple/20 p-2 rounded-full mr-4">
            <Target className="w-5 h-5 text-purple" />
          </div>
          <div>
            <div className="text-sm text-white/70">Avg. Discount</div>
            <div className="text-xl font-semibold">{metrics.averageDiscount}%</div>
          </div>
        </div>
      </div>
      
      {dealsByCategory.length > 0 ? (
        <>
          <h4 className="text-base font-medium mb-4">Deals by Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.05] rounded-lg p-4 flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dealsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white/[0.05] rounded-lg p-4">
              <div className="space-y-3">
                {dealsByCategory.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/[0.05] rounded-lg p-6 text-center">
          <p className="text-white/70">No category data available.</p>
        </div>
      )}
    </div>
  );
};

export default DealMetrics;