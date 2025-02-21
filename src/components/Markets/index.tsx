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

interface Market {
  id: string;
  name: string;
  status: string;
  successRate: number;
  avgResponseTime: number;
  totalDeals: number;
}

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

// Dummy data for markets
const dummyMarkets: Market[] = [
  {
    id: "1",
    name: "Amazon",
    status: "active",
    successRate: 98,
    avgResponseTime: 150,
    totalDeals: 1250,
  },
  {
    id: "2",
    name: "Walmart",
    status: "active",
    successRate: 95,
    avgResponseTime: 180,
    totalDeals: 850,
  },
  {
    id: "3",
    name: "Best Buy",
    status: "active",
    successRate: 92,
    avgResponseTime: 200,
    totalDeals: 620,
  },
];

// Dummy data for deals
const dummyDeals: Deal[] = [
  {
    id: "1",
    title: "Apple MacBook Pro M2 (2023)",
    price: 1299.99,
    originalPrice: 1499.99,
    source: "Amazon",
    score: 0.92,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
    status: "active",
    marketId: "1",
    sellerRating: 4.8,
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
  },
  {
    id: "2",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    source: "Best Buy",
    score: 0.88,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    status: "active",
    marketId: "3",
    sellerRating: 4.6,
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
  },
  {
    id: "3",
    title: "Samsung 65\" QLED 4K Smart TV",
    price: 899.99,
    originalPrice: 1299.99,
    source: "Walmart",
    score: 0.95,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    status: "active",
    marketId: "2",
    sellerRating: 4.7,
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
  },
  {
    id: "4",
    title: "PlayStation 5 Console Bundle",
    price: 449.99,
    originalPrice: 549.99,
    source: "Amazon",
    score: 0.89,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
    status: "active",
    marketId: "1",
    sellerRating: 4.9,
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
  },
  {
    id: "5",
    title: "iPad Air (5th Generation)",
    price: 549.99,
    originalPrice: 649.99,
    source: "Best Buy",
    score: 0.87,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1163&q=80",
    status: "active",
    marketId: "3",
    sellerRating: 4.5,
    expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
  },
  {
    id: "6",
    title: "Dyson V15 Detect Vacuum",
    price: 649.99,
    originalPrice: 749.99,
    source: "Walmart",
    score: 0.91,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    status: "active",
    marketId: "2",
    sellerRating: 4.7,
    expiresAt: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
  },
];

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with dummy data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMarkets(dummyMarkets);
        setDeals(dummyDeals);
      } catch (err) {
        setError("Failed to load markets and deals");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

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
                        {market.successRate}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-dark-7 p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-dark-3">Response</span>
                      </div>
                      <p className="mt-2 text-lg font-medium text-white">
                        {market.avgResponseTime}ms
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
                        href={deal.url}
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
          </div>
        </div>
      </div>
    </section>
  );
} 