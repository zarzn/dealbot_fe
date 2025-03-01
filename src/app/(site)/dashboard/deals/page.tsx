"use client";

import { useState, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, Check, Tag, Star, Package, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useSearchDeals, useTrackDeal, useUntrackDeal } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import type { DealSearch, DealSuggestion } from '@/types/deals';
import Image from 'next/image';

const calculateDiscount = (originalPrice?: number, currentPrice?: number): number => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

type SortOption = 'score' | 'price-low' | 'price-high' | 'savings';
type FilterOption = 'all' | 'tracked' | 'untracked';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('score');

  // Map frontend sort options to backend sort options
  const getSortOptions = (): { sort_by: string, sort_order: string } => {
    switch (sortBy) {
      case 'price-low':
        return { sort_by: 'price', sort_order: 'asc' };
      case 'price-high':
        return { sort_by: 'price', sort_order: 'desc' };
      case 'savings':
        return { sort_by: 'discount', sort_order: 'desc' };
      case 'score':
      default:
        return { sort_by: 'relevance', sort_order: 'desc' };
    }
  };

  const { sort_by, sort_order } = getSortOptions();

  const query: DealSearch = {
    query: searchQuery,
    sort_by,
    sort_order,
    min_price: priceRange === 'all' ? undefined : 
             priceRange === 'under-50' ? 0 :
             priceRange === '50-100' ? 50 :
             priceRange === '100-500' ? 100 : 500,
    max_price: priceRange === 'all' ? undefined :
             priceRange === 'under-50' ? 50 :
             priceRange === '50-100' ? 100 :
             priceRange === '100-500' ? 500 : undefined,
    limit: 20,
    offset: 0
  };

  const { data: deals = [], isLoading, error } = useSearchDeals(query);

  const trackDeal = useTrackDeal();
  const untrackDeal = useUntrackDeal();

  if (error) {
    toast({
      title: 'Error loading deals',
      description: error.message,
      variant: 'destructive',
    });
  }

  const getPriceRangeFilter = (price: number) => {
    if (price < 50) return 'under-50';
    if (price < 100) return '50-100';
    if (price < 500) return '100-500';
    return 'over-500';
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const filteredDeals = deals.filter((deal: DealSuggestion) => {
    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'tracked' && !deal.isTracked) return false;
      if (filterStatus === 'untracked' && !deal.isTracked) return false;
    }
    return true;
  });

  const handleTrackDeal = async (dealId: string) => {
    await trackDeal.mutateAsync(dealId);
  };

  const handleUntrackDeal = async (dealId: string) => {
    await untrackDeal.mutateAsync(dealId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Deals</h1>
        <p className="text-white/70">Discover AI-curated deals matching your goals</p>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {['all', 'tracked', 'untracked'].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setFilterStatus(status as FilterOption)}
                className="flex items-center justify-between"
              >
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                {filterStatus === status && <Check className="w-4 h-4" />}
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
        
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Sort</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              { value: 'score', label: 'Best Match' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'savings', label: 'Biggest Savings' },
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
      {isLoading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[400px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="col-span-full text-center text-red-500 p-7.5">
          Error loading deals: {error.message}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="col-span-full text-center text-gray-500 p-7.5">
          No deals found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {filteredDeals.map((deal: DealSuggestion) => (
            <div
              key={deal.id}
              className="bg-white/[0.05] rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative aspect-video">
                <Image
                  src={deal.imageUrl || '/placeholder-deal.jpg'}
                  alt={deal.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-7.5">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{deal.title}</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-purple">${deal.price}</p>
                    {deal.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ${deal.originalPrice}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {calculateDiscount(deal.originalPrice, deal.price)}% OFF
                    </p>
                    {deal.score && (
                      <p className="text-sm font-medium text-purple">
                        Score: {deal.score}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {deal.shippingInfo?.estimatedDays
                      ? `Delivery in ${deal.shippingInfo.estimatedDays} days`
                      : 'Shipping info unavailable'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deal.isTracked ? handleUntrackDeal(deal.id) : handleTrackDeal(deal.id)}
                    className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition"
                  >
                    {deal.isTracked ? 'Untrack Deal' : 'Track Deal'}
                  </button>
                  <a
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 