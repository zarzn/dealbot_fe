import { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { walletService } from '@/services/wallet';

interface PurchaseTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PURCHASE_OPTIONS = [
  { amount: 100, price: 10 },
  { amount: 500, price: 45 },
  { amount: 1000, price: 85 },
  { amount: 5000, price: 400 },
];

export default function PurchaseTokensModal({
  isOpen,
  onClose,
  onSuccess,
}: PurchaseTokensModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      // Check if wallet is connected
      const walletInfo = await walletService.getWalletInfo();
      if (!walletInfo.isConnected) {
        toast.error('Please connect your wallet first');
        return;
      }

      // Calculate price in SOL (dummy conversion for now)
      const priceInUSD = amount * 0.1; // $0.10 per token
      const priceInSOL = priceInUSD / 100; // Dummy SOL price

      // Request transaction from backend
      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        toast.error('Phantom wallet is required');
        return;
      }

      // Get transaction instruction from backend
      const { transaction, signature } = await walletService.createPurchaseTransaction({
        amount,
        priceInSOL,
      });

      // Sign and send transaction
      await provider.signAndSendTransaction(transaction);

      // Verify transaction
      await walletService.verifyPurchase(signature);

      toast.success(`Successfully purchased ${amount} AIDL tokens!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase tokens');
    } finally {
      setIsProcessing(false);
    }
  };

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
          <h2 className="text-xl font-bold">Purchase Tokens</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-3 bg-white/[0.05] rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-purple shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-purple">Token Purchase Information</p>
            <p className="text-white/70 mt-1">
              Tokens are required for using the AI deal-finding features. Each token
              costs approximately $0.10 USD, paid in SOL.
            </p>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {PURCHASE_OPTIONS.map(({ amount, price }) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`p-3 rounded-lg border transition ${
                  selectedAmount === amount
                    ? 'border-purple bg-purple/20 text-purple'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-medium">{amount} AIDL</div>
                <div className="text-sm text-white/70">${price} USD</div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Amount
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="Enter amount of tokens"
              className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
              min="1"
            />
            {customAmount && (
              <div className="mt-1 text-sm text-white/70">
                ≈ ${(Number(customAmount) * 0.1).toFixed(2)} USD
              </div>
            )}
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isProcessing || (!selectedAmount && !customAmount)}
          className="w-full px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Purchase Tokens'
          )}
        </button>
      </div>
    </div>
  );
} 