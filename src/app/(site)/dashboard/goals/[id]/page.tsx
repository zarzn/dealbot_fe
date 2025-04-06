"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, ChevronRight, Share, Edit, Trash, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { goalsService } from '@/services/goals';
import type { Goal } from '@/services/goals';
import { GoalStatusManager } from '@/components/Goals/GoalStatusManager';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistance, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/custom-progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Enhanced types to align with backend
interface GoalAnalytics {
  goal_id: string;
  user_id: string;
  matches_found: number;
  deals_processed: number;
  tokens_spent: number;
  rewards_earned: number;
  success_rate: number;
  best_match_score: number | null;
  average_match_score: number | null;
  active_deals_count: number;
  price_trends: Record<string, any>;
  market_analysis: Record<string, any>;
  deal_history: Array<Record<string, any>>;
  performance_metrics: Record<string, any>;
  start_date: string;
  end_date: string;
  period: string;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  url: string;
  image_url?: string;
  source: string;
  status: string;
  match_score?: number;
  created_at: string;
}

// Extend the Goal type to include additional fields needed
interface ExtendedGoal extends Goal {
  description?: string;
  matchedDeals?: Deal[];
  metadata?: {
    current_price?: number;
    notification_threshold?: number;
    notifications?: {
      email?: boolean;
      inApp?: boolean;
      priceThreshold?: number;
    };
    [key: string]: any;
  };
  notification_threshold?: number;
  notificationSettings?: {
    email?: boolean;
    inApp?: boolean;
    priceThreshold?: number;
  };
  email_notifications?: boolean;
  in_app_notifications?: boolean;
}

export default function GoalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Get goal ID from either path parameter or query parameter
  const pathId = params?.id as string;
  const queryId = searchParams?.get('id');
  const goalId = pathId || queryId;
  
  const [goal, setGoal] = useState<ExtendedGoal | null>(null);
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);

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
      setIsLoadingAnalytics(true);
      
      // Load goal and analytics in parallel
      const [goalData, analyticsData] = await Promise.all([
        goalsService.getGoalById(id),
        goalsService.getGoalAnalytics(id).catch(err => {
          console.error("Error loading analytics:", err);
          return null;
        })
      ]);
      
      setGoal(goalData as ExtendedGoal);
      
      // Handle analytics with type safety
      if (analyticsData) {
        setAnalytics(analyticsData as unknown as GoalAnalytics);
      }
      
      setError(null);
      loadRelatedDeals(id);
    } catch (error: any) {
      console.error("Error loading goal:", error);
      setError(error.message || "Failed to load goal details");
      toast.error(error.message || "Failed to load goal details");
    } finally {
      setIsLoading(false);
      setIsLoadingAnalytics(false);
    }
  };

  // Load related deals for the goal
  const loadRelatedDeals = async (goalId: string) => {
    try {
      setIsLoadingDeals(true);
      // Mock related deals since the API doesn't directly support it
      // In production, this should be replaced with a proper API call
      const mockDeals: Deal[] = [];
      setRelatedDeals(mockDeals);
    } catch (error: any) {
      console.error("Error loading related deals:", error);
      // Don't show a toast for deals error - it's not critical
    } finally {
      setIsLoadingDeals(false);
    }
  };

  // Update the goal status
  const handleStatusChange = async (newStatus: Goal['status']) => {
    if (!goal || !goal.id) return;
    
    try {
      const updatedGoal = await goalsService.updateGoalStatus(goal.id, newStatus);
      setGoal(updatedGoal as ExtendedGoal);
      toast.success(`Goal status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating goal status:", error);
      toast.error(error.message || 'Failed to update goal status');
    }
  };

  // Delete the goal
  const handleDeleteGoal = async () => {
    if (!goal || !goal.id || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await goalsService.deleteGoal(goal.id);
      toast.success("Goal deleted successfully");
      router.push("/dashboard/goals");
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      toast.error(error.message || 'Failed to delete goal');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = () => {
    if (!goal || !goal.id) return;
    setShowDeleteDialog(true);
  };

  // Share the goal
  const handleShareGoal = async () => {
    if (!goal || !goal.id) return;
    
    try {
      const response = await goalsService.shareGoal(goal.id);
      navigator.clipboard.writeText(response.shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error: any) {
      console.error("Error sharing goal:", error);
      toast.error(error.message || 'Failed to share goal');
    }
  };

  // Edit the goal
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

            {/* Description if available */}
            {goal.description && (
              <div>
                <div className="text-sm text-white/70 mb-1">Description</div>
                <p className="text-white/90">{goal.description}</p>
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

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/70 mb-1">Target Price</div>
                <div className="text-lg font-medium">
                  {goal.constraints?.max_price !== undefined && goal.constraints.max_price !== null
                    ? `$${parseFloat(goal.constraints.max_price.toString()).toFixed(2)}`
                    : '$N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Current Price</div>
                <div className="text-lg font-medium">
                  {goal.metadata?.current_price !== undefined && goal.metadata.current_price !== null
                    ? `$${parseFloat(goal.metadata.current_price.toString()).toFixed(2)}`
                    : '$N/A'}
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div>
              <div className="text-sm text-white/70 mb-2">Constraints</div>
              <div className="space-y-4">
                {/* Keywords */}
                {goal.constraints?.keywords?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.constraints.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/[0.05]"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {goal.constraints?.conditions?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Conditions</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.constraints.conditions.map((condition, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/[0.05] capitalize"
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {goal.constraints?.brands?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Brands</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.constraints.brands.map((brand, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/[0.05]"
                        >
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {goal.constraints?.features?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Required Features</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.constraints.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/[0.05]"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="text-sm text-white/70 mb-2">Notifications</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <span className={
                    (goal.notifications?.email || 
                     goal.metadata?.notifications?.email || 
                     goal.notificationSettings?.email ||
                     goal.email_notifications) ? 'text-green-400' : 'text-red-400'
                  }>
                    {(goal.notifications?.email || 
                      goal.metadata?.notifications?.email || 
                      goal.notificationSettings?.email ||
                      goal.email_notifications) ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>In-App Notifications</span>
                  <span className={
                    (goal.notifications?.inApp || 
                     goal.metadata?.notifications?.inApp || 
                     goal.notificationSettings?.inApp ||
                     goal.in_app_notifications) ? 'text-green-400' : 'text-red-400'
                  }>
                    {(goal.notifications?.inApp || 
                      goal.metadata?.notifications?.inApp || 
                      goal.notificationSettings?.inApp ||
                      goal.in_app_notifications) ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price Drop Threshold</span>
                  <span>
                    {goal.notification_threshold != null ? 
                      `${(parseFloat(goal.notification_threshold.toString()) * 100).toFixed(0)}%` : 
                    (goal.metadata?.notification_threshold != null ? 
                      `${(parseFloat(goal.metadata.notification_threshold.toString()) * 100).toFixed(0)}%` :
                    (goal.notifications?.priceThreshold != null ? 
                      `${(parseFloat(goal.notifications.priceThreshold.toString()) * 100).toFixed(0)}%` :
                    (goal.metadata?.notifications?.priceThreshold != null ? 
                      `${(parseFloat(goal.metadata.notifications.priceThreshold.toString()) * 100).toFixed(0)}%` :
                      'N/A%')))}
                  </span>
                </div>
              </div>
            </div>

            {/* Price History */}
            {goal.priceHistory && goal.priceHistory.length > 0 && (
              <div>
                <div className="text-sm text-white/70 mb-2">Price History</div>
                <div className="space-y-2">
                  {goal.priceHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/90">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">${entry.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {isLoadingAnalytics ? (
            <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <Skeleton className="h-32 w-full" />
            </Card>
          ) : analytics ? (
            <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-lg font-semibold mb-4">Goal Analytics</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-white/70 mb-1">Success Rate</div>
                  <div className="text-2xl font-semibold">
                    {analytics.success_rate != null ? 
                      `${(analytics.success_rate * 100).toFixed(0)}%` : 
                      '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/70 mb-1">Tokens Spent</div>
                  <div className="text-2xl font-semibold">
                    {analytics.tokens_spent != null ? 
                      analytics.tokens_spent.toFixed(2) : 
                      '0'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/[0.05] rounded-lg p-3">
                  <div className="text-sm text-white/70">Matches Found</div>
                  <div className="text-lg font-semibold">
                    {analytics.matches_found || 0}
                  </div>
                </div>
                <div className="bg-white/[0.05] rounded-lg p-3">
                  <div className="text-sm text-white/70">Deals Processed</div>
                  <div className="text-lg font-semibold">
                    {analytics.deals_processed || 0}
                  </div>
                </div>
                <div className="bg-white/[0.05] rounded-lg p-3">
                  <div className="text-sm text-white/70">Best Match Score</div>
                  <div className="text-lg font-semibold">
                    {analytics.best_match_score != null ? 
                      `${(analytics.best_match_score * 100).toFixed(0)}%` : 
                      '0%'}
                  </div>
                </div>
                <div className="bg-white/[0.05] rounded-lg p-3">
                  <div className="text-sm text-white/70">Avg Match Score</div>
                  <div className="text-lg font-semibold">
                    {analytics.average_match_score != null ? 
                      `${(analytics.average_match_score * 100).toFixed(0)}%` : 
                      '0%'}
                  </div>
                </div>
              </div>

              {/* Show market analysis if available */}
              {analytics.market_analysis && Object.keys(analytics.market_analysis).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-3">Market Analysis</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.market_analysis).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-white/70">{key.replace(/_/g, ' ')}</span>
                        <span>{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics Not Available</h3>
              <p className="text-white/70">Analytics data is not yet available for this goal.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          {isLoadingDeals ? (
            <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <Skeleton className="h-32 w-full" />
            </Card>
          ) : relatedDeals && relatedDeals.length > 0 ? (
            <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg space-y-4">
              <h2 className="text-lg font-semibold mb-4">Matched Deals</h2>
              
              {relatedDeals.map((deal) => (
                <div 
                  key={deal.id}
                  className="bg-white/[0.05] hover:bg-white/[0.07] transition rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-white/90">{deal.title}</h3>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-white/70">Source: {deal.source}</span>
                      {deal.match_score && (
                        <>
                          <span className="text-white/50">•</span>
                          <span className="text-white/70">
                            Match: {(deal.match_score * 100).toFixed(0)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-semibold">${deal.price.toFixed(2)}</div>
                    {deal.original_price && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-white/50">
                          ${deal.original_price.toFixed(2)}
                        </span>
                        {deal.discount_percentage && (
                          <span className="text-xs bg-green-800/30 text-green-400 px-1.5 py-0.5 rounded">
                            {deal.discount_percentage}% off
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 mt-2" />
                </div>
              ))}
              
              <div className="text-center pt-2">
                <Button variant="link" onClick={() => router.push(`/dashboard/deals?goal=${goal.id}`)}>
                  View All Matched Deals
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Matched Deals Yet</h3>
              <p className="text-white/70 mb-4">We haven&apos;t found any deals that match your goal criteria yet.</p>
              <Button onClick={() => {
                toast.success("Finding matches for your goal...");
                // In production, call the actual API method
              }}>
                Find Matches Now
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Goal Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex items-start gap-3 p-3 bg-amber-500/10 text-amber-400 rounded-lg text-sm">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Tokens will not be returned</p>
              <p className="text-amber-400/80 mt-1">
                Tokens spent on goal creation and operations cannot be refunded after deletion.
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
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
              {isDeleting ? "Deleting..." : "Delete Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 