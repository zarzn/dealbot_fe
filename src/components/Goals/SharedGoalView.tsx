import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, User, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { goalsService } from '@/services/goals';
import type { Goal } from '@/services/goals';
import GoalCostModal from './GoalCostModal';

interface SharedGoalViewProps {
  goal: Goal;
  balance: number;
}

export default function SharedGoalView({ goal, balance }: SharedGoalViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [cloneCost, setCloneCost] = useState<{ tokenCost: number; features: string[] } | null>(null);

  const handleCloneClick = async () => {
    try {
      // First get the cost of cloning
      const cost = await goalsService.getGoalCost();
      setCloneCost(cost);
      setShowCostModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get clone cost');
    }
  };

  const handleConfirmClone = async () => {
    if (!goal.id) return;

    setIsLoading(true);
    try {
      await goalsService.cloneSharedGoal(goal.id);
      toast.success('Goal cloned successfully!');
      router.push('/dashboard/goals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clone goal');
    } finally {
      setIsLoading(false);
      setShowCostModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/goals"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Shared Goal</h1>
          <p className="text-white/70">View and clone this shared goal</p>
        </div>
      </div>

      {/* Goal Card */}
      <div className="bg-gray-900 rounded-xl p-6 space-y-6 max-w-2xl">
        {/* Goal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple/20 rounded-lg">
            <Target className="w-6 h-6 text-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{goal.title}</h2>
            <p className="text-white/70">{goal.itemCategory}</p>
          </div>
        </div>

        {/* Shared By */}
        {goal.sharedBy && (
          <div className="flex items-center gap-3 p-4 bg-white/[0.05] rounded-lg">
            <div className="p-2 bg-white/[0.1] rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <div className="text-white/70">Shared by</div>
              <div className="font-medium">{goal.sharedBy.name}</div>
            </div>
          </div>
        )}

        {/* Goal Details */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-white/70 mb-1">Target Price</div>
            <div className="font-medium">${goal.targetPrice.toFixed(2)}</div>
          </div>

          <div>
            <div className="text-sm text-white/70 mb-1">Current Price</div>
            <div className="font-medium">${goal.currentPrice.toFixed(2)}</div>
          </div>

          {goal.constraints.maxPrice && (
            <div>
              <div className="text-sm text-white/70 mb-1">Maximum Price</div>
              <div className="font-medium">${goal.constraints.maxPrice.toFixed(2)}</div>
            </div>
          )}

          {goal.constraints.features && goal.constraints.features.length > 0 && (
            <div>
              <div className="text-sm text-white/70 mb-2">Features</div>
              <ul className="space-y-2">
                {goal.constraints.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCloneClick}
            disabled={isLoading}
            className="px-6 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cloning...' : 'Clone Goal'}
          </button>
          <Link
            href="/dashboard/goals"
            className="px-6 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Cost Modal */}
      {cloneCost && (
        <GoalCostModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          onConfirm={handleConfirmClone}
          cost={cloneCost}
          balance={balance}
        />
      )}
    </div>
  );
} 