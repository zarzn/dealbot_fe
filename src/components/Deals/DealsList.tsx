import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DealCard } from './DealCard';
import { DealFiltersState } from './DealFilters';
import { dealsService } from '@/services/deals';
import type { DealResponse, DealSearch, Deal } from '@/types/deals';
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  Calendar, 
  DollarSign,
  Tag 
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
      router.push(`/deals/${dealId}`);
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

  // Get price range from deal
  const getPriceRangeLabel = (price: number) => {
    if (price < 50) return 'Under $50';
    if (price < 100) return '$50 - $100';
    if (price < 500) return '$100 - $500';
    return 'Over $500';
  };

  // Convert DealResponse to Deal type for DealCard compatibility
  const adaptDealToDealCard = useCallback((dealResponse: DealResponse): Deal => {
    return {
      id: dealResponse.id,
      title: dealResponse.title,
      description: dealResponse.description,
      price: dealResponse.price,
      original_price: dealResponse.original_price,
      url: dealResponse.url,
      image_url: dealResponse.image_url,
      category: dealResponse.category,
      source: dealResponse.source,
      created_at: dealResponse.created_at,
      expires_at: dealResponse.expires_at,
      is_tracked: dealResponse.is_tracked,
      status: dealResponse.status,
      tags: dealResponse.tags,
      verified: dealResponse.verified,
      featured: dealResponse.featured,
      seller_info: dealResponse.seller_info,
      shipping_info: dealResponse.shipping_info ? {
        cost: dealResponse.shipping_info.cost || 0,
        free_shipping: dealResponse.shipping_info.free_shipping || false,
        estimated_days: dealResponse.shipping_info.estimated_days,
      } : undefined,
      availability: dealResponse.availability,
      market_id: dealResponse.market_id,
      goal_id: dealResponse.goal_id,
      user_id: dealResponse.user_id,
    };
  }, []);

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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
          />
        </div>
        
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
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <h3 className="text-lg font-semibold mb-2">No matching deals</h3>
          <p className="text-white/70 mb-6">Try adjusting your filters or search query</p>
          {showCreateButton && (
            <Button onClick={handleCreateClick}>
              Create New Deal
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
                className="cursor-pointer block p-7.5 bg-white/[0.05] border border-white/10 rounded-xl hover:bg-white/[0.1] transition"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{deal.title}</h3>
                    <p className="text-white/70 text-sm">{deal.category || 'Uncategorized'}</p>
                  </div>
                  
                  {/* Deal badges */}
                  <div className="flex gap-1">
                    {deal.verified && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        Verified
                      </span>
                    )}
                    {deal.featured && (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-white/50" />
                    <span>
                      {typeof deal.price === 'number' 
                        ? `$${deal.price.toFixed(2)}` 
                        : 'N/A'}
                      {deal.original_price && typeof deal.original_price === 'number' && (
                        <span className="text-white/50 line-through ml-2">
                          ${deal.original_price.toFixed(2)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-white/50" />
                    <span>
                      {deal.source || 'Unknown source'}
                    </span>
                  </div>
                  {deal.expires_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/50" />
                      <span>
                        Expires: {new Date(deal.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
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