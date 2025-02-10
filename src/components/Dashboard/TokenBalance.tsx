import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

const TokenBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/token/balance');
        const data = await response.json();
        setBalance(data.balance);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Token Balance</h3>
        <Coins className="w-5 h-5 text-purple" />
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-white/[0.1] rounded w-24 mb-2"></div>
          <div className="h-4 bg-white/[0.1] rounded w-32"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-purple">
            {balance?.toLocaleString() ?? '0'} <span className="text-lg">AGNT</span>
          </div>
          <div className="text-white/70 text-sm mt-2">
            Available for deal searches
          </div>
        </>
      )}
    </div>
  );
};

export default TokenBalance; 