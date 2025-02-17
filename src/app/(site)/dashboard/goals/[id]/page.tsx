"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { goalsService } from '@/services/goals';
import type { Goal } from '@/services/goals';
import { GoalStatusManager } from '@/components/Goals/GoalStatusManager';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    const goalId = params?.id;
    if (!goalId || Array.isArray(goalId)) return;

    try {
      const goalData = await goalsService.getGoalById(goalId);
      setGoal(goalData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (newStatus: Goal['status']) => {
    if (goal) {
      setGoal({ ...goal, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Goal Not Found</h2>
        <p className="text-white/70 mb-4">This goal may have been deleted or doesn&apos;t exist.</p>
        <Link href="/dashboard/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/goals"
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{goal.title}</h1>
            <p className="text-white/70">{goal.itemCategory}</p>
          </div>
        </div>
      </div>

      {/* Status Manager */}
      <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
        <GoalStatusManager goal={goal} onStatusChange={handleStatusChange} />
      </div>

      {/* Goal Details */}
      <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg space-y-6">
        <h2 className="text-lg font-semibold">Goal Details</h2>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-white/70 mb-1">Target Price</div>
            <div className="text-lg font-medium">${goal.targetPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-white/70 mb-1">Current Price</div>
            <div className="text-lg font-medium">${goal.currentPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <div className="text-sm text-white/70 mb-2">Constraints</div>
          <div className="space-y-4">
            {/* Keywords */}
            {goal.constraints.keywords.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {goal.constraints.keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-white/[0.05] rounded-lg text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions */}
            {goal.constraints.conditions.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Conditions</div>
                <div className="flex flex-wrap gap-2">
                  {goal.constraints.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-white/[0.05] rounded-lg text-sm capitalize"
                    >
                      {condition}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {goal.constraints.brands.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Brands</div>
                <div className="flex flex-wrap gap-2">
                  {goal.constraints.brands.map((brand, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-white/[0.05] rounded-lg text-sm"
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="text-sm text-white/70 mb-2">Notifications</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <span className={goal.notifications.email ? 'text-green-400' : 'text-red-400'}>
                {goal.notifications.email ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>In-App Notifications</span>
              <span className={goal.notifications.inApp ? 'text-green-400' : 'text-red-400'}>
                {goal.notifications.inApp ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Price Drop Threshold</span>
              <span>{(goal.notifications.priceThreshold * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 