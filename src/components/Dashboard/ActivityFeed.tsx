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

interface Activity {
  id: string;
  type: 'goal_created' | 'deal_found' | 'notification_sent' | 'tokens_added' | 'search_completed' | 'goal_completed';
  title: string;
  description: string;
  timestamp: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Use the full API URL instead of a relative path
        const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/activity`;
        console.log('Making API request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        setActivities(data.activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

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

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
        <p className="text-white/70">Your activity will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="bg-white/[0.03] rounded-lg p-4 hover:bg-white/[0.05] transition"
        >
          <div className="flex items-start space-x-4">
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-semibold mb-1">{activity.title}</h4>
              <p className="text-sm text-white/70 mb-2">{activity.description}</p>
              <div className="text-xs text-white/50">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed; 