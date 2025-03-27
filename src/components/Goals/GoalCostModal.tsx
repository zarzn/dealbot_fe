import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GoalCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokenCost: number;
  features?: string[];
  balance: number;
}

export function GoalCostModal({
  isOpen,
  onClose,
  onConfirm,
  tokenCost = 5,
  features = [
    "AI-powered deal scanning across multiple marketplaces",
    "Real-time price tracking and alerts",
    "Smart filtering based on your specific requirements",
    "Detailed match quality scoring"
  ],
  balance = 0,
}: GoalCostModalProps) {
  const hasEnoughTokens = balance >= tokenCost;

  const handleConfirm = () => {
    if (!hasEnoughTokens) {
      toast.error("Insufficient balance. Please add more tokens to your account.");
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px] bg-[#121212]/80 backdrop-blur-xl border-white/10 shadow-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-xl font-bold">
            Goal Creation Cost
          </DialogTitle>
          <DialogDescription className="text-white/70 mt-2">
            Creating this goal will cost <span className="font-bold text-blue-400">{tokenCost} tokens</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h4 className="font-medium mb-3 text-white">Included features:</h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="text-blue-400 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {!hasEnoughTokens && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-400 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">
                    Insufficient Balance
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    You need {(tokenCost - balance).toFixed(1)} more tokens. Your current balance is {balance.toFixed(1)} tokens.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {hasEnoughTokens && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-400 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium">
                    Sufficient Balance
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    Your balance of {balance.toFixed(1)} tokens is enough to create this goal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between pt-4 border-t border-white/10 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          
          {hasEnoughTokens ? (
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Goal ({tokenCost} tokens)
            </Button>
          ) : (
            <Button
              className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              type="button"
              asChild
            >
              <Link href="/dashboard/wallet?action=purchase">
                <Plus className="h-4 w-4" />
                Add Tokens
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add default export to fix import in SharedGoalView.tsx
export default GoalCostModal; 