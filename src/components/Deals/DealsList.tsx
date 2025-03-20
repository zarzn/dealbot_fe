import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DealCard } from './DealCard';
import { DealFiltersState } from './DealFilters';
import { dealsService } from '@/services/deals';
import type { DealResponse, DealSearch, Deal as BaseDeal } from '@/types/deals';
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  Calendar, 
  DollarSign,
  Tag,
  Package,
  Star,
  Truck,
  Clock,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
type FilterOption = 'all' | 'verified' | 'featured' | 'tracked';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';
type CategoryOption = 'all' | 'electronics' | 'clothing' | 'home' | 'sports' | 'beauty' | 'toys' | 'books' | 'services' | 'other';

interface DealsListProps {
  initialDeals?: DealResponse[];
  initialFilters?: DealFiltersState;
  showCreateButton?: boolean;
  gridColumns?: { base: number; md: number; lg: number; xl: number };
  maxWidth?: string;
  onDealSelect?: (dealId: string) => void;
  onCreateDeal?: () => void;
  selectedDealId?: string | null;
  isLoading?: boolean;
}

// Extended Deal interface with additional properties needed for our cards
interface Deal extends BaseDeal {
  is_favorite?: boolean;
  score?: number;
  features?: string[];
  ai_analysis?: any;
  market_id?: string;
  goal_id?: string;
  user_id?: string;
}

export const DealsList: React.FC<DealsListProps> = ({
  initialDeals = [],
  initialFilters = {},
  showCreateButton = false,
  gridColumns = { base: 1, md: 2, lg: 3, xl: 3 },
  maxWidth = '100%',
  onDealSelect,
  onCreateDeal,
  selectedDealId,
  isLoading: externalLoading = false,
}) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [deals, setDeals] = useState<DealResponse[]>(initialDeals);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryOption>('all');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(!initialDeals.length);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Check if mobile
  useEffect(() => {
    if (!isMounted) return;
    
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isMounted]);

  // Convert filters to API search query
  const createSearchQuery = useCallback((): DealSearch => {
    // Map price range to actual values
    let minPrice, maxPrice;
    if (priceRange === 'under-50') {
      maxPrice = 50;
    } else if (priceRange === '50-100') {
      minPrice = 50;
      maxPrice = 100;
    } else if (priceRange === '100-500') {
      minPrice = 100;
      maxPrice = 500;
    } else if (priceRange === 'over-500') {
      minPrice = 500;
    }

    // Map feature flags
    const featured = filterStatus === 'featured' ? true : undefined;
    const verified = filterStatus === 'verified' ? true : undefined;
    
    return {
      query: searchQuery,
      page: page,
      page_size: 12,
      sort_by: sortBy === 'newest' ? 'created_at' : 
               sortBy === 'oldest' ? 'created_at' :
               sortBy === 'price-low' ? 'price' :
               sortBy === 'price-high' ? 'price' :
               sortBy === 'title' ? 'title' : 'created_at',
      sort_order: sortBy === 'oldest' || sortBy === 'price-low' ? 'asc' : 'desc',
      filters: {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        price_min: minPrice,
        price_max: maxPrice,
        featured,
        verified,
      }
    };
  }, [searchQuery, page, sortBy, filterCategory, filterStatus, priceRange]);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery !== pendingSearchQuery) {
      setSearchQuery(pendingSearchQuery);
      setPage(1); // Reset to first page when search changes
    }
  };

  // Handle Enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery !== pendingSearchQuery) {
        setSearchQuery(pendingSearchQuery);
        setPage(1);
      }
    }
  };

  // Load deals based on current filters
  const loadDeals = useCallback(async () => {
    if (!isMounted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const searchQuery = createSearchQuery();
      const response = await dealsService.searchDeals(searchQuery);
      
      if (page > 1) {
        setDeals(prev => [...prev, ...response.deals]);
      } else {
        setDeals(response.deals);
      }
      
      // Check if there are more deals to load
      setHasMore(
        response.total ? response.deals.length + (page - 1) * 12 < response.total : 
        response.deals.length === 12
      );
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again later.');
      setDeals([]);
    } finally {
      setIsLoading(false);
    }
  }, [createSearchQuery, isMounted, page]);

  // Initial load and when filters change
  useEffect(() => {
    if (!isMounted) return;
    
    // Reset page when filters change
    if (page !== 1) {
      setPage(1);
    } else {
      loadDeals();
    }
  }, [searchQuery, filterCategory, filterStatus, priceRange, sortBy, isMounted, loadDeals]);

  // When page changes
  useEffect(() => {
    if (!isMounted) return;
    loadDeals();
  }, [page, isMounted, loadDeals]);

  // Load more deals
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && isMounted) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore, isMounted]);

  // Handle deal selection
  const handleDealClick = useCallback((dealId: string) => {
    if (!isMounted) return;
    
    if (onDealSelect) {
      onDealSelect(dealId);
    } else {
      router.push(`/dashboard/deals/${dealId}`);
    }
  }, [isMounted, onDealSelect, router]);

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    if (!isMounted) return;
    
    if (onCreateDeal) {
      onCreateDeal();
    } else {
      router.push('/dashboard/goals/create');
    }
  }, [isMounted, onCreateDeal, router]);

  // Function to convert DealResponse to the improved card format
  const adaptDealToDealCard = (dealResponse: DealResponse): Deal => {
    // Try to extract features from tags
    const extractedFeatures = extractFeaturesFromTags(dealResponse.tags || []);
    
    // Create a safe shipping info object
    const safeShippingInfo = dealResponse.shipping_info ? {
      cost: dealResponse.shipping_info.cost !== undefined ? dealResponse.shipping_info.cost : 0,
      free_shipping: dealResponse.shipping_info.free_shipping || false,
      estimated_days: dealResponse.shipping_info.estimated_days
    } : undefined;
    
    return {
      id: dealResponse.id,
      title: dealResponse.title,
      description: dealResponse.description || '',
      status: dealResponse.status || 'unknown',
      price: typeof dealResponse.price === 'number' ? dealResponse.price : parseFloat(dealResponse.price || '0'),
      original_price: dealResponse.original_price || undefined,
      image_url: dealResponse.image_url || '',
      category: dealResponse.category || 'Uncategorized',
      created_at: dealResponse.created_at || new Date().toISOString(),
      updated_at: dealResponse.updated_at || new Date().toISOString(),
      expires_at: dealResponse.expires_at || undefined,
      is_tracked: dealResponse.is_tracked || false,
      is_favorite: false, // Default value since property may not exist
      featured: dealResponse.featured || false,
      verified: dealResponse.verified || false,
      seller_info: dealResponse.seller_info || undefined,
      shipping_info: safeShippingInfo,
      ai_analysis: dealResponse.ai_analysis || undefined,
      tags: dealResponse.tags || [],
      url: dealResponse.url || `#`,
      source: dealResponse.source || 'Unknown',
      score: dealResponse.latest_score || (dealResponse.ai_analysis ? dealResponse.ai_analysis.score : undefined),
      features: extractedFeatures,
      // Add required properties from BaseDeal
      market_id: dealResponse.market_id,
      goal_id: dealResponse.goal_id,
      user_id: dealResponse.user_id
    };
  };

  // Extract features from tags
  const extractFeaturesFromTags = (tags: string[]): string[] => {
    if (!tags || tags.length === 0) return [];
    return tags.slice(0, 5); // Limit to 5 features
  };

  // Helper function to get score color
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  // Helper function to format price
  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Helper function to calculate discount percentage
  const calculateDiscount = (original: number | string | null | undefined, current: number | string) => {
    if (!original) return null;
    const originalNum = typeof original === 'string' ? parseFloat(original) : original;
    const currentNum = typeof current === 'string' ? parseFloat(current) : current;
    
    if (!originalNum || originalNum <= currentNum) return null;
    return Math.round(((originalNum - currentNum) / originalNum) * 100);
  };

  // If not mounted yet (during SSR), return null or a loading placeholder
  if (!isMounted) {
    return (
      <div className="space-y-6" style={{ maxWidth }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Deals</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-12 bg-white/[0.05] rounded w-full mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white/[0.05] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter deals based on search query and filters
  const filteredDeals = deals.filter(deal => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = deal.title.toLowerCase().includes(query);
      const matchesDescription = deal.description?.toLowerCase().includes(query) || false;
      const matchesCategory = deal.category?.toLowerCase().includes(query) || false;
      
      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false;
      }
    }

    // Category filter
    if (filterCategory !== 'all' && deal.category !== filterCategory) {
      return false;
    }

    // Status filter
    if (filterStatus === 'verified' && !deal.verified) {
      return false;
    }
    if (filterStatus === 'featured' && !deal.featured) {
      return false;
    }
    if (filterStatus === 'tracked' && !deal.is_tracked) {
      return false;
    }

    // Price range filter
    if (priceRange !== 'all') {
      const price = deal.price || 0;
      if (priceRange === 'under-50' && price >= 50) return false;
      if (priceRange === '50-100' && (price < 50 || price >= 100)) return false;
      if (priceRange === '100-500' && (price < 100 || price >= 500)) return false;
      if (priceRange === 'over-500' && price < 500) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6" style={{ maxWidth }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Deals</h2>
          <p className="text-sm text-white/60">Discovered based on your goals</p>
        </div>
        {showCreateButton && (
          <Button 
            onClick={handleCreateClick}
            size="sm"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-500/80 transition"
            disabled={isLoading || externalLoading}
          >
            <Plus className="w-5 h-5" />
            Create Goal for Deals
          </Button>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search deals..."
              value={pendingSearchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
            />
          </div>
          <Button 
            type="submit" 
            variant="secondary" 
            className="px-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader size="sm" className="mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Search
          </Button>
        </form>
        
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {[
              { value: 'all', label: 'All Deals' },
              { value: 'verified', label: 'Verified Deals' },
              { value: 'featured', label: 'Featured Deals' },
              { value: 'tracked', label: 'Tracked Deals' },
            ].map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setFilterStatus(value as FilterOption)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {filterStatus === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Category</DropdownMenuLabel>
            {[
              { value: 'all', label: 'All Categories' },
              { value: 'electronics', label: 'Electronics' },
              { value: 'clothing', label: 'Clothing' },
              { value: 'home', label: 'Home & Garden' },
              { value: 'sports', label: 'Sports & Outdoors' },
              { value: 'beauty', label: 'Beauty & Health' },
              { value: 'toys', label: 'Toys & Games' },
              { value: 'books', label: 'Books & Media' },
              { value: 'services', label: 'Services' },
              { value: 'other', label: 'Other' },
            ].map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setFilterCategory(value as CategoryOption)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {filterCategory === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Price Range</DropdownMenuLabel>
            {[
              { value: 'all', label: 'All Prices' },
              { value: 'under-50', label: 'Under $50' },
              { value: '50-100', label: '$50 - $100' },
              { value: '100-500', label: '$100 - $500' },
              { value: 'over-500', label: 'Over $500' },
            ].map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setPriceRange(value as PriceRange)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {priceRange === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Sort</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'title', label: 'Title' },
            ].map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setSortBy(value as SortOption)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {sortBy === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Deals Grid */}
      {isLoading || externalLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-4 text-red-500">{error}</div>
      ) : filteredDeals.length === 0 ? (
        <div className="bg-white/[0.05] border border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold mb-2">No matching deals</h3>
          <p className="text-white/70 mb-6 max-w-md">
            {searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || priceRange !== 'all'
              ? "Try adjusting your filters or search query to see more results."
              : "We couldn't find any deals. Deals are created based on your goals."}
          </p>
          {showCreateButton && (
            <Button onClick={handleCreateClick} className="px-4 py-2">
              <Plus className="mr-2 h-4 w-4" />
              Create New Goal for Deals
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {filteredDeals.map((dealResponse) => {
            const deal = adaptDealToDealCard(dealResponse);
            
            return (
              <div 
                key={deal.id} 
                onClick={() => handleDealClick(deal.id)} 
                className="cursor-pointer bg-white/[0.05] border border-white/10 rounded-xl hover:bg-white/[0.1] transition overflow-hidden flex flex-col"
              >
                {/* Image header */}
                <div className="relative w-full h-40 bg-white/[0.02] flex items-center justify-center overflow-hidden">
                  {deal.image_url ? (
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Set fallback image to our SVG placeholder
                        e.currentTarget.src = '/placeholder-deal.svg';
                      }}
                    />
                  ) : (
                    <Package className="h-16 w-16 text-white/20" />
                  )}
                  
                  {/* Status badges - top right */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {deal.verified && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 backdrop-blur-sm">
                        Verified
                      </span>
                    )}
                    {deal.featured && (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 backdrop-blur-sm">
                        Featured
                      </span>
                    )}
                    {deal.status && deal.status !== 'unknown' && (
                      <span className={`px-2 py-1 rounded-full text-xs backdrop-blur-sm ${
                        deal.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 
                        deal.status === 'expired' ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Content section */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Header with source/category and rating */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        {deal.source || 'Unknown'}
                      </span>
                      <span className="text-xs text-white/50">•</span>
                      <span className="text-xs text-white/50">
                        {deal.category || 'Uncategorized'}
                      </span>
                    </div>
                    
                    {deal.seller_info && typeof deal.seller_info.rating === 'number' && (
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
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{deal.title}</h3>
                  
                  {/* Price section */}
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-xl font-bold">
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
                    
                    {/* AI Score */}
                    {deal.score && (
                      <div className="rounded bg-purple/10 px-2 py-1">
                        <div className="flex items-center gap-1">
                          <BarChart2 className="h-4 w-4 text-purple" />
                          <span className={`text-xs font-semibold ${getScoreColor(deal.score)}`}>
                            AI Score: {typeof deal.score === 'number' ? deal.score.toFixed(1) : deal.score}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Description - short version */}
                  <p className="text-sm text-white/70 mb-3 line-clamp-2">
                    {deal.description}
                  </p>
                  
                  {/* Features */}
                  {deal.features && deal.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
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
                  
                  {/* Additional info row */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    {deal.shipping_info && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-purple" />
                        <span className="text-xs text-white/60">
                          {deal.shipping_info.free_shipping ? "Free Shipping" : 
                            deal.shipping_info.cost ? `$${deal.shipping_info.cost} shipping` : "Shipping info unavailable"}
                        </span>
                      </div>
                    )}
                    
                    {deal.created_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-white/50" />
                        <span className="text-xs text-white/60">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Load More Button */}
      {!isLoading && !error && hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={handleLoadMore} 
            disabled={isLoading}
            className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition"
          >
            {isLoading ? <Loader size="sm" /> : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default DealsList; 