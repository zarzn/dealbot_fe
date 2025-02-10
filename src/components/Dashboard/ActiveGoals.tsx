import { useEffect, useState } from 'react';
import { Target, Clock, AlertCircle } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  progress: number;
  deadline: string;
  status: 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const ActiveGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/goals/active');
        const data = await response.json();
        setGoals(data.goals);
      } catch (error) {
        console.error('Error fetching active goals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-white/[0.1] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
        <p className="text-white/70">Create your first goal to start tracking deals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div 
          key={goal.id}
          className="bg-white/[0.03] rounded-lg p-4 hover:bg-white/[0.05] transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold mb-1">{goal.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-white/70">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(goal.deadline).toLocaleDateString()}
                </div>
                <div className={`flex items-center ${getPriorityColor(goal.priority)}`}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-purple">
                {goal.progress}%
              </div>
              <div className="text-sm text-white/70">
                Complete
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/[0.1] rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple transition-all duration-500 ease-out rounded-full"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveGoals; 