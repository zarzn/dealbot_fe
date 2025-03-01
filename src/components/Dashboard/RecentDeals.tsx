import { useEffect, useState } from 'react';
import { Tag, ArrowUpRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/deals/recent');
        const data = await response.json();
        setDeals(data.deals);
      } catch (error) {
        console.error('Error fetching recent deals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

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

  if (deals.length === 0) {
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
                src={deal.imageUrl}
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
              href={deal.url}
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