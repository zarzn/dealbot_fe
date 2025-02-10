"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bot,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  Target,
  DollarSign,
  Calendar,
  Tag,
  Star,
  BarChart3,
  Clock,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Truck,
  Shield,
  Package,
  ThumbsUp,
  ArrowUpDown,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { dealsService } from '@/services/deals';
import { goalsService } from '@/services/goals';
import type { AIAnalysis } from '@/services/deals';

interface DealRequest {
  id: string;
  query: string;
  constraints: {
    maxPrice?: number;
    minPrice?: number;
    brands?: string[];
    categories?: string[];
    deadline?: string;
  };
  status: "processing" | "completed" | "error";
  timestamp: Date;
  tokensUsed?: number;
}

interface DealSuggestion {
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
  matchScore: number;
  relevanceExplanation: string;
  category: string;
  condition: string;
  shippingInfo: {
    price: number;
    estimatedDays: number;
    freeShipping: boolean;
  };
  warranty?: string;
  reviews: {
    count: number;
    averageRating: number;
  };
  features: string[];
  inStock: boolean;
  stockCount?: number;
  isTracked?: boolean;
}

// Dummy data for demonstration
const dummyDeals: DealSuggestion[] = [
  {
    id: "1",
    title: "Apple MacBook Pro M2 (2023)",
    price: 1299.99,
    originalPrice: 1499.99,
    source: "Amazon",
    score: 0.92,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3",
    status: "active",
    marketId: "1",
    sellerRating: 4.8,
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    matchScore: 0.95,
    relevanceExplanation: "Matches your budget and preferred brand. High seller rating and significant discount.",
    category: "Laptops",
    condition: "New",
    shippingInfo: {
      price: 0,
      estimatedDays: 2,
      freeShipping: true,
    },
    warranty: "1 Year Apple Warranty",
    reviews: {
      count: 1250,
      averageRating: 4.8,
    },
    features: [
      "M2 Pro Chip",
      "16GB RAM",
      "512GB SSD",
      "14-inch Liquid Retina XDR Display",
    ],
    inStock: true,
    stockCount: 45,
  },
  {
    id: "2",
    title: "Dell XPS 13 Plus",
    price: 1199.99,
    originalPrice: 1399.99,
    source: "Best Buy",
    score: 0.88,
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3",
    status: "active",
    marketId: "3",
    sellerRating: 4.6,
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    matchScore: 0.89,
    relevanceExplanation: "Alternative option within your budget. Similar specifications with good reviews.",
    category: "Laptops",
    condition: "New",
    shippingInfo: {
      price: 0,
      estimatedDays: 2,
      freeShipping: true,
    },
    warranty: "1 Year Dell Warranty",
    reviews: {
      count: 1000,
      averageRating: 4.5,
    },
    features: [
      "13.4-inch FHD+ InfinityEdge Display",
      "Intel 12th Gen Core i5-1240P",
      "16GB RAM",
      "512GB SSD",
    ],
    inStock: true,
    stockCount: 30,
  },
];

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "expiry";

interface PriceAdjustmentModalProps {
  deal: DealSuggestion;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetPrice: number, notifyThreshold: number) => void;
}

function PriceAdjustmentModal({ deal, isOpen, onClose, onConfirm }: PriceAdjustmentModalProps) {
  const [targetPrice, setTargetPrice] = useState(deal.price);
  const [notifyThreshold, setNotifyThreshold] = useState(deal.price * 0.9); // Default 10% below current

  const handleConfirm = () => {
    onConfirm(targetPrice, notifyThreshold);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-dark-7 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Customize Deal Tracking</h3>
          <button onClick={onClose} className="text-dark-3 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-dark-3">Target Price</label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full rounded-lg bg-dark-8 px-3 py-2 text-white"
              min={0}
              step={0.01}
            />
            <p className="mt-1 text-xs text-dark-3">
              Current price: ${deal.price.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-dark-3">Notify me when price drops below</label>
            <input
              type="number"
              value={notifyThreshold}
              onChange={(e) => setNotifyThreshold(Number(e.target.value))}
              className="w-full rounded-lg bg-dark-8 px-3 py-2 text-white"
              min={0}
              step={0.01}
            />
            <p className="mt-1 text-xs text-dark-3">
              Recommended: ${(deal.price * 0.9).toFixed(2)} (10% below current price)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-dark-6 px-4 py-2 text-white hover:bg-dark-5"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-purple px-4 py-2 text-white hover:bg-purple/90"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DealFinder() {
  const [requests, setRequests] = useState<DealRequest[]>([]);
  const [suggestions, setSuggestions] = useState<DealSuggestion[]>([]);
  const [input, setInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: "",
    minPrice: "",
    brands: [] as string[],
    categories: [] as string[],
    deadline: "",
    condition: [] as string[],
    freeShippingOnly: false,
    inStockOnly: false,
    minRating: 0,
    maxShippingDays: "",
    hasWarranty: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTokens, setRemainingTokens] = useState(1000);
  const resultsStartRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [trackedDeals, setTrackedDeals] = useState<Set<string>>(new Set());
  const [selectedDeal, setSelectedDeal] = useState<DealSuggestion | null>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIAnalysis>>({});

  const scrollToResults = () => {
    if (resultsStartRef.current) {
      const yOffset = -20; // Add some offset from the top
      const y = resultsStartRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (suggestions.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToResults, 100);
    }
  }, [suggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const requestId = Date.now().toString();
    const newRequest: DealRequest = {
      id: requestId,
      query: input.trim(),
      constraints: {
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        brands: filters.brands.length > 0 ? filters.brands : undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        deadline: filters.deadline || undefined,
      },
      status: "processing",
      timestamp: new Date(),
    };

    setRequests(prev => [...prev, newRequest]);
    setInput("");
    setIsProcessing(true);
    setError(null);

    try {
      // Real API call
      const searchResults = await dealsService.searchDeals({
        query: newRequest.query,
        constraints: {
          ...newRequest.constraints,
          condition: filters.condition,
          freeShippingOnly: filters.freeShippingOnly,
          inStockOnly: filters.inStockOnly,
          minRating: filters.minRating || undefined,
          maxShippingDays: filters.maxShippingDays ? parseInt(filters.maxShippingDays) : undefined,
          hasWarranty: filters.hasWarranty,
        },
      });
      
      // Get AI analysis for each deal
      const analysisPromises = searchResults.map(deal => 
        dealsService.getAIAnalysis(deal.id)
          .then(analysis => [deal.id, analysis] as [string, AIAnalysis])
      );
      
      const analysisResults = await Promise.all(analysisPromises);
      const newAnalysis = Object.fromEntries(analysisResults);
      
      setAiAnalysis(prev => ({ ...prev, ...newAnalysis }));
      
      // Update request status
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: "completed", tokensUsed: 50 }
            : req
        )
      );
      
      setSuggestions(searchResults);
    } catch (err) {
      console.error("Failed to process request:", err);
      setError("Failed to process your request. Please try again.");
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: "error" } : req
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const sortDeals = (deals: DealSuggestion[]) => {
    return [...deals].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating":
          return b.reviews.averageRating - a.reviews.averageRating;
        case "expiry":
          return new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime();
        default:
          return b.matchScore - a.matchScore;
      }
    });
  };

  const handleTrackDeal = (deal: DealSuggestion) => {
    setSelectedDeal(deal);
    setIsPriceModalOpen(true);
  };

  const handlePriceConfirm = async (targetPrice: number, notifyThreshold: number) => {
    if (!selectedDeal) return;

    try {
      const goal = {
        title: selectedDeal.title,
        itemCategory: selectedDeal.category,
        currentPrice: selectedDeal.price,
        targetPrice: targetPrice,
        priceHistory: [{
          price: selectedDeal.price,
          date: new Date().toISOString()
        }],
        source: selectedDeal.source,
        url: selectedDeal.url,
        imageUrl: selectedDeal.imageUrl,
        constraints: {
          maxPrice: targetPrice,
          condition: selectedDeal.condition,
          shippingInfo: selectedDeal.shippingInfo,
          features: selectedDeal.features
        },
        notifications: {
          email: true,
          inApp: true,
          priceThreshold: notifyThreshold
        },
        status: 'active' as const,
        createdFrom: {
          type: 'search' as const,
          searchQuery: input,
          dealId: selectedDeal.id
        }
      };

      // Real API call
      await goalsService.createGoal(goal);
      
      setTrackedDeals(prev => new Set(Array.from(prev).concat(selectedDeal.id)));
      toast.success("Deal tracking started! We'll notify you about price changes.");
    } catch (error) {
      console.error("Failed to create goal:", error);
      toast.error("Failed to track deal. Please try again later.");
    }
  };

  // Add AI analysis display to deal card
  const renderAIAnalysis = (deal: DealSuggestion) => {
    const analysis = aiAnalysis[deal.id];
    if (!analysis) return null;

    return (
      <div className="mt-4 border-t border-dark-6 pt-4">
        <h4 className="mb-2 text-sm font-semibold text-white">AI Analysis</h4>
        
        {/* Price Analysis */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${
              analysis.priceAnalysis.isGoodDeal ? 'text-green-500' : 'text-yellow-500'
            }`} />
            <span className="text-sm font-medium text-white">
              Price Analysis
            </span>
          </div>
          <p className="mt-1 text-sm text-dark-3">
            {analysis.priceAnalysis.reasoning}
          </p>
        </div>

        {/* Buying Advice */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-purple" />
            <span className="text-sm font-medium text-white">
              Buying Advice
            </span>
          </div>
          <p className="mt-1 text-sm text-dark-3">
            {analysis.buyingAdvice.recommendation}
          </p>
          <p className="mt-1 text-sm text-dark-3">
            Best time to buy: {analysis.buyingAdvice.timing}
          </p>
        </div>

        {/* Price Trend */}
        {analysis.priceAnalysis.priceProjection.trend !== 'stable' && (
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpDown className={`h-4 w-4 ${
              analysis.priceAnalysis.priceProjection.trend === 'falling'
                ? 'text-green-500'
                : 'text-red-500'
            }`} />
            <span className="text-dark-3">
              Price is {analysis.priceAnalysis.priceProjection.trend}
              {analysis.priceAnalysis.priceProjection.nextWeekEstimate && 
                ` (Est. next week: $${analysis.priceAnalysis.priceProjection.nextWeekEstimate.toFixed(2)})`
              }
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="relative z-10 overflow-hidden py-20 lg:py-25">
      <div className="container">
        <div className="wow fadeInUp mx-auto max-w-[900px] rounded-2xl bg-gradient-to-b from-dark-6 to-dark-8 p-7.5 shadow-2xl transition-all duration-300 hover:shadow-purple/5 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Find Your Perfect Deal
              </h2>
              <p className="mt-2 text-sm text-dark-3">
                Describe what you&apos;re looking for and let AI find the best deals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-dark-7 px-4 py-2">
                <span className="text-sm text-dark-3">Tokens: </span>
                <span className="font-medium text-purple">
                  {remainingTokens}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., &apos;Find me a high-performance laptop under $1500 with good battery life&apos;"
                  className="w-full rounded-xl bg-dark-8 px-5 py-4 pl-12 text-white placeholder-dark-3 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isProcessing}
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-3" />
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-dark-3 transition-colors hover:text-purple"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden rounded-xl bg-dark-7 p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm text-dark-3">
                          Price Range
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) =>
                              setFilters(prev => ({
                                ...prev,
                                minPrice: e.target.value
                              }))
                            }
                            className="w-full rounded-lg bg-dark-8 px-3 py-2 text-white placeholder-dark-3"
                          />
                          <span className="text-dark-3">-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) =>
                              setFilters(prev => ({
                                ...prev,
                                maxPrice: e.target.value
                              }))
                            }
                            className="w-full rounded-lg bg-dark-8 px-3 py-2 text-white placeholder-dark-3"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-dark-3">
                          Condition
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["New", "Refurbished", "Used"].map(condition => (
                            <button
                              key={condition}
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({
                                  ...prev,
                                  condition: prev.condition.includes(condition)
                                    ? prev.condition.filter(c => c !== condition)
                                    : [...prev.condition, condition]
                                }))
                              }}
                              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                                filters.condition.includes(condition)
                                  ? "bg-purple text-white"
                                  : "bg-dark-8 text-dark-3 hover:bg-dark-6"
                              }`}
                            >
                              {condition}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-dark-3">
                          Shipping
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.freeShippingOnly}
                              onChange={(e) =>
                                setFilters(prev => ({
                                  ...prev,
                                  freeShippingOnly: e.target.checked
                                }))
                              }
                              className="rounded border-dark-3 bg-dark-8 text-purple"
                            />
                            <span className="text-sm text-dark-3">Free Shipping Only</span>
                          </label>
                          <div>
                            <input
                              type="number"
                              placeholder="Max Shipping Days"
                              value={filters.maxShippingDays}
                              onChange={(e) =>
                                setFilters(prev => ({
                                  ...prev,
                                  maxShippingDays: e.target.value
                                }))
                              }
                              className="w-full rounded-lg bg-dark-8 px-3 py-2 text-white placeholder-dark-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-dark-3">
                          Availability
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.inStockOnly}
                              onChange={(e) =>
                                setFilters(prev => ({
                                  ...prev,
                                  inStockOnly: e.target.checked
                                }))
                              }
                              className="rounded border-dark-3 bg-dark-8 text-purple"
                            />
                            <span className="text-sm text-dark-3">In Stock Only</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.hasWarranty}
                              onChange={(e) =>
                                setFilters(prev => ({
                                  ...prev,
                                  hasWarranty: e.target.checked
                                }))
                              }
                              className="rounded border-dark-3 bg-dark-8 text-purple"
                            />
                            <span className="text-sm text-dark-3">Has Warranty</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-dark-3">
                          Minimum Rating
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.5"
                          value={filters.minRating}
                          onChange={(e) =>
                            setFilters(prev => ({
                              ...prev,
                              minRating: parseFloat(e.target.value)
                            }))
                          }
                          className="w-full"
                        />
                        <div className="mt-1 text-sm text-dark-3">
                          {filters.minRating} stars and up
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-dark-3">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={filters.deadline}
                          onChange={(e) =>
                            setFilters(prev => ({
                              ...prev,
                              deadline: e.target.value
                            }))
                          }
                          className="w-full rounded-lg bg-dark-8 px-3 py-2 text-white placeholder-dark-3"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple to-pink px-6 py-4 text-white transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Finding Deals...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Find Deals
                </>
              )}
            </button>
          </form>

          {/* Add sorting options before results */}
          {suggestions.length > 0 && (
            <div ref={resultsStartRef} className="mb-4 mt-8 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Found {suggestions.length} deals
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-3">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg bg-dark-8 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple"
                >
                  <option value="relevance">Best Match</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="expiry">Expiring Soon</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="mt-8">
            <AnimatePresence mode="popLayout">
              {sortDeals(suggestions).map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  className="mb-4 overflow-hidden rounded-xl bg-dark-7 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row">
                    {suggestion.imageUrl && (
                      <div className="aspect-video w-full md:w-48">
                        <img
                          src={suggestion.imageUrl}
                          alt={suggestion.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-dark-3">
                            {suggestion.source}
                          </span>
                          <span className="text-sm text-dark-3">•</span>
                          <span className="text-sm text-dark-3">
                            {suggestion.category}
                          </span>
                          <span className="text-sm text-dark-3">•</span>
                          <span className="text-sm text-dark-3">
                            {suggestion.condition}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-white">
                            {suggestion.reviews.averageRating} ({suggestion.reviews.count} reviews)
                          </span>
                        </div>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {suggestion.title}
                      </h3>
                      <div className="mb-2 flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            ${suggestion.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-dark-3 line-through">
                            ${suggestion.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple" />
                          <span className="text-sm text-white">
                            Match: {Math.round(suggestion.matchScore * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-2 flex flex-wrap gap-2">
                        {suggestion.features.map((feature, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-dark-6 px-3 py-1 text-xs text-dark-3"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <p className="mb-4 text-sm text-dark-3">
                        {suggestion.relevanceExplanation}
                      </p>

                      {/* Additional Info */}
                      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple" />
                          <span className="text-sm text-dark-3">
                            {suggestion.inStock ? (
                              suggestion.stockCount
                                ? `${suggestion.stockCount} in stock`
                                : "In Stock"
                            ) : "Out of Stock"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple" />
                          <span className="text-sm text-dark-3">
                            {suggestion.shippingInfo.freeShipping
                              ? "Free Shipping"
                              : `$${suggestion.shippingInfo.price.toFixed(2)} shipping`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple" />
                          <span className="text-sm text-dark-3">
                            {suggestion.shippingInfo.estimatedDays} days delivery
                          </span>
                        </div>
                        {suggestion.warranty && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple" />
                            <span className="text-sm text-dark-3">
                              {suggestion.warranty}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-dark-3">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires: {new Date(suggestion.expiresAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={suggestion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple to-pink px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                        >
                          View Deal
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          {/* ... existing price and rating elements ... */}
                        </div>
                        <button
                          onClick={() => handleTrackDeal(suggestion)}
                          disabled={trackedDeals.has(suggestion.id)}
                          className={`
                            flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300
                            ${trackedDeals.has(suggestion.id)
                              ? 'bg-purple/20 text-purple border border-purple cursor-not-allowed'
                              : 'bg-purple hover:bg-purple/90 text-white border border-transparent'
                            }
                          `}
                        >
                          {trackedDeals.has(suggestion.id) ? (
                            <>
                              <Target className="w-4 h-4 mr-2" />
                              Tracking
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4 mr-2" />
                              Track This Deal
                            </>
                          )}
                        </button>
                      </div>

                      {renderAIAnalysis(suggestion)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDeal && (
        <PriceAdjustmentModal
          deal={selectedDeal}
          isOpen={isPriceModalOpen}
          onClose={() => {
            setIsPriceModalOpen(false);
            setSelectedDeal(null);
          }}
          onConfirm={handlePriceConfirm}
        />
      )}
    </section>
  );
} 