import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GoalCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost: number;
  balance: number;
}

export default function GoalCostModal({
  isOpen,
  onClose,
  onConfirm,
  cost,
  balance,
}: GoalCostModalProps) {
  const formattedCost = typeof cost === 'number' ? cost.toFixed(1) : '0.0';
  const formattedBalance = typeof balance === 'number' ? balance.toFixed(1) : '0.0';
  const isAffordable = typeof cost === 'number' && typeof balance === 'number' && balance >= cost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Goal
          </DialogTitle>
          <DialogDescription>
            You&apos;re about to create a new goal with our AI agents
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium mb-1">Cost Summary</h3>
            <div className="flex justify-between items-center text-sm">
              <span>Base cost:</span>
              <span>5.0 tokens</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Priority adjustment:</span>
              <span>{typeof cost === 'number' ? (cost - 5).toFixed(1) : '0.0'} tokens</span>
            </div>
            <div className="h-px bg-muted my-2"></div>
            <div className="flex justify-between items-center font-medium">
              <span>Total cost:</span>
              <span>{formattedCost} tokens</span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span>Your balance:</span>
            <span>{formattedBalance} tokens</span>
          </div>

          {!isAffordable && (
            <div className="mt-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded text-sm">
              You don&apos;t have enough tokens. Please add more tokens to your wallet.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!isAffordable}>
            Confirm ({formattedCost} tokens)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 