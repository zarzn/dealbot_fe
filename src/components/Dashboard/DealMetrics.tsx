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

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Use the full API URL instead of a relative path
        const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/deals/metrics`;
        console.log('Making API request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching deal metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-40 bg-white/[0.1] rounded-lg mb-4"></div>
          <div className="h-20 bg-white/[0.1] rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.03] rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple mr-2" />
            <div className="text-sm text-white/70">Success Rate</div>
          </div>
          <div className="text-2xl font-bold">
            {metrics.successRate}%
          </div>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Percent className="w-5 h-5 text-purple mr-2" />
            <div className="text-sm text-white/70">Avg. Discount</div>
          </div>
          <div className="text-2xl font-bold">
            {metrics.averageDiscount}%
          </div>
        </div>
      </div>

      {/* Deals by Category */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Deals by Category</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.dealsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {metrics.dealsByCategory.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {metrics.dealsByCategory.map((category, index) => (
            <div key={category.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="text-sm">
                <span className="text-white/70">{category.name}</span>
                <span className="ml-2 font-semibold">{category.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Deals */}
      <div className="bg-white/[0.03] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-purple mr-2" />
              <div className="text-sm text-white/70">Total Deals Found</div>
            </div>
            <div className="text-2xl font-bold">
              {metrics.totalDeals.toLocaleString()}
            </div>
          </div>
          <div className="text-right text-sm text-white/70">
            Lifetime
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealMetrics; 