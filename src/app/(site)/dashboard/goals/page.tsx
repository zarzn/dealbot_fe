"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal, Check, Target, DollarSign, Tag, BarChart3, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Loader } from '@/components/ui/loader';
import { goalsService } from '@/services/goals';
import { Goal } from '@/services/goals';
import { ArrowLeft, Calendar, Share, Edit, Trash, AlertCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from '@/components/ui/custom-progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistance, parseISO } from 'date-fns';
import { GoalStatusManager } from '@/components/Goals/GoalStatusManager';
import FilterIcon from '@/components/icons/FilterIcon';
import { CustomFilter as Filter } from '@/components/ui/custom-filter';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
type FilterOption = 'all' | 'active' | 'paused' | 'completed' | 'expired';
type PriorityOption = 'all' | 'high' | 'medium' | 'low';
type PriceRange = 'all' | 'under-50' | '50-100' | '100-500' | 'over-500';

// Helper function to sort goals
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

// Goal detail component for use with query parameters
const GoalDetailView = ({ goalId }: { goalId: string }) => {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (goalId) {
      loadGoal(goalId);
    } else {
      setIsLoading(false);
      setError("No goal ID provided");
    }
  }, [goalId]);

  const loadGoal = async (id: string) => {
    try {
      setIsLoading(true);
      const goalData = await goalsService.getGoalById(id);
      setGoal(goalData);
      
      try {
        const analyticsData = await goalsService.getGoalAnalytics(id);
        setAnalytics(analyticsData);
      } catch (analyticsError) {
        console.warn("Error loading goal analytics", analyticsError);
      }
      
      setError(null);
    } catch (error: any) {
      console.error("Error loading goal:", error);
      setError(error.message || "Failed to load goal details");
      toast({
        title: "Error",
        description: error.message || "Failed to load goal details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Goal['status']) => {
    if (!goal || !goal.id) return;
    
    try {
      const updatedGoal = await goalsService.updateGoalStatus(goal.id, newStatus);
      setGoal(updatedGoal);
      toast({
        title: "Success",
        description: `Goal status updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Error updating goal status:", error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update goal status',
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async () => {
    if (!goal || !goal.id || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await goalsService.deleteGoal(goal.id);
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
      // Navigate back to goals listing without query param
      router.push("/dashboard/goals");
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete goal',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const openDeleteDialog = () => {
    if (!goal || !goal.id) return;
    setShowDeleteDialog(true);
  };

  const handleShareGoal = async () => {
    if (!goal || !goal.id) return;
    
    try {
      const response = await goalsService.shareGoal(goal.id);
      
      // Always use the production domain for share links
      let shareUrl = response.shareUrl;
      
      if (shareUrl) {
        // Get the production URL from environment variables
        const productionDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://rebaton.ai';
        
        if (!shareUrl.startsWith('http')) {
          // If it's a relative URL, prepend the production domain
          shareUrl = `${productionDomain}${shareUrl.startsWith('/') ? '' : '/'}${shareUrl}`;
        } else {
          try {
            // For any absolute URL, replace the domain part with the production domain
            const urlObj = new URL(shareUrl);
            shareUrl = shareUrl.replace(`${urlObj.protocol}//${urlObj.host}`, productionDomain);
          } catch (urlError) {
            console.error('Error parsing URL:', urlError);
            // If URL parsing fails, keep the original URL
          }
        }
      }
      
      // Copy the fixed URL
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
    } catch (error: any) {
      console.error("Error sharing goal:", error);
      toast({
        title: "Error",
        description: error.message || 'Failed to share goal',
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = () => {
    if (!goal || !goal.id) return;
    router.push(`/dashboard/goals/${goal.id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Goal</h2>
        <p className="text-white/70 mb-4">{error}</p>
        <Link href="/dashboard/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Goal Not Found</h2>
        <p className="text-white/70 mb-4">This goal may have been deleted or doesn&apos;t exist.</p>
        <Link href="/dashboard/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    );
  }

  // Calculate progress if deadline exists
  const calculateProgress = () => {
    if (!goal.deadline || !goal.createdAt) return 0;
    
    try {
      const createdAtDate = typeof goal.createdAt === 'string' 
        ? parseISO(goal.createdAt) 
        : goal.createdAt;
      
      const deadlineDate = typeof goal.deadline === 'string'
        ? parseISO(goal.deadline)
        : goal.deadline;
        
      const now = new Date();
      const totalDuration = deadlineDate.getTime() - createdAtDate.getTime();
      const elapsed = now.getTime() - createdAtDate.getTime();
      
      // Protect against NaN results
      if (totalDuration <= 0) return 0;
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  };

  const progress = calculateProgress();
  const timeLeft = goal.deadline 
    ? formatDistance(
        typeof goal.deadline === 'string' ? parseISO(goal.deadline) : goal.deadline,
        new Date(),
        { addSuffix: true }
      )
    : 'No deadline';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/goals"
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{goal.title}</h1>
            <div className="flex items-center gap-2 text-white/70">
              <Tag className="w-4 h-4" />
              <span>{goal.itemCategory}</span>
              {goal.createdAt && (
                <>
                  <span>•</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Created {formatDistance(
                    typeof goal.createdAt === 'string' ? parseISO(goal.createdAt) : goal.createdAt,
                    new Date(),
                    { addSuffix: true }
                  )}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleShareGoal}
          >
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleEditGoal}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={openDeleteDialog}
            disabled={isDeleting}
          >
            <Trash className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Manager */}
      <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
        <GoalStatusManager goal={goal} onStatusChange={handleStatusChange} />
      </div>

      {/* Goal Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="deals">Matched Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Goal Details */}
          <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg space-y-6">
            <h2 className="text-lg font-semibold">Goal Details</h2>

            {/* Category Information */}
            {goal.itemCategory && (
              <div>
                <div className="text-sm text-white/70 mb-1">Category</div>
                <p className="text-white/90">{goal.itemCategory}</p>
              </div>
            )}
            
            {/* Deadline & Progress */}
            {goal.deadline && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/70">Deadline</div>
                  <div className="text-white/90">{timeLeft}</div>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-right text-white/70 text-xs">
                  {!isNaN(progress) ? `${Math.round(progress)}% Complete` : '0% Complete'}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex flex-col items-center py-8">
              <Info className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics</h3>
              <p className="text-white/70 text-center max-w-md">
                Analytics for this goal are available in the detailed view.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex flex-col items-center py-8">
              <Info className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Matched Deals</h3>
              <p className="text-white/70 text-center max-w-md">
                Deals matching this goal will appear here once found.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
  const [isMounted, setIsMounted] = useState(false);
  
  const searchParams = useSearchParams();
  const goalId = searchParams?.get('id');
  
  const { data: goals, isLoading, error } = useGoals();

  useEffect(() => {
    setIsMounted(true);
    
    if (error) {
      toast({
        title: 'Error loading goals',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  // If the component is not mounted yet (during SSR), show a loader
  if (!isMounted) {
    return <Loader />;
  }

  // If we have a goalId in the query params, show the goal detail view
  if (goalId) {
    return <GoalDetailView goalId={goalId} />;
  }

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
              <FilterIcon className="h-4 w-4 mr-2" />
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

      {/* Goals List */}
      <div className="space-y-8">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/[0.05] border border-white/10 rounded-xl p-7.5">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="pt-2">
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredGoals.length > 0 ? (
          // Grid of goals
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <Link
                key={goal.id}
                href={`/dashboard/goals?id=${goal.id}`}
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

                <div className="space-y-4">
                  {/* Price Constraints */}
                  {(goal.constraints?.min_price !== undefined || goal.constraints?.max_price !== undefined) && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-white/60" />
                      <span className="text-sm">
                        {goal.constraints?.min_price !== undefined ? `$${goal.constraints.min_price}` : '$0'} 
                        {' - '} 
                        {goal.constraints?.max_price !== undefined ? `$${goal.constraints.max_price}` : 'Any'}
                      </span>
                    </div>
                  )}

                  {/* Item Category */}
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-white/60" />
                    <span className="text-sm">{goal.item_category || 'General'}</span>
                  </div>

                  {/* Statistics - Use analytics.total_matches if available */}
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-white/60" />
                    <span className="text-sm">{goal.analytics?.total_matches || 0} matches</span>
                  </div>

                  {/* View Details Button */}
                  <button className="mt-2 w-full py-2 text-center text-sm bg-white/[0.05] border border-white/10 rounded-md hover:bg-white/[0.1] transition flex items-center justify-center gap-1">
                    <span>View Details</span>
                    <ChevronDown className="h-3 w-3 rotate-270" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // No goals found
          <div className="py-12 text-center bg-white/[0.02] border border-white/10 rounded-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.05] mb-4">
              <Target className="h-8 w-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Goals Found</h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No goals match your search criteria "${searchQuery}".`
                : 'You haven\'t created any goals yet. Goals help you find the perfect deals.'
              }
            </p>
            <Link
              href="/dashboard/goals/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-500/80 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Goal</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 