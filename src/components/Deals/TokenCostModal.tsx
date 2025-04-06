import { X, AlertCircle, Coins } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';

interface TokenCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  // Support both formats: either cost object or direct tokenCost
  cost?: {
    tokenCost: number;
    features: string[];
  };
  tokenCost?: number;
  balance?: number;
  title?: string;
  description?: string;
}

export default function TokenCostModal({
  isOpen,
  onClose,
  onConfirm,
  cost,
  tokenCost,
  balance: propBalance,
  title = "Confirm Action",
  description,
}: TokenCostModalProps) {
  // Get user balance from store if not provided as prop
  const userStore = useUserStore();
  const userBalance = propBalance ?? userStore.user?.tokenBalance ?? 0;
  
  if (!isOpen) return null;

  // Determine token cost from either source
  const actualTokenCost = cost?.tokenCost ?? tokenCost ?? 0;
  const hasEnoughTokens = userBalance >= actualTokenCost;
  
  // Determine if we have features to display
  const hasFeatures = cost?.features && cost.features.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-xl w-full max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description if provided */}
        {description && (
          <p className="text-white/70">{description}</p>
        )}

        {/* Cost Information */}
        <div className="flex items-center gap-3 p-4 bg-white/[0.05] rounded-lg">
          <div className="p-3 bg-purple/20 rounded-lg">
            <Coins className="w-6 h-6 text-purple" />
          </div>
          <div>
            <div className="font-medium">Cost: {actualTokenCost} AIDL</div>
            <div className="text-sm text-white/70">Balance: {typeof userBalance === 'number' ? userBalance.toFixed(2) : '0.00'} AIDL</div>
          </div>
        </div>

        {/* Features - only show if we have features to display */}
        {hasFeatures && (
          <div>
            <h3 className="text-sm font-medium mb-2">Included Features:</h3>
            <ul className="space-y-2">
              {cost.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasEnoughTokens && (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 text-amber-400 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Balance Warning</p>
              <p className="text-amber-400/90 mt-1">
                Your displayed balance ({userBalance.toFixed(2)} AIDL) appears to be lower than the cost ({actualTokenCost} AIDL). 
                You can still proceed, but the operation will fail if your actual balance is insufficient.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition"
          >
            Confirm ({actualTokenCost} AIDL)
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition"
          >
            Cancel
          </button>
        </div>
        
        {!hasEnoughTokens && (
          <div className="flex justify-center mt-2">
            <Link
              href="/dashboard/wallet"
              className="text-sm text-purple hover:underline"
            >
              Add more tokens to your account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 