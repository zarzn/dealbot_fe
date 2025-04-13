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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PriceRangeSlider } from '@/components/ui/price-range-slider';

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
  onSelectTag?: (tag: string) => void;
  onDeleteDeal?: (dealId: string) => void;
  showTrackedToggle?: boolean;
  defaultSortBy?: SortOption;
  hideIfEmpty?: boolean;
  allowFiltering?: boolean;
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
  onSelectTag,
  onDeleteDeal,
  showTrackedToggle = true,
  defaultSortBy = 'newest',
  hideIfEmpty = false,
  allowFiltering = true
}): JSX.Element => {
  const router = useRouter();
  const isMounted = useRef(false);
  const isLoadingRef = useRef(false);
  const [deals, setDeals] = useState<DealResponse[]>(externalDeals || initialDeals);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryOption>('all');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [priceFilterEnabled, setPriceFilterEnabled] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(defaultSortBy);
  const [isLoading, setIsLoading] = useState(!initialDeals.length && !externalDeals);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    category: filterCategory,
    status: filterStatus,
    minPrice,
    maxPrice,
    priceFilterEnabled,
    sortBy
  });
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
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
    if (score >= 8) return 'text-green-500 preserve-color';
    if (score >= 6) return 'text-yellow-500 preserve-color';
    if (score >= 4) return 'text-orange-500 preserve-color';
    return 'text-red-500 preserve-color';
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

  // Create search query parameters
  const createSearchQuery = useCallback(() => {
    const filters: Record<string, any> = {};
    
    // Add category filter if selected
    if (filterCategory && filterCategory !== 'all') {
      filters.category = filterCategory;
    }
    
    // Add status filter if selected
    if (filterStatus && filterStatus !== 'all') {
      filters.status = filterStatus;
    }
    
    // Determine sort parameters based on sortBy option
    let sort_by = '';
    let sort_order = '';
    
    switch (sortBy) {
      case 'newest':
        sort_by = 'created_at';
        sort_order = 'desc';
        break;
      case 'oldest':
        sort_by = 'created_at';
        sort_order = 'asc';
        break;
      case 'price-low':
        sort_by = 'price';
        sort_order = 'asc';
        break;
      case 'price-high':
        sort_by = 'price';
        sort_order = 'desc';
        break;
      case 'title':
        sort_by = 'title';
        sort_order = 'asc';
        break;
      default:
        sort_by = 'created_at';
        sort_order = 'desc';
    }
    
    // Construct the search parameters
    const searchParams: DealSearch = {
      query: searchQuery.trim(),
      page,
      // For search queries, use a larger page size to show all results
      page_size: searchQuery.trim() ? 100 : 12,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort_by,
      sort_order
    };

    // Add price filter if enabled - as top-level parameters to match the backend API
    if (priceFilterEnabled && (minPrice > 0 || maxPrice < 1000)) {
      searchParams.min_price = minPrice;
      searchParams.max_price = maxPrice;
    }
    
    return searchParams;
  }, [filterCategory, filterStatus, priceFilterEnabled, minPrice, maxPrice, searchQuery, page, sortBy]);

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
      const searchParams = createSearchQuery();
      
      // Enhanced debug logging to help trace issues
      console.log('[DealsList] Searching with params:', {
        query: searchParams.query,
        page: searchParams.page,
        sortBy: searchParams.sort_by,
        sortOrder: searchParams.sort_order,
        filters: searchParams.filters,
        minPrice: searchParams.min_price,
        maxPrice: searchParams.max_price,
        fullParams: JSON.stringify(searchParams)
      });
      
      const response = await dealsService.searchDeals(searchParams);
      
      // Enhanced debug logging for the response
      console.log('[DealsList] Search response received:', {
        totalDeals: response.deals?.length,
        totalCount: response.total,
        currentPage: response.page || searchParams.page,
        sortBy: response.sort_by,  // Check if sort_by is returned by the backend
        sortOrder: response.sort_order,  // Check if sort_order is returned by the backend
        sampledDeal: response.deals?.length > 0 ? {
          id: response.deals[0].id,
          title: response.deals[0].title,
          price: response.deals[0].price,
          created_at: response.deals[0].created_at
        } : null
      });
      
      // Clear the previous deals and set new ones
      setDeals([]);
      setTimeout(() => {
        // Use setTimeout to ensure UI updates with the empty state first
        // This creates a visual feedback that something has changed
        setDeals(response.deals || []);
        
        // Calculate total pages
        const total = response.total || 0;
        setTotalItems(total);
        const pageSize = searchParams.page_size || 12;
        const calculatedTotalPages = Math.ceil(total / pageSize);
        setTotalPages(calculatedTotalPages);
        
        // Enhanced pagination state handling
        // Make sure we convert response.page to a number for proper comparison
        const responsePageNumber = response.page ? Number(response.page) : Number(searchParams.page);
        
        console.log(`[DealsList] Pagination state check - API page: ${responsePageNumber}, current state page: ${page}, total pages: ${calculatedTotalPages}`);
        
        if (calculatedTotalPages > 0) {
          // If the requested page exceeds total pages, adjust to page 1
          if (responsePageNumber > calculatedTotalPages) {
            console.log(`[DealsList] Page number from response (${responsePageNumber}) exceeds total pages (${calculatedTotalPages}), adjusting to page 1`);
            setPage(1);
          } 
          // If page from API differs from our current state, sync it
          else if (responsePageNumber !== page) {
            console.log(`[DealsList] Synchronizing page state: current=${page}, server=${responsePageNumber}`);
            setPage(responsePageNumber);
          } else {
            console.log(`[DealsList] Page state is already in sync with API: ${page}`);
          }
        }
        
        console.log('[DealsList] Updated deals state with', response.deals?.length, 'deals');
      }, 50);
      
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again later.');
      setDeals([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [createSearchQuery, page]);

  // When search query changes, reset to page 1 and clear existing results
  useEffect(() => {
    if (!isMounted.current) return;
    console.log('[DealsList] Search query changed - resetting to page 1');
    
    // Clear current deals to indicate new search is in progress
    if (searchQuery.trim()) {
      setDeals([]);
    }
    
    setPage(1);
  }, [searchQuery]);

  // Use a separate useEffect for loading deals that depends on the page and search query
  useEffect(() => {
    if (!isMounted.current) return;
    if (isLoadingRef.current) {
      console.log('[DealsList] Skipping load effect because another load is in progress');
      return;
    }
    console.log('[DealsList] Effect triggered to load deals - page or searchQuery changed. Current page:', page);
    loadDeals();
  }, [page, searchQuery, loadDeals]);

  // Add a new effect to react to filter and sort changes
  useEffect(() => {
    if (!isMounted.current) return;
    if (isLoadingRef.current) {
      console.log('[DealsList] Skipping filter effect because a load is in progress');
      return;
    }
    console.log('[DealsList] Filter state changed:', {
      filterCategory,
      filterStatus,
      priceFilterEnabled,
      minPrice,
      maxPrice,
      sortBy
    });
    console.log('[DealsList] Resetting to page 1 due to filter changes');
    setPage(1);
    // We don't need to call loadDeals() here as the page change will trigger the other effect
  }, [filterCategory, filterStatus, priceFilterEnabled, minPrice, maxPrice, sortBy]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (!isLoading && isMounted.current && newPage >= 1 && newPage <= totalPages) {
      console.log(`[DealsList] Changing page from ${page} to ${newPage}`);
      
      // Force immediate feedback by clearing deals list
      setDeals([]);
      
      // Update the page state
      setPage(newPage);
      
      // Scroll to top of the page for better UX
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      console.log(`[DealsList] Cannot change to page ${newPage} - isLoading: ${isLoading}, isMounted: ${isMounted.current}, validPage: ${newPage >= 1 && newPage <= totalPages}`);
    }
  }, [isLoading, totalPages, page]);

  // Generate an array of page numbers to display
  const getPageNumbers = useCallback(() => {
    // Ensure we're working with valid values
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    const validTotalPages = Math.max(1, totalPages || 1);
    
    console.log(`[DealsList] Generating page numbers. Current page: ${currentPage}, Total pages: ${validTotalPages}`);
    
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = isMobile ? 3 : 5; // Show fewer page numbers on mobile
    
    if (validTotalPages <= maxVisiblePages) {
      // Show all pages if total number of pages is small
      for (let i = 1; i <= validTotalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate range to show around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(validTotalPages - 1, currentPage + 1);
      
      // Adjust if current page is near the start
      if (currentPage <= 3) {
        endPage = Math.min(validTotalPages - 1, isMobile ? 2 : 4);
      }
      
      // Adjust if current page is near the end
      if (currentPage >= validTotalPages - 2) {
        startPage = Math.max(2, validTotalPages - (isMobile ? 1 : 3));
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
      if (endPage < validTotalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      if (validTotalPages > 1) {
        pageNumbers.push(validTotalPages);
      }
    }
    
    return pageNumbers;
  }, [page, totalPages, isMobile]);

  // Helper function to determine if navigation should happen on click
  const handleDealCardClick = (event: React.MouseEvent, dealId: string) => {
    // Check if the event target is part of an accordion, button, or other interactive element
    let target = event.target as HTMLElement;
    let currentElement = target;
    
    // Debug log
    console.log('Deal card clicked:', currentElement.tagName, currentElement.className);
    
    // Walk up the DOM tree to see if any parent elements have data attributes indicating 
    // they're part of an interactive UI element
    while (currentElement && currentElement !== event.currentTarget) {
      // Add more debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Checking element:', {
          tag: currentElement.tagName,
          classes: currentElement.className,
          dataNoNavigation: currentElement.dataset.noNavigation,
          dataState: currentElement.getAttribute('data-state'),
          role: currentElement.getAttribute('role')
        });
      }
      
      // Check for elements that should prevent navigation
      if (
        currentElement.tagName === 'BUTTON' || 
        currentElement.tagName === 'A' ||
        currentElement.getAttribute('role') === 'button' ||
        currentElement.classList.contains('accordion') ||
        currentElement.classList.contains('interactive-element') ||
        currentElement.dataset.noNavigation === 'true' ||
        currentElement.getAttribute('data-state') === 'open' || 
        currentElement.getAttribute('data-state') === 'closed' ||
        // Add additional checks for Radix UI elements
        (currentElement.className && 
          (currentElement.className.includes('Accordion') || 
           currentElement.className.includes('accordion') ||
           currentElement.className.includes('radix')))
      ) {
        // Found an interactive element - don't navigate
        console.log('Preventing navigation due to interactive element click:', 
          currentElement.tagName, 
          currentElement.className
        );
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      currentElement = currentElement.parentElement as HTMLElement;
    }
    
    // If we made it here, the click wasn't on an interactive element, so navigate
    console.log('Navigating to deal detail:', dealId);
    if (onDealSelect) {
      onDealSelect(dealId);
    }
  };

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    if (onCreateDeal) {
      onCreateDeal();
    } else if (router) {
      router.push('/dashboard/goals/create');
    }
  }, [onCreateDeal, router]);

  // Apply pending filters
  const applyPendingFilters = () => {
    console.log('[DealsList] Applying pending filters:', pendingFilters);
    
    // Capture the previous values to check if anything actually changed
    const prevCategory = filterCategory;
    const prevStatus = filterStatus;
    const prevMinPrice = minPrice;
    const prevMaxPrice = maxPrice;
    const prevPriceFilterEnabled = priceFilterEnabled;
    const prevSortBy = sortBy;
    
    // Update all filter states from pending filters
    setFilterCategory(pendingFilters.category);
    setFilterStatus(pendingFilters.status);
    setMinPrice(pendingFilters.minPrice);
    setMaxPrice(pendingFilters.maxPrice);
    setPriceFilterEnabled(pendingFilters.priceFilterEnabled);
    setSortBy(pendingFilters.sortBy);
    
    // Reset filters changed flag
    setFiltersChanged(false);
    
    // Check if anything actually changed
    const filtersActuallyChanged = 
      prevCategory !== pendingFilters.category ||
      prevStatus !== pendingFilters.status ||
      prevMinPrice !== pendingFilters.minPrice ||
      prevMaxPrice !== pendingFilters.maxPrice ||
      prevPriceFilterEnabled !== pendingFilters.priceFilterEnabled ||
      prevSortBy !== pendingFilters.sortBy;
    
    console.log('[DealsList] Filters actually changed:', filtersActuallyChanged);
    
    // If nothing changed, force a reload anyway
    if (!filtersActuallyChanged) {
      console.log('[DealsList] No filters changed, but forcing reload anyway');
      setPage(1);
      loadDeals();
    }
    // Note: if filters did change, the useEffect with filter dependencies will trigger a reload
  };
  
  // Update pending filters when filter controls change
  const updatePendingFilters = (newPartialFilters: Partial<typeof pendingFilters>) => {
    setPendingFilters(prev => ({
      ...prev,
      ...newPartialFilters
    }));
    setFiltersChanged(true);
  };

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

    // We no longer filter locally as filtering is handled by the backend
    return true;
  });

  return (
    <div className="w-full" style={{ maxWidth }}>
      {/* Header with search and filters */}
      {showFilters && (
        <div className="flex flex-col gap-4 mb-6 bg-white/[0.03] rounded-xl p-4 backdrop-blur-sm border border-white/10">
          {/* Search row with all controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Form - Enhanced with more prominent design */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative w-full md:w-2/3 lg:w-3/5"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search deals or find real-time marketplace matches..."
                  value={pendingSearchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full h-12 px-5 pl-12 pr-12 rounded-xl bg-white/[0.07] border border-white/10 text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple/50 backdrop-blur-sm"
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute -top-3 right-3 bg-gradient-to-r from-purple to-blue-400 px-2 py-0.5 rounded-full text-xs text-white font-medium shadow-lg animate-pulse">
                  Real-time Search
                </div>
                <Button 
                  type="submit"
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white/70 hover:text-white hover:bg-transparent"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-1 ml-2">
                <p className="text-xs text-white/50">Search across inventory and get real-time marketplace data</p>
                {isSearchFocused && (
                  <div className="mt-2 p-3 bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-lg text-xs text-white/80 animate-fadeIn">
                    <p className="mb-1 font-medium text-purple">Power Search Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Enter specific product names for precise matches</li>
                      <li>Include brands or model numbers for better results</li>
                      <li>Our AI will scrape marketplaces in real-time if needed</li>
                      <li>Add price ranges like &ldquo;under $500&rdquo; in your query</li>
                    </ul>
                  </div>
                )}
              </div>
            </form>

            {/* Filter Controls - organized into a consistent row */}
            <div className="flex items-center justify-between md:justify-end w-full md:w-1/3 lg:w-2/5 gap-2 flex-wrap">
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
                    {sortBy === 'newest' ? 'Newest First' : 
                     sortBy === 'oldest' ? 'Oldest First' : 
                     sortBy === 'price-low' ? 'Price: Low to High' : 
                     sortBy === 'price-high' ? 'Price: High to Low' : 
                     sortBy === 'title' ? 'Title' : 'Sort'}
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
                      onClick={() => {
                        console.log('[DealsList] Setting sort option directly:', value);
                        // Directly set the sort option rather than using pending filters
                        setSortBy(value as SortOption);
                        // The useEffect hook will detect this change and reload the deals
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{label}</span>
                      {sortBy === value && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Create Deal Button - most important action so placed at the end */}
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
            </div>
          </div>

          {/* Expanded Filters - now well organized in a card-like container */}
          {showExpandedFilters && (
            <div className="mt-2 p-4 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 transition-all duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div className="space-y-3">
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
                          pendingFilters.status === value
                            ? 'bg-purple/50 border-purple text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                        onClick={() => updatePendingFilters({ status: value as FilterOption })}
                      >
                        {pendingFilters.status === value && <Check className="h-3 w-3 mr-1" />}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/70 mb-2">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All Categories' },
                      { value: 'electronics', label: 'Electronics' },
                      { value: 'clothing', label: 'Clothing' },
                      { value: 'home', label: 'Home & Garden' },
                      { value: 'sports', label: 'Sports & Outdoors' },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        className={`${
                          pendingFilters.category === value
                            ? 'bg-purple/50 border-purple text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                        onClick={() => updatePendingFilters({ category: value as CategoryOption })}
                      >
                        {pendingFilters.category === value && <Check className="h-3 w-3 mr-1" />}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white/70">Price Range</h3>
                    <div className="flex items-center">
                      <Checkbox
                        id="priceFilterEnabled"
                        checked={pendingFilters.priceFilterEnabled}
                        onCheckedChange={(checked) => 
                          updatePendingFilters({ priceFilterEnabled: checked as boolean })
                        }
                      />
                      <Label htmlFor="priceFilterEnabled" className="ml-2 text-sm">
                        Enable price filter
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <span>${pendingFilters.minPrice}</span>
                    <span>${pendingFilters.maxPrice}</span>
                  </div>
                  
                  <PriceRangeSlider
                    minValue={pendingFilters.minPrice}
                    maxValue={pendingFilters.maxPrice}
                    min={0}
                    max={1000}
                    step={10}
                    onChange={([min, max]) => {
                      updatePendingFilters({
                        minPrice: min,
                        maxPrice: max
                      });
                    }}
                    disabled={!pendingFilters.priceFilterEnabled}
                    className="mb-6"
                    showLabels={false} // We're already showing the labels separately
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPrice">Min Price</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        value={pendingFilters.minPrice}
                        onChange={(e) => updatePendingFilters({ minPrice: parseInt(e.target.value) || 0 })}
                        disabled={!pendingFilters.priceFilterEnabled}
                        min={0}
                        max={pendingFilters.maxPrice}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice">Max Price</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        value={pendingFilters.maxPrice}
                        onChange={(e) => updatePendingFilters({ maxPrice: parseInt(e.target.value) || 0 })}
                        disabled={!pendingFilters.priceFilterEnabled}
                        min={pendingFilters.minPrice}
                        max={1000}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Apply Filters Button - consistently positioned */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => {
                    console.log('[DealsList] Apply Filters button clicked');
                    // Clear the deals first to provide visual feedback that something is happening
                    setDeals([]);
                    // Then apply the filters (which will trigger a reload)
                    applyPendingFilters();
                  }}
                  disabled={isLoading || !filtersChanged}
                  className="bg-purple hover:bg-purple-600 text-white min-w-[120px]"
                >
                  {isLoading ? <Loader size="sm" className="mr-2" /> : null}
                  {isLoading ? 'Applying...' : 'Apply Filters'}
                </Button>
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
          <div className={`grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3`}>
            {deals.map((deal: DealResponse) => (
              <div 
                key={deal.id} 
                onClick={(e) => handleDealCardClick(e, deal.id)}
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

        {/* Pagination controls - hide when search is active */}
        {!isLoading && !error && deals.length > 0 && totalPages > 1 && !searchQuery.trim() && (
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
              
              {/* Page numbers - key by current page to force re-render on page change */}
              <div className="flex flex-wrap items-center justify-center gap-2" key={`pagination-${page}`}>
                {getPageNumbers().map((pageNum, index) => (
                  typeof pageNum === 'number' ? (
                    <Button
                      key={`page-${pageNum}`}
                      onClick={() => handlePageChange(pageNum)}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      className={`${pageNum === page 
                        ? "bg-purple hover:bg-purple-600 text-white font-medium" 
                        : "border-white/10 hover:bg-white/5"} min-w-[2.5rem] h-10`}
                      disabled={isLoading}
                      aria-current={pageNum === page ? "page" : undefined}
                      data-active={pageNum === page ? "true" : "false"}
                      data-testid={pageNum === page ? "active-page-button" : `page-button-${pageNum}`}
                    >
                      {pageNum}
                      {pageNum === page && (
                        <span className="sr-only">(current)</span>
                      )}
                    </Button>
                  ) : (
                    <span key={`ellipsis-${index}`} className="text-white/50 px-1">
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
        
        {/* Show total results information with current page highlighted - adjust text for search results */}
        {!isLoading && !error && deals.length > 0 && (
          <div className="text-center text-white/50 text-sm mt-4">
            {searchQuery.trim() ? (
              <>Showing {deals.length} results for <span className="text-purple font-medium">&ldquo;{searchQuery}&rdquo;</span></>
            ) : (
              <>Showing {deals.length} of {totalItems} results • Page <span className="text-purple font-medium">{page}</span> of {totalPages}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 

export default DealsList; 