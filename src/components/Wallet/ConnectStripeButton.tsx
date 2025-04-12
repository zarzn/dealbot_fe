import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConnectStripeButtonProps {
  onClicked: () => void;
}

export default function ConnectStripeButton({ onClicked }: ConnectStripeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    
    // Just trigger the purchase modal with Stripe selected
    onClicked();
    
    // Reset loading state
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          Pay with Card
        </>
      )}
    </button>
  );
} 