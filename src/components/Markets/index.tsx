"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Star,
  DollarSign,
  BarChart3,
  Clock,
  Store,
  Tag,
} from "lucide-react";
import { marketService, MarketWithStats } from "@/services/markets";
import { dealsService } from "@/services/deals";
import { DealResponse } from "@/types/deals";
import { toast } from "sonner";

// Interface for the component's internal use
interface Deal {
  id: string;
  title: string;
  price: number | string;
  originalPrice: number | string;
  source: string;
  score?: number;
  url: string;
  imageUrl?: string;
  expiresAt?: string;
  status: string;
  marketId: string;
  sellerRating?: number;
  priceHistory?: Array<{ date: string; price: number | string }>;
}

export default function Markets() {
  // Add client-side detection to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [markets, setMarkets] = useState<MarketWithStats[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch data on client-side
    if (!isMounted) return;

    // Fetch real data from APIs
    const fetchData = async () => {
      try {
        setLoading(true);
        setMarketsLoading(true);
        
        // Fetch active markets
        const marketsResponse = await marketService.getActiveMarkets();
        const marketsWithStats = marketService.transformMarketsForUI(marketsResponse);
        setMarkets(marketsWithStats);
        setMarketsLoading(false);
        
        // Fetch latest deals (limited to 6)
        const dealsResponse = await dealsService.getDeals({}, 1, 6);
        
        console.log('Deals response:', dealsResponse);
        
        // Handle different response formats
        let dealsArray: any[] = [];
        if (Array.isArray(dealsResponse)) {
          dealsArray = dealsResponse;
        } else if (dealsResponse && typeof dealsResponse === 'object') {
          // Handle {deals: [...]} format
          const responseObj = dealsResponse as Record<string, any>;
          if (responseObj.deals && Array.isArray(responseObj.deals)) {
            dealsArray = responseObj.deals;
          } else if (responseObj.data && Array.isArray(responseObj.data)) {
            dealsArray = responseObj.data;
          } else if (responseObj.data && typeof responseObj.data === 'object' && responseObj.data.deals && Array.isArray(responseObj.data.deals)) {
            dealsArray = responseObj.data.deals;
          }
        }
        
        console.log('Deals array extracted:', dealsArray);
        
        // Transform deals to match our UI format
        const transformedDeals = dealsArray.map(deal => {
          try {
            console.log('Processing deal:', deal); // Add debug logging
            
            // Handle price safely
            const price = typeof deal.price === 'number' ? 
              deal.price : 
              (deal.price ? parseFloat(String(deal.price)) : 0);
            
            // Handle original price safely
            const originalPrice = deal.original_price ? 
              (typeof deal.original_price === 'number' ? 
                deal.original_price : 
                parseFloat(String(deal.original_price))) 
              : (price * 1.2); // Fallback
            
            // Handle score safely (normalize to 0-1 range)
            let score = 0.8; // Default
            if (deal.score !== undefined && deal.score !== null) {
              score = typeof deal.score === 'number' ? 
                Math.min(deal.score / 100, 1) : 
                Math.min(parseFloat(String(deal.score)) / 100, 1);
            } else if (deal.latest_score !== undefined && deal.latest_score !== null) {
              // For backward compatibility
              score = typeof deal.latest_score === 'number' ? 
                Math.min(deal.latest_score / 100, 1) : 
                Math.min(parseFloat(String(deal.latest_score)) / 100, 1);
            }
            
            // Extract vendor from metadata if available
            let vendor = deal.source || 'Unknown';
            if (deal.deal_metadata && typeof deal.deal_metadata === 'object' && deal.deal_metadata.vendor) {
              vendor = deal.deal_metadata.vendor;
            }
            
            // Extract seller rating safely
            let sellerRating = 4.5; // Default
            if (deal.seller_info && typeof deal.seller_info === 'object' && deal.seller_info.rating) {
              sellerRating = typeof deal.seller_info.rating === 'number' ? 
                deal.seller_info.rating : 
                parseFloat(String(deal.seller_info.rating));
            }
            
            return {
              id: deal.id,
              title: deal.title,
              price: price,
              originalPrice: originalPrice,
              source: vendor,
              score: score,
              url: deal.url || '#',
              imageUrl: deal.image_url,
              expiresAt: deal.expires_at,
              status: deal.status || 'active',
              marketId: deal.market_id || '',
              sellerRating: sellerRating,
            };
          } catch (err) {
            console.error(`Error transforming deal ${deal.id}:`, err);
            // Return a safe default object
            return {
              id: deal.id || 'unknown',
              title: deal.title || 'Unknown Deal',
              price: 0,
              originalPrice: 0,
              source: 'Unknown',
              score: 0.5,
              url: '#',
              status: 'active',
              marketId: '',
              sellerRating: 0
            };
          }
        });
        
        setDeals(transformedDeals);
      } catch (err) {
        setError("Failed to load markets and deals");
        console.error("Error fetching data:", err);
        toast.error("Failed to load markets and deals");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isMounted]); // Add isMounted as a dependency

  const calculateDiscount = (original: number, current: number) => {
    try {
      // Make sure both values are valid numbers
      if (!original || !current || isNaN(original) || isNaN(current) || original <= 0 || current <= 0) {
        return 0;
      }
      
      // Make sure original is greater than current
      if (original <= current) {
        return 0;
      }
      
      return Math.round(((original - current) / original) * 100);
    } catch (error) {
      console.error('Error calculating discount:', error);
      return 0;
    }
  };

  // Helper function to safely format price values
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '0.00';
    
    try {
      const numPrice = typeof price === 'number' ? price : parseFloat(String(price));
      return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0.00';
    }
  };

  // Show a loading spinner until client-side rendering is ready
  if (!isMounted) {
    return (
      <section className="relative z-10 overflow-hidden py-20 lg:py-25">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-purple"></div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative z-10 overflow-hidden py-20 lg:py-25">
      <div className="container">
        <div className="wow fadeInUp mx-auto max-w-[1170px]">
          {/* Markets Overview */}
          <div className="mb-10">
            <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
              Active Markets
            </h2>
            
            {marketsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-purple"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
                {markets.map((market) => (
                  <motion.div
                    key={market.id}
                    whileHover={{ scale: 1.02 }}
                    className={`cursor-pointer rounded-xl bg-gradient-to-br ${
                      selectedMarket === market.id
                        ? "from-blue-500/20 to-blue-400/20 ring-2 ring-blue-500"
                        : "from-dark-6 to-dark-8"
                    } p-7.5 transition-all duration-300 hover:shadow-lg`}
                    onClick={() => setSelectedMarket(market.id === selectedMarket ? null : market.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">
                        {market.name}
                      </h3>
                      <Store
                        className={`h-6 w-6 ${
                          market.status === "active" ? "text-green-500" : "text-red-500"
                        }`}
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-6">
                      <div className="rounded-lg bg-dark-7 p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-dark-3">Success Rate</span>
                        </div>
                        <p className="mt-2 text-lg font-medium text-white">
                          {typeof market.stats.successRate === 'number' 
                            ? parseFloat(Math.min(100, Math.max(0, market.stats.successRate)).toFixed(2))
                            : 0}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-dark-7 p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-dark-3">Response</span>
                        </div>
                        <p className="mt-2 text-lg font-medium text-white">
                          {typeof market.stats.avgResponseTime === 'number'
                            ? parseFloat(market.stats.avgResponseTime.toFixed(2))
                            : 0}ms
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Deals Section */}
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Latest Deals
              </h2>
              <div className="flex items-center gap-4">
                <select
                  className="rounded-lg bg-dark-7 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  onChange={(e) => setSelectedMarket(e.target.value || null)}
                  value={selectedMarket || ""}
                >
                  <option value="">All Markets</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
                </select>
                <a
                  href={isMounted ? "/dashboard/deals" : "#"}
                  className="flex items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.05] px-5 py-3 text-white transition-all duration-300 hover:bg-white hover:text-black"
                >
                  <span>View All Deals</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7.5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {deals
                  .filter(
                    (deal) =>
                      !selectedMarket || deal.marketId === selectedMarket || !deal.marketId
                  )
                  .map((deal) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                      className="group rounded-xl bg-dark-6 p-7.5 transition-all duration-300 hover:shadow-lg"
                    >
                      {deal.imageUrl && (
                        <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                          <img
                            src={deal.imageUrl}
                            alt={deal.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-dark-3">
                            {deal.source}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          {deal.title}
                        </h3>
                      </div>

                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            ${formatPrice(deal.price)}
                          </p>
                          <p className="text-sm text-dark-3 line-through mt-1">
                            ${formatPrice(deal.originalPrice)}
                          </p>
                        </div>
                        <div className="rounded-full bg-blue-500/10 px-4 py-2 text-blue-500">
                          {calculateDiscount(
                            typeof deal.originalPrice === 'number' ? deal.originalPrice : parseFloat(String(deal.originalPrice) || "0"), 
                            typeof deal.price === 'number' ? deal.price : parseFloat(String(deal.price) || "0")
                          )}% OFF
                        </div>
                      </div>

                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-white">
                            {deal.sellerRating}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-white">
                            Score: {deal.score ? Math.round(deal.score * 100) : "N/A"}
                          </span>
                        </div>
                      </div>

                      {deal.expiresAt && (
                        <div className="mb-6 flex items-center gap-2 text-sm text-dark-3">
                          <Clock className="h-4 w-4" />
                          <span>Expires: {new Date(deal.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      <a
                        href={isMounted ? deal.url : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                      >
                        View Deal
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-purple"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && deals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Deals Found</h3>
                <p className="text-gray-400 max-w-md">
                  We couldn&apos;t find any deals at the moment. Please check back later or try another market.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 