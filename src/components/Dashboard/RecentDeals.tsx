import { useEffect, useState } from 'react';
import { Tag, ArrowUpRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { API_CONFIG } from '@/services/api/config';

interface Deal {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  source: string;
  url: string;
  foundAt: string;
}

const RecentDeals = () => {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state first
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch data on client-side
    if (!isMounted) return;
    
    const fetchDeals = async () => {
      try {
        // Use the full API URL instead of a relative path
        const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/deals/recent`;
        console.log('Making API request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
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
      <div className="text-center py-8">
        <ShoppingCart className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Deals</h3>
        <p className="text-white/70">{error}</p>
      </div>
    );
  }

  // Safely check if deals exist and have length
  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Deals Found Yet</h3>
        <p className="text-white/70">We&apos;ll notify you when we find deals matching your goals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <div 
          key={deal.id}
          className="bg-white/[0.03] rounded-lg p-4 hover:bg-white/[0.05] transition cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            {/* Product Image */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={deal.imageUrl || '/images/placeholder.jpg'}
                alt={deal.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Deal Info */}
            <div className="flex-grow min-w-0">
              <h4 className="font-semibold mb-1 truncate">{deal.title}</h4>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-400">
                  <Tag className="w-4 h-4 mr-1" />
                  {deal.discount}% OFF
                </div>
                <div className="text-white/70">
                  via {deal.source}
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-semibold text-white">
                ${deal.price.toFixed(2)}
              </div>
              <div className="text-sm text-white/70 line-through">
                ${deal.originalPrice.toFixed(2)}
              </div>
            </div>

            {/* View Deal Button */}
            <a
              href={isMounted ? deal.url : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-purple/20 hover:bg-purple/30 transition flex-shrink-0"
            >
              <ArrowUpRight className="w-4 h-4 text-purple" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentDeals; 