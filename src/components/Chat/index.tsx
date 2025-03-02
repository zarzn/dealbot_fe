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
  BarChart2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { dealsService, SearchResponse } from '@/services/deals';
import { goalsService } from '@/services/goals';
import type { AIAnalysis, DealSearch, DealResponse } from '@/types/deals';

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
  metadata?: { scrapingAttempted?: boolean; usedRealTimeScraping?: boolean };
}

interface DealSuggestion {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number;
  source: string;
  category: string;
  image_url: string;
  score: number;
  expires_at: string;
  url: string;
  is_tracked: boolean;
  reviews: {
    average_rating: number;
    count: number;
  };
  shipping_info: {
    free_shipping: boolean;
    estimated_days: number;
    price?: number;
  };
  availability: {
    in_stock: boolean;
    quantity?: number;
  };
  features: string[];
  seller_info: {
    name: string;
    rating: number;
    condition?: string;
    warranty?: string;
  };
  match_score?: number;
  relevance_explanation?: string;
}

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
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-500/90"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

// Convert backend DealResponse to frontend DealSuggestion format
function mapResponseToDealSuggestion(deal: DealResponse): DealSuggestion {
  return {
    id: deal.id,
    title: deal.title,
    description: deal.description || "",
    price: typeof deal.price === 'number' ? deal.price : parseFloat(deal.price as any),
    original_price: deal.original_price ? (typeof deal.original_price === 'number' ? deal.original_price : parseFloat(deal.original_price as any)) : 0,
    source: deal.source || "",
    category: deal.category || "Uncategorized",
    image_url: deal.image_url || "",
    score: deal.ai_analysis?.score || deal.latest_score || 0.5,
    expires_at: deal.expires_at || new Date(Date.now() + 86400000 * 7).toISOString(),
    url: deal.url,
    is_tracked: deal.is_tracked || false,
    reviews: {
      average_rating: deal.seller_info?.rating || 0,
      count: deal.seller_info?.reviews || 0
    },
    shipping_info: {
      free_shipping: deal.shipping_info?.free_shipping || false,
      estimated_days: deal.shipping_info?.estimated_days || 3,
      price: deal.shipping_info?.cost || 0
    },
    availability: {
      in_stock: deal.availability?.in_stock || true,
      quantity: deal.availability?.quantity
    },
    features: deal.seller_info?.features || [],
    seller_info: {
      name: deal.seller_info?.name || "Unknown Seller",
      rating: deal.seller_info?.rating || 0,
      condition: deal.seller_info?.condition || "New",
      warranty: deal.seller_info?.warranty
    },
    match_score: deal.ai_analysis?.score || 0.5,
    relevance_explanation: deal.ai_analysis?.recommendations?.[0] || "Relevant deal based on your search"
  };
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
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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
    setCurrentPage(1); // Reset to first page on new search

    try {
      // Prepare search parameters
      const searchParams: DealSearch = {
        query: newRequest.query,
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        category: filters.categories.length > 0 ? filters.categories[0] : undefined,
        sort_by: sortBy === "relevance" ? "relevance" : 
                 sortBy === "price_asc" || sortBy === "price_desc" ? "price" : 
                 sortBy === "rating" ? "rating" : "expiry",
        sort_order: sortBy === "price_asc" ? "asc" : "desc",
        limit: pageSize,
        offset: 0
      };
      
      // Call the API
      const searchResults = await dealsService.searchDeals(searchParams);
      
      // Check if we got any results
      if (!searchResults.deals || searchResults.deals.length === 0) {
        // Check if the response contains metadata about scraping attempt
        const scrapingAttempted = searchResults.metadata?.scraping_attempted;
        
        if (scrapingAttempted) {
          setError("No deals found even after real-time search. Try different search terms or filters.");
        } else {
          setError("No deals found matching your criteria. Try adjusting your search or filters.");
        }
        
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId ? { 
              ...req, 
              status: "completed", 
              tokensUsed: 10,
              metadata: { scrapingAttempted }
            } : req
          )
        );
        setIsProcessing(false);
        return;
      }
      
      // Update total results count
      setTotalResults(searchResults.total || searchResults.deals.length);
      
      // Get AI analysis for each deal
      try {
        const analysisPromises = searchResults.deals.map(deal => 
          dealsService.getAIAnalysis(deal.id)
            .then(analysis => [deal.id, analysis] as [string, AIAnalysis])
            .catch(() => [deal.id, {
              deal_id: deal.id,
              score: 0,
              confidence: 0,
              price_analysis: { price_trend: 'unknown', is_good_deal: false },
              market_analysis: { availability: 'unknown' },
              recommendations: ['Analysis not available'],
              analysis_date: new Date().toISOString()
            }] as [string, AIAnalysis])
        );
        
        const analysisResults = await Promise.all(analysisPromises);
        const newAnalysis = Object.fromEntries(analysisResults);
        
        setAiAnalysis(prev => ({ ...prev, ...newAnalysis }));
      } catch (analysisError) {
        console.error("Error fetching AI analysis:", analysisError);
        // Continue with the search results even if analysis fails
      }
      
      // Check if deals were found through real-time scraping
      const wasScraped = searchResults.metadata?.scraping_attempted === true;
      
      if (wasScraped && searchResults.deals.length > 0) {
        // Update the request to indicate real-time scraping was used
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId ? { 
              ...req, 
              status: "completed", 
              tokensUsed: 20,
              metadata: { ...req.metadata, usedRealTimeScraping: true }
            } : req
          )
        );
      } else {
        // Update request status (only if not already updated by wasScraped condition)
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status: "completed", tokensUsed: 50 }
              : req
          )
        );
      }
      
      // Map API response to component state
      const mappedDeals = searchResults.deals.map(mapResponseToDealSuggestion);
      setSuggestions(mappedDeals);
      
    } catch (err) {
      console.error("Failed to process request:", err);
      
      // Provide more specific error messages
      if (err.response?.status === 401) {
        setError("Authentication required. Please sign in to search for deals.");
      } else if (err.response?.status === 402) {
        setError("Insufficient tokens. Please add more tokens to your account.");
      } else if (err.response?.status === 429) {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to process your request. Please try again.");
      }
      
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: "error" } : req
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a function to load more results or change page
  const handleLoadMore = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const nextPage = currentPage + 1;
    
    try {
      const searchParams: DealSearch = {
        query: requests[requests.length - 1]?.query || "",
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        category: filters.categories.length > 0 ? filters.categories[0] : undefined,
        sort_by: sortBy === "relevance" ? "relevance" : 
                 sortBy === "price_asc" || sortBy === "price_desc" ? "price" : 
                 sortBy === "rating" ? "rating" : "expiry",
        sort_order: sortBy === "price_asc" ? "asc" : "desc",
        limit: pageSize,
        offset: (nextPage - 1) * pageSize
      };
      
      const searchResults = await dealsService.searchDeals(searchParams);
      
      if (searchResults.deals && searchResults.deals.length > 0) {
        // Get AI analysis for each new deal
        try {
          const analysisPromises = searchResults.deals.map(deal => 
            dealsService.getAIAnalysis(deal.id)
              .then(analysis => [deal.id, analysis] as [string, AIAnalysis])
              .catch(() => [deal.id, {
                deal_id: deal.id,
                score: 0,
                confidence: 0,
                price_analysis: { price_trend: 'unknown', is_good_deal: false },
                market_analysis: { availability: 'unknown' },
                recommendations: ['Analysis not available'],
                analysis_date: new Date().toISOString()
              }] as [string, AIAnalysis])
          );
          
          const analysisResults = await Promise.all(analysisPromises);
          const newAnalysis = Object.fromEntries(analysisResults);
          
          setAiAnalysis(prev => ({ ...prev, ...newAnalysis }));
        } catch (analysisError) {
          console.error("Error fetching AI analysis:", analysisError);
        }
        
        // Map and append new deals
        const mappedDeals = searchResults.deals.map(mapResponseToDealSuggestion);
        setSuggestions(prev => [...prev, ...mappedDeals]);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error("Failed to load more results:", err);
      toast.error("Failed to load more results. Please try again.");
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
          return b.reviews.average_rating - a.reviews.average_rating;
        case "expiry":
          return new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime();
        default:
          return b.match_score - a.match_score;
      }
    });
  };

  const handleTrackDeal = async (deal: DealSuggestion) => {
    // Check if user is logged in before showing the modal
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to track deals");
      return;
    }
    
    setSelectedDeal(deal);
    setIsPriceModalOpen(true);
  };

  const handlePriceConfirm = async (targetPrice: number, notifyThreshold: number) => {
    if (!selectedDeal) return;

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please log in to track deals");
        return;
      }
      
      // First track the deal
      await dealsService.trackDeal(selectedDeal.id);
      
      // Then create a goal for price tracking
      const goal = {
        title: `Track price for: ${selectedDeal.title}`,
        item_category: selectedDeal.category,
        marketplaces: [selectedDeal.source],
        constraints: {
          max_price: targetPrice,
          min_price: 0,
          brands: [selectedDeal.seller_info.name],
          conditions: [selectedDeal.seller_info.condition || "New"],
          features: selectedDeal.features
        },
        notifications: {
          email: true,
          in_app: true,
          price_threshold: notifyThreshold
        },
        priority: "medium" as const,
        deadline: undefined,
        max_matches: 10,
        max_tokens: 1000
      };

      // Create the goal
      await goalsService.createGoal(goal);
      
      setTrackedDeals(prev => new Set(Array.from(prev).concat(selectedDeal.id)));
      toast.success("Deal tracking started! We'll notify you about price changes.");
    } catch (error) {
      console.error("Failed to track deal:", error);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        toast.error("Please log in to track deals");
      } else if (error.response?.status === 402) {
        toast.error("Insufficient tokens. Please add more tokens to your account.");
      } else {
        toast.error("Failed to track deal. Please try again later.");
      }
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
              analysis.score > 0.7 ? 'text-green-500' : 'text-yellow-500'
            }`} />
            <span className="text-sm font-medium text-white">
              Price Analysis
            </span>
          </div>
          <p className="mt-1 text-sm text-dark-3">
            Price trend: {analysis.price_analysis?.price_trend || 'unknown'}
          </p>
          {analysis.price_analysis?.discount_percentage && (
            <p className="mt-1 text-sm text-dark-3">
              Discount: {analysis.price_analysis.discount_percentage.toFixed(1)}%
            </p>
          )}
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
            {analysis.recommendations && analysis.recommendations.length > 0 
              ? analysis.recommendations[0] 
              : "No specific recommendations available."}
          </p>
          <p className="mt-1 text-sm text-dark-3">
            Confidence: {Math.round(analysis.confidence * 100)}%
          </p>
        </div>

        {/* Market Analysis */}
        {analysis.market_analysis && Object.keys(analysis.market_analysis).length > 0 && (
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                Market Analysis
              </span>
            </div>
            {analysis.market_analysis.competition && (
              <p className="mt-1 text-sm text-dark-3">
                Competition: {analysis.market_analysis.competition}
              </p>
            )}
            {analysis.market_analysis.availability && (
              <p className="mt-1 text-sm text-dark-3">
                Availability: {analysis.market_analysis.availability}
              </p>
            )}
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
                    <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 text-white transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                    {suggestion.image_url && (
                      <div className="aspect-video w-full md:w-48">
                        <img
                          src={suggestion.image_url}
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
                            {suggestion.seller_info?.condition || "New"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-white">
                            {suggestion.reviews.average_rating} ({suggestion.reviews.count} reviews)
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
                            ${suggestion.original_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple" />
                          <span className="text-sm text-white">
                            Match: {Math.round(suggestion.match_score * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-2 flex flex-wrap gap-2">
                        {suggestion.features.map((feature: string, index: number) => (
                          <span
                            key={index}
                            className="rounded-full bg-dark-6 px-3 py-1 text-xs text-dark-3"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <p className="mb-4 text-sm text-dark-3">
                        {suggestion.relevance_explanation}
                      </p>

                      {/* Additional Info */}
                      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple" />
                          <span className="text-sm text-dark-3">
                            {suggestion.availability.in_stock ? (
                              suggestion.availability.quantity
                                ? `${suggestion.availability.quantity} in stock`
                                : "In Stock"
                            ) : "Out of Stock"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple" />
                          <span className="text-sm text-dark-3">
                            {suggestion.shipping_info.free_shipping
                              ? "Free Shipping"
                              : `$${suggestion.shipping_info?.price?.toFixed(2) || '0.00'} shipping`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple" />
                          <span className="text-sm text-dark-3">
                            {suggestion.shipping_info.estimated_days} days delivery
                          </span>
                        </div>
                        {suggestion.seller_info?.warranty && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple" />
                            <span className="text-sm text-dark-3">
                              {suggestion.seller_info?.warranty}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-dark-3">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires: {new Date(suggestion.expires_at!).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={suggestion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
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
                              ? 'bg-blue-500/20 text-blue-500 border border-blue-500 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-500/90 text-white border border-transparent'
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
              <div className="mt-8 rounded-xl bg-red-500/10 p-4 text-center">
                <p>{error}</p>
                {requests.length > 0 && requests[requests.length - 1].metadata?.scrapingAttempted && (
                  <p className="mt-2 text-sm text-dark-3">
                    We searched marketplaces in real-time but couldn&apos;t find any matching deals.
                  </p>
                )}
              </div>
            )}

            {/* Add real-time scraping notification */}
            {requests.length > 0 && 
             requests[requests.length - 1].metadata?.usedRealTimeScraping && (
              <div className="mt-4 rounded-xl bg-blue-500/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-blue-400 font-medium">Real-time Deal Search</span>
                </div>
                <p className="text-sm text-dark-3">
                  No deals were found in our database, so we searched marketplaces in real-time to find the best matches for you.
                  These deals have been saved for future searches.
                </p>
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

      {/* Add pagination/load more button if there are more results */}
      {suggestions.length > 0 && suggestions.length < totalResults && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-lg bg-dark-6 px-6 py-3 text-white transition-all hover:bg-dark-5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Load More Results
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
} 