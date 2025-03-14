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
import { dealsService } from "@/services/api/deals";
import { DealResponse } from "@/types/deals";
import { toast } from "sonner";

// Interface for the component's internal use
interface Deal {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  source: string;
  score: number;
  url: string;
  imageUrl?: string;
  expiresAt?: string;
  status: string;
  marketId: string;
  sellerRating?: number;
  priceHistory?: Array<{ date: string; price: number }>;
}

export default function Markets() {
  // Add client-side detection to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [markets, setMarkets] = useState<MarketWithStats[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        
        // Fetch active markets
        const marketsResponse = await marketService.getActiveMarkets();
        const marketsWithStats = marketService.transformMarketsForUI(marketsResponse);
        setMarkets(marketsWithStats);
        
        // Fetch latest deals (limited to 6)
        const dealsResponse = await dealsService.getDeals({}, 1, 6);
        
        // Transform deals to match our UI format
        const transformedDeals = dealsResponse.map(deal => ({
          id: deal.id,
          title: deal.title,
          price: deal.price,
          originalPrice: deal.original_price || deal.price * 1.2, // Fallback if no original price
          source: deal.source || 'Unknown',
          score: deal.latest_score ? deal.latest_score / 100 : 0.8, // Convert to 0-1 range
          url: deal.url || '#',
          imageUrl: deal.image_url,
          expiresAt: deal.expires_at,
          status: deal.status || 'active',
          marketId: deal.market_id || '',
          sellerRating: deal.seller_info?.rating || 4.5,
        }));
        
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
    return Math.round(((original - current) / original) * 100);
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
                        {market.stats.successRate}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-dark-7 p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-dark-3">Response</span>
                      </div>
                      <p className="mt-2 text-lg font-medium text-white">
                        {market.stats.avgResponseTime}ms
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
                      !selectedMarket || deal.marketId === selectedMarket
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
                            ${deal.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-dark-3 line-through mt-1">
                            ${deal.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded-full bg-blue-500/10 px-4 py-2 text-blue-500">
                          {calculateDiscount(deal.originalPrice, deal.price)}% OFF
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
                            Score: {Math.round(deal.score * 100)}
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