"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, SlidersHorizontal, Check, Target, DollarSign, Tag, BarChart3, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useGoals } from '@/hooks/useGoals';
import { Skeleton } from '@/components/ui/skeleton';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
type FilterOption = 'all' | 'active' | 'paused' | 'completed' | 'expired';
type PriorityOption = 'all' | 'high' | 'medium' | 'low';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';

const sortGoals = (a: any, b: any, sortBy: SortOption) => {
  switch (sortBy) {
    case 'newest':
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    case 'oldest':
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    case 'price-low':
      return (a.constraints?.max_price || 0) - (b.constraints?.max_price || 0);
    case 'price-high':
      return (b.constraints?.max_price || 0) - (a.constraints?.max_price || 0);
    case 'title':
      return (a.title || '').localeCompare(b.title || '');
    default:
      return 0;
  }
};

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [filterPriority, setFilterPriority] = useState<PriorityOption>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [priceFilterEnabled, setPriceFilterEnabled] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    status: filterStatus,
    priority: filterPriority,
    minPrice,
    maxPrice,
    priceFilterEnabled,
    sortBy
  });
  const [filtersChanged, setFiltersChanged] = useState(false);
  
  const { data: goals, isLoading, error } = useGoals();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading goals',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery !== pendingSearchQuery) {
      setSearchQuery(pendingSearchQuery);
    }
  };

  // Handle Enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery !== pendingSearchQuery) {
        setSearchQuery(pendingSearchQuery);
      }
    }
  };

  const getPriceRangeFilter = (price: number) => {
    if (price < 50) return 'under-50';
    if (price < 100) return '50-100';
    if (price < 500) return '100-500';
    return 'over-500';
  };

  // Update pending filters when filter controls change
  const updatePendingFilters = (newPartialFilters: Partial<typeof pendingFilters>) => {
    setPendingFilters(prev => ({
      ...prev,
      ...newPartialFilters
    }));
    setFiltersChanged(true);
  };

  // Apply pending filters
  const applyPendingFilters = () => {
    setFilterStatus(pendingFilters.status);
    setFilterPriority(pendingFilters.priority);
    setMinPrice(pendingFilters.minPrice);
    setMaxPrice(pendingFilters.maxPrice);
    setPriceFilterEnabled(pendingFilters.priceFilterEnabled);
    setSortBy(pendingFilters.sortBy);
    setFiltersChanged(false);
  };

  const filteredGoals = (goals || []).filter(goal => {
    // Status filter (all, active, paused, completed, expired)
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    
    // Priority filter (all, high, medium, low)
    if (filterPriority !== 'all') {
      const priorityValue = goal.priority;
      if (filterPriority === 'high' && priorityValue !== 1) return false;
      if (filterPriority === 'medium' && priorityValue !== 2) return false;
      if (filterPriority === 'low' && priorityValue !== 3) return false;
    }
    
    // Price range filter
    if (priceFilterEnabled) {
      const goalMaxPrice = goal.constraints?.max_price || 0;
      if (goalMaxPrice < minPrice || goalMaxPrice > maxPrice) return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        goal.title.toLowerCase().includes(query) ||
        goal.item_category.toLowerCase().includes(query)
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
      <div className="flex flex-col gap-4 mb-6 bg-white/[0.03] rounded-xl p-4 backdrop-blur-sm border border-white/10">
        {/* Search row with all controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Form */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="relative w-full md:w-1/2 lg:w-2/5 flex items-center"
          >
            <input
              type="text"
              placeholder="Search goals..."
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
              {isLoading ? <span className="animate-spin">⌛</span> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {/* Filter Controls - organized into a consistent row */}
          <div className="flex items-center justify-between md:justify-end w-full gap-2 flex-wrap">
            {/* Filters Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
              onClick={() => setShowExpandedFilters(!showExpandedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {showExpandedFilters ? '▲' : '▼'}
              {filtersChanged && <span className="ml-1 h-2 w-2 rounded-full bg-purple"></span>}
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
                      setSortBy(value as SortOption);
                    }}
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

        {/* Expanded Filters - collapsible section */}
        {showExpandedFilters && (
          <div className="mt-2 p-4 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 transition-all duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/70 mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Goals' },
                    { value: 'active', label: 'Active' },
                    { value: 'paused', label: 'Paused' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'expired', label: 'Expired' },
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

              {/* Priority Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/70 mb-2">Priority</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Priorities' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      className={`${
                        pendingFilters.priority === value
                          ? 'bg-purple/50 border-purple text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                      onClick={() => updatePendingFilters({ priority: value as PriorityOption })}
                    >
                      {pendingFilters.priority === value && <Check className="h-3 w-3 mr-1" />}
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

                <div className={pendingFilters.priceFilterEnabled ? 'opacity-100' : 'opacity-50'}>
                  <div className="py-6 px-2">
                    <Slider
                      disabled={!pendingFilters.priceFilterEnabled}
                      value={[pendingFilters.minPrice, pendingFilters.maxPrice]}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={(values) => {
                        updatePendingFilters({ 
                          minPrice: values[0],
                          maxPrice: values[1] 
                        });
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="bg-white/[0.05] rounded px-2 py-1 text-sm">
                      ${pendingFilters.minPrice}
                    </div>
                    <div className="bg-white/[0.05] rounded px-2 py-1 text-sm">
                      ${pendingFilters.maxPrice}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="default"
                size="sm"
                className="bg-purple hover:bg-purple/80"
                onClick={applyPendingFilters}
                disabled={!filtersChanged}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
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
                <div className="flex flex-col">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{goal.title}</h3>
                  <p className="text-white/70 text-sm">{goal.item_category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(goal.status || 'unknown')}`}>
                  {(goal.status || 'unknown').charAt(0).toUpperCase() + (goal.status || 'unknown').slice(1)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-white/50" />
                  <span>
                    Target: ${goal.constraints?.max_price?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-white/50" />
                  <span>
                    Matches: {goal.matches_found || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-white/50" />
                  <span>
                    Priority: {goal.priority === 1 ? 'High' : goal.priority === 2 ? 'Medium' : 'Low'}
                  </span>
                </div>
                {goal.deadline && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-white/50" />
                    <span>
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
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
            className="px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition"
          >
            Create Goal
          </Link>
        </div>
      )}
    </div>
  );
} 