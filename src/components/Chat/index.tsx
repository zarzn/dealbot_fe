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
  ShoppingBag,
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
  recommendations?: string[];
  ai_analysis?: {
    score: number;
    confidence: number;
    price_analysis: {
      discount_percentage?: number;
      is_good_deal?: boolean;
      price_trend?: string;
    };
    market_analysis: {
      competition?: string;
      availability?: string;
    };
    recommendations: string[];
    analysis_date: string;
    expiration_analysis?: string;
  };
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

// Update the normalizeScore function to handle scores properly
function normalizeScore(score: number | undefined): number {
  if (score === undefined || score === null) return 5; // Default to 5 instead of 0
  
  // If score is already in 0-10 range, return it
  if (score >= 0 && score <= 10) return score;
  
  // If score is in 0-1 range (decimal), scale it to 0-10
  if (score >= 0 && score <= 1) return score * 10;
  
  // If score is in 0-100 range, scale it to 0-10
  if (score > 10 && score <= 100) return score / 10;
  
  // Otherwise, clamp to 0-10 range
  return Math.max(0, Math.min(10, score));
}

// Get color based on score value
function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-500';
  if (score >= 6) return 'text-yellow-500';
  if (score >= 4) return 'text-orange-500';
  return 'text-red-500';
}

// Update the CustomDealResponse interface to include the missing fields
interface CustomDealResponse extends Omit<DealResponse, 'ai_analysis'> {
  score?: number;
  features?: string[];
  reviews?: {
    average_rating: number;
    count: number;
  };
  deal_metadata?: {
    rating?: string | number;
    review_count?: string | number;
    specifications?: Record<string, string>;
    brand?: string;
    manufacturer?: string;
    free_shipping?: boolean;
    shipping?: string;
    shipping_cost?: string | number;
    delivery_days?: string | number;
    shipping_provider?: string;
    marketplace?: string;
    source?: string;
    [key: string]: any;
  };
  ai_analysis?: {
    score: number;
    confidence: number;
    price_analysis: {
      discount_percentage?: number;
      is_good_deal?: boolean;
      price_trend?: string;
    };
    market_analysis: {
      competition?: string;
      availability?: string;
    };
    recommendations: string[];
    analysis_date: string;
    expiration_analysis?: string;
  };
}

// Fix the mapResponseToDealSuggestion function to properly extract AI score and format category
function mapResponseToDealSuggestion(deal: CustomDealResponse): DealSuggestion {
  // Debug the data coming from the backend
  console.log('Deal response from API:', JSON.stringify(deal, null, 2));
  
  // Get proper market name - if source is "api", try to get a better name
  let marketName = deal.source;
  if (deal.source === "api" || !deal.source) {
    // Try to get a better market name from deal_metadata if available
    if (deal.deal_metadata?.marketplace) {
      marketName = deal.deal_metadata.marketplace;
    } else if (deal.deal_metadata?.source) {
      marketName = deal.deal_metadata.source;
    } else if (deal.url) {
      // Extract domain from URL as fallback
      try {
        const urlObj = new URL(deal.url);
        marketName = urlObj.hostname.replace('www.', '').split('.')[0];
        // Capitalize first letter
        marketName = marketName.charAt(0).toUpperCase() + marketName.slice(1);
      } catch (e) {
        // Keep the original source if URL parsing fails
      }
    }
  }
  
  // Format category properly - remove "MarketCategory." prefix
  let formattedCategory = deal.category || "Uncategorized";
  if (formattedCategory.includes("MarketCategory.")) {
    formattedCategory = formattedCategory.replace("MarketCategory.", "");
    // Convert to title case
    formattedCategory = formattedCategory.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  
  // Extract proper score from AI analysis or use provided score
  let aiScore: number;
  if (deal.ai_analysis?.score !== undefined) {
    // Use score from AI analysis
    aiScore = typeof deal.ai_analysis.score === 'number' ? 
      deal.ai_analysis.score : 
      parseFloat(String(deal.ai_analysis.score));
  } else if (deal.score !== undefined) {
    // Use score directly if available
    aiScore = typeof deal.score === 'number' ? 
      deal.score : 
      parseFloat(String(deal.score));
  } else if (deal.latest_score !== undefined) {
    // Fallback to latest_score
    aiScore = typeof deal.latest_score === 'number' ?
      deal.latest_score :
      parseFloat(String(deal.latest_score));
  } else {
    // Default score if none provided
    aiScore = 5;
  }
  
  // Normalize the score to ensure it's in the 0-10 range
  const normalizedScore = normalizeScore(aiScore);
  
  // Calculate match score based on available data
  const calculatedMatchScore = (): number => {
    // Start with a base score derived from the AI score
    let baseScore = normalizedScore * 10; // Scale from 0-10 to 0-100
    
    // Adjust for discount if available
    if (deal.original_price && deal.price) {
      const discountPercentage = (typeof deal.original_price === 'number' && typeof deal.price === 'number') ?
        ((deal.original_price - deal.price) / deal.original_price) * 100 :
        ((parseFloat(String(deal.original_price)) - parseFloat(String(deal.price))) / parseFloat(String(deal.original_price))) * 100;
        
      if (discountPercentage > 20) baseScore += 35;
      else if (discountPercentage > 10) baseScore += 20;
      else if (discountPercentage > 5) baseScore += 10;
    }
    
    // Adjust based on AI confidence if available
    if (deal.ai_analysis?.confidence) {
      baseScore += deal.ai_analysis.confidence * 20; // Add up to 20 points for high confidence
    }
    
    // Add randomness to ensure not all scores are the same
    baseScore += Math.random() * 10;
    
    return Math.min(baseScore / 100, 1); // Return as a value between 0 and 1
  };
  
  // Extract ratings correctly
  const averageRating = deal.seller_info?.rating || 
                         (deal.reviews?.average_rating) || 
                         (deal.deal_metadata?.rating ? parseFloat(String(deal.deal_metadata.rating)) : 0);
  
  const reviewCount = deal.seller_info?.reviews || 
                      (deal.reviews?.count) || 
                      (deal.deal_metadata?.review_count ? parseInt(String(deal.deal_metadata.review_count)) : 0);
  
  // Add debug logging for rating extraction
  console.log('Rating extraction debug:', {
    sourceRating: deal.seller_info?.rating,
    reviewsRating: deal.reviews?.average_rating,
    metadataRating: deal.deal_metadata?.rating,
    extractedRating: averageRating,
    reviewCount
  });
  
  // Extract recommendations from AI analysis or use description as fallback
  const recommendations = deal.ai_analysis?.recommendations && 
                          deal.ai_analysis.recommendations.length > 0 ? 
                          deal.ai_analysis.recommendations : 
                          [];
  
  // Log the full deal_metadata to debug
  console.log('Full deal_metadata:', deal.deal_metadata);
  
  // Try to extract description from multiple sources
  let description = "";
  
  // Check direct description field
  if (deal.description && deal.description.trim().length > 0) {
    description = deal.description;
    console.log('Found description in direct field', description.length);
  } 
  // Check description in deal_metadata
  else if (deal.deal_metadata?.description) {
    description = String(deal.deal_metadata.description);
    console.log('Found description in deal_metadata.description', description.length);
  } 
  // Check "about" field in deal_metadata
  else if (deal.deal_metadata?.about) {
    description = String(deal.deal_metadata.about);
    console.log('Found description in deal_metadata.about', description.length);
  }
  // Check product_description field in deal_metadata
  else if (deal.deal_metadata?.product_description) {
    description = String(deal.deal_metadata.product_description);
    console.log('Found description in deal_metadata.product_description', description.length);
  }
  // Try to use features as fallback for description
  else if (deal.features && deal.features.length > 0) {
    description = "Features: " + deal.features.join(", ");
    console.log('Created description from features', description.length);
  }
  // Last resort - use features from deal_metadata
  else if (deal.deal_metadata?.features && Array.isArray(deal.deal_metadata.features) && deal.deal_metadata.features.length > 0) {
    description = "Features: " + deal.deal_metadata.features.join(", ");
    console.log('Created description from deal_metadata.features', description.length);
  }
  else {
    description = `Product details for ${deal.title}. Check the listing for more information.`;
    console.log('Using generic description fallback');
  }
  
  // Better description handling - consider description valid if it has actual content
  const hasRealDescription = Boolean(
    description && 
    description.length > 20 && 
    !description.startsWith("Product details for") &&
    !description.startsWith("No description available")
  );
  
  // Log description status
  console.log('Description status:', {
    descriptionLength: description.length,
    hasRealDescription, // Will now be true or false
    startsWithGeneric: description.startsWith("Product details for"),
    descriptionContent: description.substring(0, 50)
  });
  
  return {
    id: deal.id,
    title: deal.title,
    description: description,
    price: typeof deal.price === 'number' ? deal.price : parseFloat(deal.price as any),
    original_price: deal.original_price ? (typeof deal.original_price === 'number' ? deal.original_price : parseFloat(deal.original_price as any)) : 0,
    source: marketName || deal.source || "Unknown",
    category: formattedCategory,
    image_url: deal.image_url || "",
    score: normalizedScore,
    expires_at: deal.expires_at || new Date(Date.now() + 86400000 * 7).toISOString(),
    url: deal.url,
    is_tracked: deal.is_tracked || false,
    reviews: {
      average_rating: averageRating,
      count: reviewCount
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
    features: deal.features || [],
    seller_info: {
      name: deal.seller_info?.name || "Unknown Seller",
      rating: averageRating, // Use same rating for consistency
      condition: deal.seller_info?.condition || "New",
      warranty: deal.seller_info?.warranty || ""
    },
    match_score: calculatedMatchScore(),
    relevance_explanation: deal.description ? 
      deal.description.slice(0, 100) + (deal.description.length > 100 ? '...' : '') : 
      deal.ai_analysis?.price_analysis?.is_good_deal ? 
        "This appears to be a good deal based on our analysis." : 
        "Consider comparing with other options before deciding.",
    recommendations: recommendations,
    ai_analysis: deal.ai_analysis // Include the full AI analysis
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
  const pageSize = 10;
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  // Initialize search query from URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setInput(queryParam);
      setLastSearchQuery(queryParam);
    }
  }, []);

  // Update URL when search is performed
  useEffect(() => {
    if (lastSearchQuery) {
      const url = new URL(window.location.href);
      url.searchParams.set('query', lastSearchQuery);
      window.history.replaceState({}, '', url.toString());
    }
  }, [lastSearchQuery]);

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

    setIsProcessing(true);
    
    // Create a new request
    const requestId = `req_${Date.now()}`;
    const newRequest: DealRequest = {
      id: requestId,
      query: input,
      constraints: {
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        brands: filters.brands.length > 0 ? filters.brands : undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        deadline: filters.deadline || undefined,
      },
      status: "processing",
      timestamp: new Date(),
      metadata: { scrapingAttempted: false, usedRealTimeScraping: false },
    };

    // Add request to history
    setRequests((prev) => [newRequest, ...prev]);
    
    try {
      // Reset aiAnalysis to clear previous state
      setAiAnalysis({});
      
      // Prepare search parameters
      const searchParams: DealSearch = {
        query: input,
        sort_by: "relevance",
        sort_order: "desc",
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        category: filters.categories.length > 0 ? filters.categories[0] : undefined,
        limit: 10,
        offset: 0,
        use_realtime_scraping: false
      };
      
      // Clear existing suggestions before fetching new ones
      setSuggestions([]);
      
      // Perform the search
      console.log("Searching with params:", searchParams);
      const response = await dealsService.searchDeals(searchParams);
      console.log("Search response:", response);
      
      // Check if we got any results from the initial search
      if (!response.deals || response.deals.length === 0) {
        // No deals found initially, check if we need to perform real-time scraping
        console.log("No deals found in database, attempting real-time scraping...");
        
        // Update request to indicate we're attempting real-time scraping
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? {
              ...req,
              status: "processing",
              metadata: { ...req.metadata, scrapingAttempted: true }
            } : req
          )
        );
        
        // Show a toast notification indicating we're searching in real-time
        toast.loading("No deals found in our database. Searching the web in real-time...", {
          id: "scraping-toast"
        });
        
        // Perform a real-time scraping search with the scrape=true parameter
        const scrapingParams = {
          ...searchParams,
          scrape: true,
          real_time: true,
          use_realtime_scraping: true,
          perform_ai_analysis: true  // Explicitly request AI analysis for real-time searches
        };
        
        try {
          // Call the API with scraping enabled
          const scrapingResponse = await dealsService.searchDeals(scrapingParams);
          
          // Check if we found any deals through scraping
          if (scrapingResponse.deals && scrapingResponse.deals.length > 0) {
            console.log("Found deals through real-time scraping:", scrapingResponse.deals);
            toast.success(`Found ${scrapingResponse.deals.length} deals through real-time search!`, {
              id: "scraping-toast"
            });
            
            // Transform the scraped deals
            const mappedDeals = scrapingResponse.deals.map((deal: any) => {
              // Store AI analysis in state for each deal
              if (deal.id && deal.ai_analysis) {
                setAiAnalysis(prev => ({
                  ...prev,
                  [deal.id]: deal.ai_analysis
                }));
              }
              
              return mapResponseToDealSuggestion(deal);
            });
            
            // Update request status to indicate successful scraping
            setRequests((prev) =>
              prev.map((req) =>
                req.id === requestId ? {
                  ...req,
                  status: "completed",
                  tokensUsed: mappedDeals.length * 2, // More tokens for real-time search
                  metadata: { ...req.metadata, usedRealTimeScraping: true }
                } : req
              )
            );
            
            setSuggestions(mappedDeals);
            
            // Scroll to results
            if (mappedDeals.length > 0) {
              scrollToResults();
            }
          } else {
            // No deals found even after scraping
            console.log("No deals found even after real-time scraping");
            toast.error("No deals found matching your criteria, even after real-time search.", {
              id: "scraping-toast"
            });
            
            // Update request status
            setRequests((prev) =>
              prev.map((req) =>
                req.id === requestId ? {
                  ...req,
                  status: "completed",
                  tokensUsed: 5,
                  metadata: { ...req.metadata, scrapingAttempted: true, usedRealTimeScraping: false }
                } : req
              )
            );
          }
        } catch (scrapingError: any) {
          // Handle scraping-specific errors
          console.error("Error during real-time scraping:", scrapingError);
          toast.error(`Error during real-time search: ${scrapingError.message || "Failed to search the web"}`, {
            id: "scraping-toast"
          });
          
          // Update request status
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId ? {
                ...req,
                status: "error",
                metadata: { ...req.metadata, scrapingAttempted: true, scrapingError: scrapingError.message }
              } : req
            )
          );
        }
      } else if (response && response.deals && Array.isArray(response.deals)) {
        // We found deals in the initial database search
        // Transform the deals to our DealSuggestion format
        const mappedDeals = response.deals.map((deal: any) => {
          // Store AI analysis in state for each deal
          if (deal.id && deal.ai_analysis) {
            setAiAnalysis(prev => ({
              ...prev,
              [deal.id]: deal.ai_analysis
            }));
          }
          
          return mapResponseToDealSuggestion(deal);
        });
        
        console.log("Transformed deals:", mappedDeals);
        
        // Update request status
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: "completed", tokensUsed: mappedDeals.length }
              : req
          )
        );
        
        setSuggestions(mappedDeals);
        
        // Scroll to results if we found any
        if (mappedDeals.length > 0) {
          scrollToResults();
        } else {
          toast("No deals found matching your criteria");
        }
      } else {
        // Handle empty or invalid response
        console.warn("Received invalid response format:", response);
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: "error" }
              : req
          )
        );
        toast.error("Failed to get deals - invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching deals:", error);
      // Update request status on error
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "error" } : req
        )
      );
      toast.error(`Error: ${error.message || "Failed to fetch deals"}`);
    } finally {
      setIsProcessing(false);
      setInput("");
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
              .then(analysis => {
                console.log(`AI Analysis for deal ${deal.id}:`, analysis);
                return [deal.id, analysis] as [string, AIAnalysis];
              })
              .catch((error) => {
                console.error(`Error getting analysis for deal ${deal.id}:`, error);
                return [deal.id, {
                  deal_id: deal.id,
                  score: 0,
                  confidence: 0,
                  price_analysis: { price_trend: 'unknown', is_good_deal: false },
                  market_analysis: { availability: 'unknown' },
                  recommendations: ['Analysis not available'],
                  analysis_date: new Date().toISOString()
                }] as [string, AIAnalysis];
              })
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
    const token = localStorage.getItem('access_token');
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
      const token = localStorage.getItem('access_token');
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

  // Fix the renderAIAnalysis function to avoid linter errors
  const renderAIAnalysis = (deal: DealSuggestion) => {
    // Skip if no relevant data at all
    if (!deal.ai_analysis && !deal.recommendations?.length && !deal.description) {
      return null;
    }
    
    // Use recommendations from AI analysis or deal directly
    const recommendationsList = deal.recommendations || [];
    
    // Better description handling - consider description valid if it has actual content
    const description = deal.description || "";
    const hasRealDescription = Boolean(
      description && 
      description.length > 20 && 
      !description.startsWith("Product details for") &&
      !description.startsWith("No description available")
    );
    
    // Log description status
    console.log('Description status:', {
      descriptionLength: description.length,
      hasRealDescription, // Will now be true or false
      startsWithGeneric: description.startsWith("Product details for"),
      descriptionContent: description.substring(0, 50)
    });
    
    // Don't show empty analysis
    if (recommendationsList.length === 0 && !hasRealDescription) {
      return null;
    }

    return (
      <div className="mt-4 bg-blue-900/10 rounded-lg p-3 border border-blue-900/20">
        {/* Always show the product description when available and meaningful */}
        {hasRealDescription && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium text-blue-500">
                Product Description
              </h4>
            </div>
            <p className="text-sm text-dark-3">
              {description.length > 300 
                ? `${description.substring(0, 300)}...` 
                : description}
            </p>
          </div>
        )}
        
        {/* Show AI recommendations with distinctive icons for each type */}
        {recommendationsList.length > 0 && (
          <div className={hasRealDescription ? "mt-3 pt-3 border-t border-blue-900/10" : ""}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium text-blue-500">
                AI Recommendations
              </h4>
            </div>
            
            {/* Display buy/not buy recommendation (first in the list) */}
            {recommendationsList.length > 0 && (
              <div className="mb-2 flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-full bg-blue-100">
                  <ShoppingBag className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-dark-3">{recommendationsList[0]}</p>
              </div>
            )}
            
            {/* Display general recommendation (second in the list) */}
            {recommendationsList.length > 1 && (
              <div className="flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-full bg-blue-100">
                  <Target className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-dark-3">{recommendationsList[1]}</p>
              </div>
            )}
            
            {/* Display additional recommendations if any (though we should have exactly 2) */}
            {recommendationsList.slice(2).map((rec: string, index: number) => (
              <div key={index} className="mt-2 flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-full bg-blue-100">
                  <Clock className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-dark-3">{rec}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Show price analysis if available */}
        {deal.ai_analysis?.price_analysis && (
          <div className="mt-2 text-xs text-blue-500 pt-2 border-t border-blue-900/10">
            {deal.ai_analysis.price_analysis.is_good_deal ? 
              "✓ This appears to be a good deal based on our analysis." : 
              deal.ai_analysis.price_analysis.price_trend === "decreasing" ?
                "💡 Price trend is decreasing, you might get a better deal if you wait." :
                "💡 Consider comparing with similar products before deciding."
            }
          </div>
        )}
      </div>
    );
  };

  // Update the getDeals function to ensure data is properly refreshed
  const getDeals = async () => {
    setIsProcessing(true);

    try {
      // Reset aiAnalysis to clear previous state
      setAiAnalysis({});
      
      // Log the current query for debugging
      console.log("Searching for deals with query:", input);
      
      // Prepare search parameters
      const searchParams: DealSearch = {
        query: input,
        sort_by: "relevance",
        sort_order: "desc",
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        category: filters.categories.length > 0 ? filters.categories[0] : undefined,
        limit: 10,
        offset: 0
      };
      
      // Clear existing suggestions before fetching new ones
      setSuggestions([]);
      
      // Ensure authentication token is used
      const token = localStorage.getItem('access_token');
      console.log('Using authentication token:', token ? 'Present' : 'Not found');
      
      // Perform the search
      const response = await dealsService.searchDeals(searchParams);
      console.log("Received response from API:", response);
      
      if (response && response.deals && Array.isArray(response.deals)) {
        // Transform the deals to our DealSuggestion format
        const mappedDeals = response.deals.map((deal: any) => {
          // Force-refresh analysis for each deal
          if (deal.id && deal.ai_analysis) {
            setAiAnalysis(prev => ({
              ...prev,
              [deal.id]: deal.ai_analysis
            }));
          }
          
          return mapResponseToDealSuggestion(deal);
        });
        
        console.log("Transformed deals:", mappedDeals);
        setSuggestions(mappedDeals);
        
        // Scroll to results if we found any
        if (mappedDeals.length > 0) {
          scrollToResults();
        }
      } else {
        // Handle empty or invalid response
        console.warn("Received invalid response format:", response);
        toast.error("Failed to get deals - invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching deals:", error);
      toast.error(`Error: ${error.message || "Failed to fetch deals"}`);
    } finally {
      setIsProcessing(false);
    }
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
                    {/* Deal Image with improved positioning and fallback */}
                    <div className="relative flex-shrink-0 h-56 w-full md:w-56 md:h-auto overflow-hidden bg-dark-6 flex items-center justify-center">
                      {suggestion.image_url ? (
                        <img
                          src={suggestion.image_url}
                          alt={suggestion.title}
                          className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Set fallback image on error
                            e.currentTarget.src = '/placeholder-deal.jpg';
                            e.currentTarget.onerror = null; // Prevent infinite loop
                          }}
                        />
                      ) : (
                        // Fallback placeholder image
                        <div className="flex items-center justify-center h-full w-full">
                          <Package className="h-12 w-12 text-dark-3" />
                        </div>
                      )}
                    </div>
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
                            {suggestion.reviews && suggestion.reviews.average_rating > 0 
                              ? `${suggestion.reviews.average_rating.toFixed(1)} (${suggestion.reviews.count || 0} reviews)`
                              : "No reviews yet"}
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
                          {suggestion.original_price > suggestion.price && (
                            <>
                              <p className="text-sm text-dark-3 line-through">
                                ${suggestion.original_price.toFixed(2)}
                              </p>
                              <p className="text-xs font-semibold text-green-500">
                                Save {Math.round(((suggestion.original_price - suggestion.price) / suggestion.original_price) * 100)}%
                              </p>
                            </>
                          )}
                        </div>
                        
                        {/* AI Score - make it more prominent */}
                        {(suggestion.score !== undefined || suggestion.ai_analysis?.score !== undefined) && (
                          <div className="rounded bg-purple/10 px-2 py-1">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 text-purple" />
                              <span className={`text-sm font-semibold ${getScoreColor(suggestion.score || 0)}`}>
                                AI Score: {suggestion.score.toFixed(1)}/10
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Match Score - calculate if not already provided */}
                        {suggestion.match_score !== undefined && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-white">
                              Match: {Math.round(suggestion.match_score * 100)}%
                            </span>
                          </div>
                        )}
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