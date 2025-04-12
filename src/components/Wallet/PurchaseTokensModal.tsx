import { useState } from 'react';
import { X, AlertCircle, Loader2, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { walletService } from '@/services/wallet';
import { TokenPurchaseRequest, TokenPurchaseCreateResponse, PaymentMethod } from '@/types/wallet';
import { SystemProgram, PublicKey, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import StripePaymentButton from './StripePaymentButton';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('phantom');

  if (!isOpen) return null;

  const handlePurchase = async () => {
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount');
      return;
    }

    if (paymentMethod === 'stripe') {
      // Stripe payment is handled by the StripePaymentButton component
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if wallet is connected
      const walletInfo = await walletService.getWalletInfo();
      
      if (!walletInfo || !walletInfo.isConnected) {
        toast.error('Please connect your wallet first');
        setIsProcessing(false);
        return;
      }
    
      // Check if Phantom wallet is available
      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        toast.error('Phantom wallet is required');
        setIsProcessing(false);
        return;
      }

      // Calculate price in SOL (dummy conversion for now)
      const priceInUSD = amount * 0.1; // $0.10 per token
      const priceInSOL = priceInUSD / 100; // Dummy SOL price

      // Prepare purchase request
      const purchaseRequest: TokenPurchaseRequest = {
        amount,
        priceInSOL,
        network: 'devnet', // Using devnet for testing
        payment_method: 'phantom',
        memo: `Purchase of ${amount} tokens at ${new Date().toISOString()}`
      };

      // Get transaction instruction from backend
      console.log('Requesting purchase transaction from backend');
      const result = await walletService.createPurchaseTransaction(purchaseRequest);
      
      if (!result || !result.transaction || !result.signature) {
        console.error('Invalid transaction result:', result);
        toast.error('Failed to create transaction. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      console.log('Successfully received transaction from backend');
      
      try {
        // Extract needed information from the transaction
        let recipientAddress = result.transaction.instructions?.[0]?.to || '';
        const amountInSol = result.transaction.instructions?.[0]?.amount || priceInSOL;
        
        console.log(`Original recipient address from backend: ${recipientAddress}`);
        
        // Handle placeholder address from backend
        if (!recipientAddress || recipientAddress === 'SYSTEM_TOKEN_ACCOUNT') {
          // Use a hardcoded valid Solana address for testing purposes
          // In production, this should be the actual treasury wallet address
          recipientAddress = '11111111111111111111111111111111'; // System Program address
          console.log(`Using system program address instead of placeholder: ${recipientAddress}`);
        }
        
        // Validate recipient address only if it's not a placeholder
        let recipientPublicKey: PublicKey;
        try {
          // This will throw if the address is not valid base58
          recipientPublicKey = new PublicKey(recipientAddress);
          console.log(`Valid recipient address: ${recipientPublicKey.toString()}`);
        } catch (e) {
          console.error('Invalid Solana address format:', e);
          toast.error('Invalid recipient address format');
          setIsProcessing(false);
          return;
        }
        
        console.log(`Preparing to transfer ${amountInSol} SOL to ${recipientAddress}`);
        
        // Use the simplest approach possible with Phantom
        try {
          // Connect to the user's wallet if not already connected
          const resp = await provider.connect();
          console.log("Connected to wallet:", resp.publicKey.toString());
          
          // Modern approach using Phantom's signAndSendTransaction method
          console.log("Preparing transaction...");
          
          // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
          const lamports = parseFloat((amountInSol * 1000000000).toFixed(0));
          
          // Create a Solana connection - use the public node for development
          // In production, use a more reliable RPC endpoint
          const connection = new Connection(clusterApiUrl('devnet'));
          
          // Create a proper Solana Transaction object
          const transaction = new Transaction();
          
          // Add the transfer instruction
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: resp.publicKey,
              toPubkey: recipientPublicKey,
              lamports: lamports
            })
          );
          
          // Get the latest blockhash
          let blockhash;
          try {
            const { blockhash: recentBlockhash } = await connection.getLatestBlockhash();
            blockhash = recentBlockhash;
            console.log("Successfully got blockhash:", blockhash);
          } catch (blockHashError) {
            console.error("Error getting blockhash:", blockHashError);
            toast.error("Failed to connect to Solana network. Please try again later.");
            setIsProcessing(false);
            return;
          }
          
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = resp.publicKey;
          
          console.log("Sending transaction with blockhash:", blockhash);
          
          // Sign and send the transaction
          const { signature } = await provider.signAndSendTransaction(transaction);
          console.log("Transaction complete with signature:", signature);
          
          // Verify the signature format
          if (!signature || typeof signature !== 'string') {
            throw new Error('Invalid transaction signature received');
          }
          
          // In a real implementation, we would send the real Solana signature
          // But in this testing environment, we use the backend's placeholder signature
          console.log('Verifying transaction with backend signature:', result.signature);
          
          // Use the result.signature which is the backend-generated ID
          const verifyResult = await walletService.verifyPurchase(result.signature);
          console.log('Transaction successfully verified:', verifyResult);
          
          toast.success(`Successfully purchased ${amount} AIDL tokens! New balance: ${verifyResult.new_balance}`);
          onSuccess();
          onClose();
        } catch (phantomError: any) {
          console.error("Phantom wallet error:", phantomError);
          
          // Map Phantom error codes to user-friendly messages
          if (phantomError.code === 4001) {
            toast.error("Transaction was rejected by the user");
          } else if (phantomError.code === -32602) {
            toast.error("Invalid transaction parameters");
          } else if (phantomError.code === -32603) {
            toast.error("Unexpected error in wallet. Please try again later.");
          } else {
            toast.error(phantomError.message || "Failed to process transaction");
          }
          
          setIsProcessing(false);
        }
      } catch (txError: any) {
        console.error('Transaction processing error:', txError);
        // Add detailed error logging to help debug the issue
        if (txError.name) console.error('Error name:', txError.name);
        if (txError.code) console.error('Error code:', txError.code);
        if (txError.data) console.error('Error data:', txError.data);
        
        toast.error(txError.message || 'Failed to process transaction');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error during purchase:', error);
      toast.error(error.message || 'Failed to create purchase transaction');
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const getTokenAmount = () => selectedAmount || Number(customAmount) || 0;

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
              costs approximately $0.10 USD.
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

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Payment Method
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePaymentMethodChange('phantom')}
              className={`p-3 rounded-lg border transition flex flex-col items-center ${
                paymentMethod === 'phantom'
                  ? 'border-purple bg-purple/20 text-purple'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <WalletIcon className="w-5 h-5 mb-1" />
              <div className="font-medium">Phantom Wallet</div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodChange('stripe')}
              className={`p-3 rounded-lg border transition flex flex-col items-center ${
                paymentMethod === 'stripe'
                  ? 'border-purple bg-purple/20 text-purple'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1" />
              <div className="font-medium">Credit Card</div>
            </button>
          </div>
        </div>

        {/* Payment Processor */}
        <div>
          {paymentMethod === 'phantom' ? (
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
                'Purchase with Phantom'
              )}
            </button>
          ) : (
            <div>
              <StripePaymentButton
                amount={getTokenAmount()}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 