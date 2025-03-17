import { X, AlertCircle, Coins } from 'lucide-react';
import Link from 'next/link';

interface TokenCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost: {
    tokenCost: number;
    features: string[];
  };
  balance: number;
}

export default function TokenCostModal({
  isOpen,
  onClose,
  onConfirm,
  cost,
  balance,
}: TokenCostModalProps) {
  if (!isOpen) return null;

  const hasEnoughTokens = balance >= cost.tokenCost;

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
          <h2 className="text-xl font-bold">Confirm Search</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cost Information */}
        <div className="flex items-center gap-3 p-4 bg-white/[0.05] rounded-lg">
          <div className="p-3 bg-purple/20 rounded-lg">
            <Coins className="w-6 h-6 text-purple" />
          </div>
          <div>
            <div className="font-medium">Cost: {cost.tokenCost} AIDL</div>
            <div className="text-sm text-white/70">Balance: {typeof balance === 'number' ? balance.toFixed(2) : '0.00'} AIDL</div>
          </div>
        </div>

        {/* Features */}
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

        {!hasEnoughTokens && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Insufficient Balance</p>
              <p className="text-red-400/70 mt-1">
                You need {typeof balance === 'number' && typeof cost.tokenCost === 'number' ? (cost.tokenCost - balance).toFixed(2) : '0.00'} more AIDL tokens to perform this search.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {hasEnoughTokens ? (
            <>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition"
              >
                Confirm ({cost.tokenCost} AIDL)
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <Link
              href="/dashboard/wallet"
              className="flex-1 px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition text-center"
            >
              Add Tokens
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 