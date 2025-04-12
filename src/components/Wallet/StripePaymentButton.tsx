import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { walletService } from '@/services/wallet';
import { TokenPurchaseRequest } from '@/types/wallet';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Custom hook to initialize Stripe with proper error handling
const useStripeInit = () => {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [error, setError] = useState('');
  const [stripePromiseReady, setStripePromiseReady] = useState(false);
  
  useEffect(() => {
    const initStripe = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        // Log for debugging
        console.log('Stripe key available:', !!key);
        
        if (!key) {
          setError('Stripe publishable key is missing');
          return;
        }
        
        const stripe = await loadStripe(key);
        if (!stripe) {
          setError('Failed to initialize Stripe');
          return;
        }
        
        setStripePromise(stripe);
        setStripePromiseReady(true);
      } catch (err) {
        console.error('Error initializing Stripe:', err);
        setError('Error initializing Stripe');
      }
    };
    
    initStripe();
  }, []);
  
  return { stripePromise, error, stripePromiseReady };
};

interface StripePaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  onSuccess: () => void;
}

// Form component for Stripe elements
const StripePaymentForm = ({ clientSecret, paymentIntentId, amount, onSuccess }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Stripe.js has loaded
  useEffect(() => {
    if (!stripe) {
      setError('Stripe.js has not loaded yet. Please try again later.');
    } else {
      setError(null);
    }
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      setError('Stripe.js has not loaded yet. Please try again later.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/wallet?verified=true`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Show error to user
        setError(result.error.message || 'Payment failed');
        toast.error(result.error.message || 'Payment failed');
        console.error('Payment error:', result.error);
        return;
      }

      // Payment succeeded
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment successful:', result.paymentIntent);
        
        // Verify with backend
        await walletService.verifyStripePayment(paymentIntentId);
        
        toast.success(`Successfully purchased ${amount} AIDL tokens!`);
        onSuccess();
      } else {
        // Payment requires additional action or is not complete
        console.log('Payment status:', result.paymentIntent?.status);
        setError('Payment not completed. Please try again.');
        toast.error('Payment not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
      toast.error(err.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-3 bg-red-500/20 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay with Stripe'
        )}
      </button>
    </form>
  );
};

interface StripePaymentButtonProps {
  amount: number;
  onSuccess: () => void;
}

export default function StripePaymentButton({ amount, onSuccess }: StripePaymentButtonProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { stripePromise, error: stripeError, stripePromiseReady } = useStripeInit();

  useEffect(() => {
    if (amount <= 0 || !stripePromiseReady) return;

    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        // Create purchase request
        const purchaseRequest: TokenPurchaseRequest = {
          amount,
          priceInSOL: 0, // Not needed for Stripe
          payment_method: 'stripe'
        };

        // Get payment intent from backend
        const result = await walletService.createStripePayment(purchaseRequest);
        
        setClientSecret(result.client_secret);
        setPaymentIntentId(result.payment_intent_id);
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        toast.error(error.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, stripePromiseReady]);

  // Show loading indicator while initializing Stripe or creating payment intent
  if (isLoading || (!stripePromiseReady && !stripeError)) {
    return (
      <div className="py-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple" />
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
        {stripeError || 'Failed to initialize Stripe. Please check your configuration.'}
      </div>
    );
  }

  if (!clientSecret || !paymentIntentId) {
    return (
      <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
        Failed to initialize Stripe payment. Please try again.
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
        Failed to initialize Stripe. Please check your configuration or try again later.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm 
        clientSecret={clientSecret} 
        paymentIntentId={paymentIntentId} 
        amount={amount} 
        onSuccess={onSuccess} 
      />
    </Elements>
  );
} 