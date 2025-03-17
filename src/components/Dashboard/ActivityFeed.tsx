import { useEffect, useState } from 'react';
import { 
  Target, 
  ShoppingCart, 
  Bell, 
  Wallet, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { API_CONFIG } from '@/services/api/config';
import apiClient from '@/lib/api-client';

export interface Activity {
  id: string;
  type: 'goal_created' | 'deal_found' | 'notification_sent' | 'tokens_added' | 'search_completed' | 'goal_completed';
  message: string;
  timestamp: string;
  entity_id?: string;
  entity_type?: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
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
    
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use apiClient instead of fetch for automatic token handling
        const response = await apiClient.get('/api/v1/activity');
        
        setActivities(response.data.activities || []);
      } catch (error: any) {
        console.error('Error fetching activities:', error);
        setError('Failed to load activity feed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [isMounted]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'goal_created':
        return <Target className="w-5 h-5 text-purple" />;
      case 'deal_found':
        return <ShoppingCart className="w-5 h-5 text-green-400" />;
      case 'notification_sent':
        return <Bell className="w-5 h-5 text-blue-400" />;
      case 'tokens_added':
        return <Wallet className="w-5 h-5 text-yellow-400" />;
      case 'search_completed':
        return <Search className="w-5 h-5 text-indigo-400" />;
      case 'goal_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      default:
        return null;
    }
  };

  // Show loading state until component is mounted
  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-white/[0.1] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-white/[0.1] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-white/[0.05] rounded-lg">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center p-4 bg-white/[0.05] rounded-lg">
        <p className="text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-white/[0.05] rounded-lg p-4 flex items-start">
          <div className="bg-white/[0.1] p-2 rounded-full mr-3 mt-1">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm">{activity.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed; 