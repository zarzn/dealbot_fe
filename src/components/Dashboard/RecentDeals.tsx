import { useEffect, useState } from 'react';
import { Tag, ArrowUpRight, ShoppingCart, Clock } from 'lucide-react';
import Image from 'next/image';
import { API_CONFIG } from '@/services/api/config';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Deal {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  image?: string;
  category?: string;
  created_at: string;
}

const RecentDeals = () => {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state first
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Only fetch data on client-side
    if (!isMounted) return;
    
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use apiClient instead of fetch for automatic token handling
        const response = await apiClient.get('/api/v1/deals/recent');
        
        setDeals(response.data.deals || []);
      } catch (error: any) {
        console.error('Error fetching recent deals:', error);
        setError('Failed to load deals');
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [isMounted]); // Add isMounted as a dependency

  // Show loading state until component is mounted
  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-white/[0.1] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-white/[0.1] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-white/[0.05] rounded-lg">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center p-4 bg-white/[0.05] rounded-lg">
        <p className="text-gray-400">No recent deals found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <Link href={`/deals?dealId=${deal.id}`} key={deal.id}>
          <div className="bg-white/[0.05] rounded-lg p-4 hover:bg-white/[0.1] transition cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{deal.title}</h4>
                <p className="text-sm text-gray-400 line-clamp-1">{deal.description}</p>
                <span className="inline-block mt-2 text-sm bg-purple/20 text-purple px-2 py-1 rounded">
                  ${deal.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(deal.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentDeals; 