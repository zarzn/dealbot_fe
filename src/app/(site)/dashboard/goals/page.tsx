"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, SlidersHorizontal, Check, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { goalsService, type Goal } from '@/services/goals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
type FilterOption = 'all' | 'active' | 'paused' | 'completed' | 'expired';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalsService.getGoals();
      setGoals(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceRangeFilter = (price: number) => {
    if (price < 50) return 'under-50';
    if (price < 100) return '50-100';
    if (price < 500) return '100-500';
    return 'over-500';
  };

  const filteredGoals = goals.filter(goal => {
    // Status filter
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    
    // Price range filter
    if (priceRange !== 'all') {
      const goalPriceRange = getPriceRangeFilter(goal.targetPrice);
      if (goalPriceRange !== priceRange) return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        goal.title.toLowerCase().includes(query) ||
        goal.itemCategory.toLowerCase().includes(query)
      );
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      case 'oldest':
        return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
      case 'price-low':
        return a.targetPrice - b.targetPrice;
      case 'price-high':
        return b.targetPrice - a.targetPrice;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: Goal['status']) => {
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
          className="flex items-center gap-2 px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition"
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
        <div className="flex gap-2">
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
      </div>

      {/* Status Tabs */}
      <div className="border-b border-white/10 flex space-x-6">
        {['all', 'active', 'paused', 'completed', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as FilterOption)}
            className={`px-4 py-2 -mb-px ${
              filterStatus === status
                ? 'text-purple border-b-2 border-purple'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg border border-white/10 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-white/10 rounded" />
                  <div className="h-4 w-48 bg-white/10 rounded" />
                </div>
                <div className="h-6 w-16 bg-white/10 rounded-full" />
              </div>
              <div className="space-y-4 mt-6">
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-5/6 bg-white/10 rounded" />
              </div>
            </div>
          ))
        ) : filteredGoals.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-white/30" />
            </div>
            {goals.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                <p className="text-white/70 mb-4">Create your first goal to start tracking deals</p>
                <Link
                  href="/dashboard/goals/create"
                  className="flex items-center gap-2 px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Goal</span>
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No Matching Goals</h3>
                <p className="text-white/70 mb-4">Try adjusting your filters to see more goals</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setPriceRange('all');
                    setSortBy('newest');
                  }}
                  className="text-purple hover:underline"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="col-span-full mb-4">
              <p className="text-white/70">
                Showing {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
                {(filterStatus !== 'all' || priceRange !== 'all' || searchQuery) && ' matching filters'}
              </p>
            </div>
            {/* Goals list */}
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg border border-white/10 hover:border-purple/50 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                    <p className="text-white/70 text-sm">{goal.itemCategory}</p>
                  </div>
                  <span className={`px-2 py-1 ${getStatusColor(goal.status)} text-xs rounded-full`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Target Price:</span>
                    <span>${goal.targetPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Current Price:</span>
                    <span>${goal.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Max Price:</span>
                    <span>${goal.constraints.maxPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-white/70">
                      Created {new Date(goal.createdAt!).toLocaleDateString()}
                    </div>
                    <Link
                      href={`/dashboard/goals/${goal.id}`}
                      className="text-purple hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
} 