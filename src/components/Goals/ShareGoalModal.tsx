import { useState } from 'react';
import { X, Share2, Copy, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { goalsService } from '@/services/goals';
import type { SharedGoalResponse } from '@/services/goals';

interface ShareGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  goalTitle: string;
  balance: number;
}

export default function ShareGoalModal({
  isOpen,
  onClose,
  goalId,
  goalTitle,
  balance,
}: ShareGoalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareData, setShareData] = useState<SharedGoalResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const response = await goalsService.shareGoal(goalId);
      setShareData(response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to share goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const hasEnoughTokens = shareData ? balance >= shareData.tokenCost : true;

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
          <h2 className="text-xl font-bold">Share Goal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Info */}
        <div className="flex items-center gap-3 p-4 bg-white/[0.05] rounded-lg">
          <div className="p-3 bg-purple/20 rounded-lg">
            <Share2 className="w-6 h-6 text-purple" />
          </div>
          <div>
            <div className="font-medium">{goalTitle}</div>
            {shareData && (
              <div className="text-sm text-white/70">Cost: {shareData.tokenCost} AIDL</div>
            )}
          </div>
        </div>

        {/* Share URL */}
        {shareData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-3 bg-white/[0.05] rounded-lg">
              <input
                type="text"
                value={shareData.shareUrl}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-white/[0.1] rounded-lg transition"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Insufficient Balance Warning */}
        {shareData && !hasEnoughTokens && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Insufficient Balance</p>
              <p className="text-red-400/70 mt-1">
                You need {(shareData.tokenCost - balance).toFixed(2)} more AIDL tokens to share this goal.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!shareData ? (
            <button
              onClick={handleShare}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating Link...' : 'Generate Share Link'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 