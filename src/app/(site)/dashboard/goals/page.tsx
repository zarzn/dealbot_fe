"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, SlidersHorizontal, Check, Target } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useGoals } from '@/hooks/useGoals';
import { Skeleton } from '@/components/ui/skeleton';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
type FilterOption = 'all' | 'active' | 'paused' | 'completed' | 'expired';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';

const sortGoals = (a: any, b: any, sortBy: SortOption) => {
  switch (sortBy) {
    case 'newest':
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    case 'oldest':
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    case 'price-low':
      return (a.targetPrice || 0) - (b.targetPrice || 0);
    case 'price-high':
      return (b.targetPrice || 0) - (a.targetPrice || 0);
    case 'title':
      return (a.title || '').localeCompare(b.title || '');
    default:
      return 0;
  }
};

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const { data: goals, isLoading, error } = useGoals();

  if (error) {
    toast({
      title: 'Error loading goals',
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

  const filteredGoals = (goals || []).filter(goal => {
    // Status filter
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    
    // Price range filter
    if (priceRange !== 'all') {
      const goalPriceRange = getPriceRangeFilter(goal.targetPrice || 0);
      if (goalPriceRange !== priceRange) return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (goal.title || '').toLowerCase().includes(query) ||
        (goal.itemCategory || '').toLowerCase().includes(query)
      );
    }
    return true;
  }).sort((a, b) => sortGoals(a, b, sortBy));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-white/70">Manage and track your deal-finding goals</p>
        </div>
        <Link
          href="/dashboard/goals/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-500/80 transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search goals..."
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
            {['all', 'active', 'paused', 'completed', 'expired'].map((status) => (
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

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {filteredGoals.map((goal) => (
            <Link
              key={goal.id}
              href={`/dashboard/goals/${goal.id}`}
              className="block p-7.5 bg-white/[0.05] border border-white/10 rounded-xl hover:bg-white/[0.1] transition"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{goal.title || 'Untitled Goal'}</h3>
                  <p className="text-white/70 text-sm">{goal.itemCategory || 'No Category'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(goal.status || 'unknown')}`}>
                  {(goal.status || 'unknown').charAt(0).toUpperCase() + (goal.status || 'unknown').slice(1)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Target Price</span>
                  <span className="font-medium">${(goal.targetPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Current Price</span>
                  <span className="font-medium">${(goal.currentPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Matches Found</span>
                  <span className="font-medium">{goal.matchesFound || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Success Rate</span>
                  <span className="font-medium">{((goal.successRate || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <h3 className="text-lg font-semibold mb-2">No goals found</h3>
          <p className="text-white/70 mb-6">Create your first goal to start tracking deals</p>
          <Link
            href="/dashboard/goals/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-500/80 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Goal</span>
          </Link>
        </div>
      )}
    </div>
  );
} 