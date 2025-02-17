"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { goalsService } from '@/services/goals';
import { walletService } from '@/services/wallet';
import SharedGoalView from '@/components/Goals/SharedGoalView';
import type { Goal } from '@/services/goals';

export default function SharedGoalPage() {
  const params = useParams();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSharedGoal();
    loadWalletBalance();
  }, []);

  const loadSharedGoal = async () => {
    const shareId = params?.id;
    if (!shareId || Array.isArray(shareId)) return;

    try {
      const sharedGoal = await goalsService.getSharedGoal(shareId);
      setGoal(sharedGoal);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load shared goal');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-bold">Goal Not Found</h2>
        <p className="text-white/70">This shared goal may have expired or been removed.</p>
      </div>
    );
  }

  return <SharedGoalView goal={goal} balance={balance} />;
} 