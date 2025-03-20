import { useEffect, useState } from 'react';
import { Tag, ArrowUpRight, ShoppingCart, Clock, Star, BarChart, Package, Truck, Target, Shield, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import { API_CONFIG } from '@/services/api/config';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Deal {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number | string;
  original_price?: number | string | null;
  image_url?: string;
  category?: string;
  created_at: string;
  latest_score?: number | null;
  seller_info?: {
    name: string;
    rating: number;
    reviews?: number;
    condition?: string;
  } | null;
  shipping_info?: {
    free_shipping?: boolean;
    estimated_days?: number;
    cost?: number;
  } | null;
  features?: string[];
  expires_at?: string;
  availability?: {
    in_stock?: boolean;
    quantity?: number;
  } | null;
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
        
        // Check if user is logged in
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
        
        // Use the appropriate endpoint based on auth status
        const endpoint = hasToken ? '/api/v1/deals/recent' : '/api/v1/public-deals?page=1&page_size=6';
        
        // Use apiClient instead of fetch for automatic token handling
        const response = await apiClient.get(endpoint);
        
        // Handle both data structures - direct array or { deals: [] }
        const dealsData = Array.isArray(response.data) ? response.data : response.data?.deals || [];
        console.log('Fetched deals:', dealsData); // For debugging
        
        setDeals(dealsData);
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

  // Helper function to format price safely
  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00';
    return typeof price === 'string' ? parseFloat(price).toLocaleString() : price.toLocaleString();
  };

  // Helper function to calculate discount percentage
  const calculateDiscount = (original: number | string | null | undefined, current: number | string) => {
    if (!original) return null;
    const originalNum = typeof original === 'string' ? parseFloat(original) : original;
    const currentNum = typeof current === 'string' ? parseFloat(current) : current;
    
    if (!originalNum || originalNum <= currentNum) return null;
    return Math.round(((originalNum - currentNum) / originalNum) * 100);
  };

  // Get color based on score value
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  // Show loading state until component is mounted
  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-white/[0.1] rounded-lg"></div>
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
            <div className="h-40 bg-white/[0.1] rounded-lg"></div>
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
    <div className="flex flex-col gap-4">
      {deals.map((deal) => (
        <Link href={`/dashboard/deals/${deal.id}`} key={deal.id}>
          <div className="bg-white/[0.05] rounded-lg p-5 hover:bg-white/[0.1] transition cursor-pointer border border-white/10">
            <div className="flex gap-4">
              {/* Deal image or placeholder */}
              <div className="relative h-24 w-24 flex-shrink-0 bg-white/[0.02] rounded-md flex items-center justify-center overflow-hidden">
                {deal.image_url ? (
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="h-full w-full object-contain rounded-md"
                    onError={(e) => {
                      // Set fallback image to our SVG placeholder
                      e.currentTarget.src = '/placeholder-deal.svg';
                      e.currentTarget.onerror = null; // Prevent infinite loop
                    }}
                  />
                ) : (
                  <Package className="h-8 w-8 text-white/30" />
                )}
              </div>
              
              <div className="flex flex-col flex-1">
                {/* Header with category and rating */}
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">
                      {deal.category || 'Uncategorized'}
                    </span>
                    {deal.seller_info?.condition && (
                      <>
                        <span className="text-xs text-white/50">•</span>
                        <span className="text-xs text-white/50">
                          {deal.seller_info.condition}
                        </span>
                      </>
                    )}
                  </div>
                  {deal.seller_info && deal.seller_info.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-white">
                        {deal.seller_info.rating.toFixed(1)}
                        {deal.seller_info.reviews && (
                          <span className="text-white/50"> ({deal.seller_info.reviews})</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Title */}
                <h3 className="font-semibold mb-1 line-clamp-1">{deal.title}</h3>
                
                {/* Price and discount */}
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <p className="text-lg font-bold">
                      ${formatPrice(deal.price)}
                    </p>
                    {deal.original_price && (
                      <>
                        <p className="text-xs text-white/50 line-through">
                          ${formatPrice(deal.original_price)}
                        </p>
                        {calculateDiscount(deal.original_price, deal.price) && (
                          <p className="text-xs font-semibold text-green-500">
                            Save {calculateDiscount(deal.original_price, deal.price)}%
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Score */}
                  {deal.latest_score && (
                    <div className="rounded bg-purple/10 px-2 py-1">
                      <div className="flex items-center gap-1">
                        <BarChart2 className="h-3 w-3 text-purple" />
                        <span className={`text-xs font-semibold ${getScoreColor(deal.latest_score)}`}>
                          AI Score: {deal.latest_score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Additional info */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {deal.shipping_info && (
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3 text-purple" />
                      <span className="text-xs text-white/60">
                        {deal.shipping_info.free_shipping ? "Free Shipping" : 
                          deal.shipping_info.cost ? `$${deal.shipping_info.cost} shipping` : "Shipping info unavailable"}
                      </span>
                    </div>
                  )}
                  
                  {deal.shipping_info?.estimated_days && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-purple" />
                      <span className="text-xs text-white/60">
                        {deal.shipping_info.estimated_days} days delivery
                      </span>
                    </div>
                  )}
                  
                  {deal.availability?.in_stock !== undefined && (
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-purple" />
                      <span className="text-xs text-white/60">
                        {deal.availability.in_stock ? 
                          (deal.availability.quantity ? `${deal.availability.quantity} in stock` : "In Stock") : 
                          "Out of Stock"}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/60">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Features tags */}
                {deal.features && deal.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {deal.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/[0.05] px-2 py-0.5 text-xs text-white/70"
                      >
                        {feature}
                      </span>
                    ))}
                    {deal.features.length > 3 && (
                      <span className="text-xs text-white/50">+{deal.features.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentDeals; 