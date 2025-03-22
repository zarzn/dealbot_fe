import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  BarChart2,
  Share,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
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
import ShareButton from './ShareButton';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
type FilterOption = 'all' | 'verified' | 'featured' | 'tracked';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';
type CategoryOption = 'all' | 'electronics' | 'clothing' | 'home' | 'sports' | 'beauty' | 'toys' | 'books' | 'services' | 'other';

interface DealsListProps {
  initialDeals?: DealResponse[];
  initialFilters?: DealFiltersState;
  showCreateButton?: boolean;
  showFilters?: boolean;
  gridColumns?: { base: number; md: number; lg: number; xl: number };
  maxWidth?: string;
  onDealSelect?: (dealId: string) => void;
  onCreateDeal?: () => void;
  selectedDealId?: string | null;
  isLoading?: boolean;
  deals?: DealResponse[];
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
  showFilters = true,
  gridColumns = { base: 1, md: 2, lg: 3, xl: 3 },
  maxWidth = '100%',
  onDealSelect,
  onCreateDeal,
  selectedDealId,
  isLoading: externalLoading = false,
  deals: externalDeals,
}): JSX.Element => {
  const router = useRouter();
  const isMounted = useRef(false);
  const isLoadingRef = useRef(false);
  const [deals, setDeals] = useState<DealResponse[]>(externalDeals || initialDeals);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryOption>('all');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(!initialDeals.length && !externalDeals);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  
  // Replace the isMounted state with useRef initialization
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Check if mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Update when externalDeals changes
  useEffect(() => {
    if (externalDeals) {
      setDeals(externalDeals);
    }
  }, [externalDeals]);

  // Extract features from tags - define before using in adaptDealToDealCard
  const extractFeaturesFromTags = useCallback((tags: string[]): string[] => {
    if (!tags || tags.length === 0) return [];
    return tags.slice(0, 5); // Limit to 5 features
  }, []);

  // Function to convert DealResponse to the improved card format
  const adaptDealToDealCard = useCallback((dealResponse: DealResponse): Deal => {
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
      score: dealResponse.latest_score || (dealResponse.ai_analysis ? dealResponse.ai_analysis.analysis?.score : undefined),
      features: extractedFeatures,
      // Add required properties from BaseDeal
      market_id: dealResponse.market_id,
      goal_id: dealResponse.goal_id,
      user_id: dealResponse.user_id
    };
  }, [extractFeaturesFromTags]);

  // Helper function to get score color
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  }, []);

  // Helper function to format price
  const formatPrice = useCallback((price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Helper function to calculate discount percentage
  const calculateDiscount = useCallback((original: number | string | null | undefined, current: number | string) => {
    if (!original) return null;
    const originalNum = typeof original === 'string' ? parseFloat(original) : original;
    const currentNum = typeof current === 'string' ? parseFloat(current) : current;
    
    if (!originalNum || originalNum <= currentNum) return null;
    return Math.round(((originalNum - currentNum) / originalNum) * 100);
  }, []);

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
    
    console.log('[DealsList] Creating search query with page:', page);
    
    return {
      query: searchQuery,
      page: page,
      page_size: 12,
      limit: 12, // Include for backend compatibility
      offset: (page - 1) * 12, // Include for backend compatibility
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
    if (!isMounted.current || isLoadingRef.current) return;
    
    setIsLoading(true);
    isLoadingRef.current = true;
    setError(null);
    
    try {
      const searchQuery = createSearchQuery();
      
      const response = await dealsService.searchDeals(searchQuery);
      
      // Instead of appending to existing deals, replace with current page results
      setDeals(response.deals);
      
      // Calculate total pages
      const total = response.total || 0;
      setTotalItems(total);
      const pageSize = searchQuery.page_size || 12;
      setTotalPages(Math.ceil(total / pageSize));
      
      // No longer needed with pagination
      setHasMore(false);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again later.');
      setDeals([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [createSearchQuery, dealsService]);

  // Use a single useEffect for both filter changes and page changes
  useEffect(() => {
    if (!isMounted.current) return;
    
    loadDeals();
  }, [searchQuery, filterCategory, filterStatus, priceRange, sortBy, page, loadDeals]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (!isLoading && isMounted.current && newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [isLoading, totalPages]);

  // Generate an array of page numbers to display
  const getPageNumbers = useCallback(() => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = isMobile ? 3 : 5; // Show fewer page numbers on mobile
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total number of pages is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate range to show around current page
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);
      
      // Adjust if current page is near the start
      if (page <= 3) {
        endPage = Math.min(totalPages - 1, isMobile ? 2 : 4);
      }
      
      // Adjust if current page is near the end
      if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (isMobile ? 1 : 3));
      }
      
      // Add ellipsis if needed at the beginning
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add page numbers around current page
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed at the end
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  }, [page, totalPages, isMobile]);

  // Handle deal selection
  const handleDealClick = useCallback((dealId: string) => {
    if (onDealSelect) {
      onDealSelect(dealId);
    } else if (router) {
      router.push(`/dashboard/deals/${dealId}`);
    }
  }, [onDealSelect, router]);

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    if (onCreateDeal) {
      onCreateDeal();
    } else if (router) {
      router.push('/dashboard/goals/create');
    }
  }, [onCreateDeal, router]);

  // If not mounted yet (during SSR), return null or a loading placeholder
  if (!isMounted.current) {
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
    <div className="w-full" style={{ maxWidth }}>
      {/* Header with search and filters */}
      {showFilters && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Form */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative w-full md:w-1/2 lg:w-1/3 flex items-center"
            >
              <input
                type="text"
                placeholder="Search deals..."
                value={pendingSearchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                className="w-full h-10 px-4 pr-10 rounded-md bg-white/[0.05] border border-white/10 text-white focus:ring-1 focus:ring-purple focus:border-purple"
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon" 
                className="absolute right-0 h-10 w-10 text-white/70"
                disabled={isLoading}
              >
                {isLoading ? <Loader size="sm" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            {/* Buttons and Share */}
            <div className="flex items-center space-x-2">
              {/* Share Results Button */}
              {deals.length > 0 && (
                <ShareButton
                  searchParams={createSearchQuery()}
                  variant="outline"
                  size="icon"
                  className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] p-2 h-9 w-9"
                  tooltip="Share Results"
                />
              )}

              {/* Create Deal Button */}
              {showCreateButton && (
                <Button
                  onClick={handleCreateClick} 
                  size="sm"
                  className="bg-purple hover:bg-purple-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deal
                </Button>
              )}

              {/* Filters Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                onClick={() => setShowExpandedFilters(!showExpandedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {showExpandedFilters ? '▲' : '▼'}
              </Button>
              
              {/* Sort Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
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
          </div>

          {/* Expanded Filters */}
          {showExpandedFilters && (
            <div className="mt-2 p-4 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 transition-all duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All Deals' },
                      { value: 'verified', label: 'Verified Deals' },
                      { value: 'featured', label: 'Featured Deals' },
                      { value: 'tracked', label: 'Tracked Deals' },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        className={`${
                          filterStatus === value
                            ? 'bg-purple/50 border-purple text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                        onClick={() => setFilterStatus(value as FilterOption)}
                      >
                        {filterStatus === value && <Check className="h-3 w-3 mr-1" />}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-2">Category</h3>
                  <div className="grid grid-cols-2 gap-2">
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
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        className={`${
                          filterCategory === value
                            ? 'bg-purple/50 border-purple text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        } justify-start`}
                        onClick={() => setFilterCategory(value as CategoryOption)}
                      >
                        {filterCategory === value && <Check className="h-3 w-3 mr-1" />}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-2">Price Range</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: 'all', label: 'All Prices' },
                      { value: 'under-50', label: 'Under $50' },
                      { value: '50-100', label: '$50 - $100' },
                      { value: '100-500', label: '$100 - $500' },
                      { value: 'over-500', label: 'Over $500' },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        className={`${
                          priceRange === value
                            ? 'bg-purple/50 border-purple text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        } justify-start`}
                        onClick={() => setPriceRange(value as PriceRange)}
                      >
                        {priceRange === value && <Check className="h-3 w-3 mr-1" />}
                        <DollarSign className={`h-3.5 w-3.5 ${value === 'all' ? 'mr-1' : ''}`} />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deals grid */}
      <div>
        {/* Loading state */}
        {(isLoading || externalLoading) && (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && deals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/70 mb-2">
              {searchQuery || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'No deals match your search criteria'
                : 'No deals found'}
            </div>
            {showCreateButton && (
              <Button
                onClick={handleCreateClick}
                className="mt-4 bg-purple text-white hover:bg-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deal
              </Button>
            )}
          </div>
        )}

        {/* Deals grid */}
        {!isLoading && !error && deals.length > 0 && (
          <div className={`grid gap-4 sm:gap-6 grid-cols-${gridColumns.base} md:grid-cols-${gridColumns.md} lg:grid-cols-${gridColumns.lg} xl:grid-cols-${gridColumns.xl}`}>
            {deals.map((deal: DealResponse) => (
              <div 
                key={deal.id} 
                onClick={() => onDealSelect && onDealSelect(deal.id)}
                className="cursor-pointer"
              >
                <DealCard
                  deal={adaptDealToDealCard(deal)}
                  isSelected={selectedDealId === deal.id}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && !error && deals.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Previous page button */}
              <Button
                onClick={() => handlePageChange(page - 1)}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 h-10 w-10 p-0"
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page numbers */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {getPageNumbers().map((pageNum, index) => (
                  typeof pageNum === 'number' ? (
                    <Button
                      key={index}
                      onClick={() => handlePageChange(pageNum)}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      className={`${pageNum === page 
                        ? "bg-purple hover:bg-purple-600 text-white" 
                        : "border-white/10 hover:bg-white/5"} min-w-[2.5rem] h-10`}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  ) : (
                    <span key={index} className="text-white/50 px-1">
                      {pageNum}
                    </span>
                  )
                ))}
              </div>
              
              {/* Next page button */}
              <Button
                onClick={() => handlePageChange(page + 1)}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 h-10 w-10 p-0"
                disabled={page === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Show total results information */}
        {!isLoading && !error && deals.length > 0 && (
          <div className="text-center text-white/50 text-sm mt-4">
            Showing {deals.length} of {totalItems} results • Page {page} of {totalPages}
            
            {/* Debug buttons - only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 flex justify-center gap-2">
                <button 
                  className="bg-purple px-2 py-1 text-xs rounded" 
                  onClick={() => {
                    // Direct test of page 2
                    console.log('[DealsList] Debug: Directly testing page 2');
                    handlePageChange(2);
                  }}
                >
                  Test Page 2
                </button>
                <button 
                  className="bg-purple px-2 py-1 text-xs rounded" 
                  onClick={async () => {
                    // Direct API call test
                    console.log('[DealsList] Debug: Direct API call to page 2');
                    const query = { ...createSearchQuery(), page: 2 };
                    try {
                      const result = await dealsService.searchDeals(query);
                      console.log('[DealsList] Debug API result:', result);
                    } catch (err) {
                      console.error('[DealsList] Debug API error:', err);
                    }
                  }}
                >
                  Test API Page 2
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 

export default DealsList; 