import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { dealsService } from '@/services/deals';
import { DealResponse, AIAnalysis, PriceHistory, Deal } from '@/types/deals';
import Image from 'next/image';
import Link from 'next/link';
import { FiExternalLink, FiEdit2, FiTrash2, FiRefreshCw, FiBookmark, FiStar, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  ShoppingBag,
  Tag,
  Truck,
  User,
  AlertTriangle,
  RefreshCw,
  Star,
  ShoppingCart,
  ChevronLeft
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import DealAnalysis from './DealAnalysis';
import ShareButton from './ShareButton';

// Define a divider component as a fallback if the separator is not available yet
const Divider: React.FC<{className?: string}> = ({className}) => (
  <hr className={`border-t border-white/10 my-4 ${className || ''}`} />
);

// Use a try-catch to import the Separator if available
let Separator = Divider;
try {
  // This will be replaced by the actual import when the component exists
  Separator = require('@/components/ui/separator').Separator;
} catch (e) {
  console.warn('Separator component not found, using fallback divider');
}

interface DealDetailProps {
  dealId: string;
  onDelete?: () => void;
  onUpdate?: (updatedDeal: Deal) => void;
  onBack?: () => void;
  onRefresh?: (updatedDeal: Deal) => void;
  isLoading?: boolean;
}

// Loading skeleton component for DealDetail
export const DealDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="p-6">
        {/* Header/Title area */}
        <div className="flex flex-col space-y-3 mb-6">
          <div className="h-8 bg-white/[0.1] rounded w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-white/[0.1] rounded-full"></div>
            <div className="h-6 w-24 bg-white/[0.1] rounded-full"></div>
          </div>
        </div>
        
        {/* Image placeholder */}
        <div className="h-56 bg-white/[0.1] rounded-lg mb-6"></div>
        
        {/* Price section */}
        <div className="flex justify-between mb-6">
          <div className="h-10 bg-white/[0.1] rounded w-32"></div>
          <div className="h-10 bg-white/[0.1] rounded w-24"></div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="h-10 bg-white/[0.1] rounded w-28"></div>
          <div className="h-10 bg-white/[0.1] rounded w-28"></div>
          <div className="h-10 bg-white/[0.1] rounded w-28"></div>
        </div>
        
        <div className="h-px bg-white/10 w-full my-6"></div>
        
        {/* Description section */}
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-white/[0.1] rounded w-full"></div>
          <div className="h-4 bg-white/[0.1] rounded w-full"></div>
          <div className="h-4 bg-white/[0.1] rounded w-3/4"></div>
        </div>
        
        {/* Details section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-6 w-6 bg-white/[0.1] rounded-full"></div>
              <div className="h-4 bg-white/[0.1] rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Error state component for DealDetail
export const DealDetailError: React.FC<{
  message?: string;
  onRetry?: () => void;
  dealId?: string;
}> = ({ message = "Failed to load deal information", onRetry, dealId }) => {
  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col items-center text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Unable to load deal</h3>
        <p className="text-white/70 mb-6 max-w-md">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          {dealId && (
            <Link href={`/dashboard/deals/edit/${dealId}`} passHref>
              <Button variant="outline">
                View in Editor
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to safely access the score from the analysis object with the new structure
const getAnalysisScore = (analysis: AIAnalysis | null): number => {
  if (!analysis || !analysis.analysis || analysis.analysis.score === undefined) {
    return 0;
  }
  return analysis.analysis.score;
};

// Function to safely access the summary from the analysis object with the new structure
const getAnalysisSummary = (analysis: AIAnalysis | null): string => {
  if (!analysis || !analysis.analysis) {
    return '';
  }
  // Summary might be in the analysis object or in recommendations
  if (analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0) {
    return analysis.analysis.recommendations[0];
  }
  return '';
};

// Function to safely access the recommendations from the analysis object
const getAnalysisRecommendations = (analysis: AIAnalysis | null): string[] => {
  if (!analysis || !analysis.analysis || !analysis.analysis.recommendations) {
    return [];
  }
  return analysis.analysis.recommendations;
};

export const DealDetail: React.FC<DealDetailProps> = ({ 
  dealId, 
  onDelete,
  onUpdate,
  onBack,
  onRefresh,
  isLoading: isParentLoading = false
}) => {
  const router = useRouter();
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    fetchDealData();
  }, [dealId]);

  const fetchDealData = async () => {
    if (!dealId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the deal details
      const dealData = await dealsService.getDealDetails(dealId);
      setDeal(dealData);
      setIsTracking(dealData.is_tracked || false);
      
      // Try to fetch AI analysis if available
      try {
        const analysisData = await dealsService.getDealAnalysis(dealId);
        setAnalysis(analysisData);
      } catch (analysisError) {
        console.warn("Could not fetch AI analysis:", analysisError);
        // Non-critical error, don't show to user
      }
      
      // Try to fetch price history if available - simplified for now
      setPriceHistory([]);
      
    } catch (err) {
      console.error("Error fetching deal data:", err);
      setError("Failed to load deal information. Please try again.");
      toast.error("Failed to load deal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshDeal = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // If parent component provides a refresh handler, use that
      if (onRefresh && deal) {
        const refreshedDeal = await dealsService.refreshDeal(deal.id);
        onRefresh(refreshedDeal as Deal);
        toast.success("Deal refreshed successfully");
      } else {
        // Fallback to local refresh
        await fetchDealData();
        toast.success("Deal refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing deal:", error);
      toast.error("Could not refresh deal");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditDeal = () => {
    // Using the correct navigation method for the App Router
    router.push(`/dashboard/deals/edit/${dealId}`);
  };

  const handleDeleteDeal = async () => {
    try {
      await dealsService.deleteDeal(dealId);
      toast.success("Deal deleted successfully");
      
      if (onDelete) {
        onDelete();
      } else {
        // Using the correct navigation method for the App Router
        router.push('/dashboard/deals');
      }
    } catch (err) {
      console.error("Error deleting deal:", err);
      toast.error("Failed to delete deal");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTrackDeal = async () => {
    try {
      if (isTracking) {
        await dealsService.untrackDeal(dealId);
        setIsTracking(false);
        toast.success("Deal untracked");
      } else {
        await dealsService.trackDeal(dealId);
        setIsTracking(true);
        toast.success("Deal tracked");
      }
      
      // Update the deal data
      setDeal(prev => prev ? { ...prev, is_tracked: !isTracking } : null);
      
      // Call onUpdate if provided
      if (onUpdate && deal) {
        onUpdate({
          ...deal as unknown as Deal,
          is_tracked: !isTracking
        });
      }
    } catch (err) {
      console.error("Error tracking deal:", err);
      toast.error("Failed to update tracking");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const timeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      console.error("Error calculating time ago:", e);
      return '';
    }
  };

  if (isLoading) {
    return <DealDetailSkeleton />;
  }

  if (error) {
    return <DealDetailError 
      message={error} 
      onRetry={fetchDealData} 
      dealId={dealId} 
    />;
  }
  
  if (!deal) {
    return <DealDetailError 
      message="Deal not found or has been removed" 
      dealId={dealId}
    />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Back button (mobile only) */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="md:hidden mb-4 -ml-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleDeleteDeal}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Deal'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {deal ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main deal info - takes up 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Card */}
            <Card className="w-full bg-background/60 backdrop-blur-sm border">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{deal?.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {deal?.category && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {deal.category}
                        </Badge>
                      )}
                      
                      {deal.status && (
                        <Badge 
                          className={`
                            flex items-center gap-1
                            ${deal.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                            deal.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'}
                          `}
                        >
                          {deal.status === 'active' ? 
                            <FiCheckCircle className="w-3 h-3" /> : 
                            <FiAlertTriangle className="w-3 h-3" />
                          }
                          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                        </Badge>
                      )}
                      
                      {deal.featured && (
                        <Badge className="bg-purple/20 text-purple flex items-center gap-1">
                          <FiStar className="w-3 h-3" />
                          Featured
                        </Badge>
                      )}
                      
                      {deal.verified && (
                        <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      
                      {deal.created_at && (
                        <span className="text-sm text-white/60 flex items-center">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {timeAgo(deal.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshDeal}
                      disabled={isRefreshing}
                      className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                    >
                      <FiRefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    
                    <ShareButton
                      deal={deal as Deal}
                      variant="outline"
                      size="sm"
                      className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditDeal}
                      className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                    >
                      <FiEdit2 className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <Divider className="mx-6" />
              
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left column - Image */}
                  <div className="md:col-span-1">
                    <div className="relative aspect-video md:aspect-square rounded-md overflow-hidden bg-white/[0.05] transition-all hover:bg-white/[0.08] duration-300">
                      {deal?.image_url ? (
                        <Image
                          src={deal.image_url}
                          alt={deal.title || 'Deal Image'}
                          fill
                          className="object-contain hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Set fallback image to our SVG placeholder
                            e.currentTarget.src = '/placeholder-deal.svg';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-white/30" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-white">
                          ${typeof deal?.price === 'number' ? deal.price.toFixed(2) : parseFloat(deal?.price || '0').toFixed(2)}
                        </div>
                        
                        {deal?.original_price && (
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-white/50 line-through mb-1">
                              ${typeof deal.original_price === 'number' 
                                ? deal.original_price.toFixed(2) 
                                : parseFloat(deal.original_price || '0').toFixed(2)}
                            </span>
                            <Badge className="bg-green-500/20 text-green-400">
                              {Math.round(100 - ((typeof deal.price === 'number' ? deal.price : parseFloat(deal.price || '0')) / 
                                (typeof deal.original_price === 'number' ? deal.original_price : parseFloat(deal.original_price || '0'))) * 100)}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Source of the deal */}
                      {deal?.source && (
                        <div className="flex items-center text-sm text-white/60 mt-2">
                          <span>Source: {deal.source}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          className={`flex-1 ${isTracking ? 'bg-purple/20 text-purple border border-purple/20' : ''}`} 
                          onClick={handleTrackDeal}
                        >
                          <FiBookmark className="mr-2 h-4 w-4" />
                          {isTracking ? 'Untrack' : 'Track Deal'}
                        </Button>
                        
                        <div className="flex gap-2">
                          <ShareButton
                            deal={deal as Deal}
                            variant="outline"
                            className="bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                          />
                          
                          {deal?.url && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                            >
                              <Link href={deal.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center text-white">
                                <FiExternalLink size={16} className="mr-2" />
                                Visit Deal
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* AI Score if available */}
                      {getAnalysisScore(analysis) > 0.7 && (
                        <div className="bg-white/[0.05] border border-white/10 rounded-lg p-3 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">AI Score</span>
                            <span className={`text-lg font-bold ${
                              getAnalysisScore(analysis) >= 8 ? 'text-green-500' : 
                              getAnalysisScore(analysis) >= 6 ? 'text-yellow-500' : 
                              'text-red-500'
                            }`}>
                              {getAnalysisScore(analysis).toFixed(1)}/10
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right column - Details */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <Card className="w-full bg-background/60 backdrop-blur-sm border">
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{deal?.description}</p>
                      </CardContent>
                    </Card>
                    
                    {/* Deal Information */}
                    <Card className="w-full bg-background/60 backdrop-blur-sm border">
                      <CardHeader>
                        <CardTitle>Deal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Seller Info */}
                        {deal?.seller_info && (
                          <div className="flex items-start gap-2">
                            <User className="h-5 w-5 text-white/50 mt-0.5" />
                            <div>
                              <div className="font-medium text-white">Seller</div>
                              <div className="text-sm text-white/70">
                                {deal.seller_info.name}
                                {deal.seller_info && typeof deal.seller_info.rating === 'number' && (
                                  <span className="ml-2 text-yellow-500 flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3" />
                                    {deal.seller_info.rating.toFixed(1)}
                                    {deal.seller_info.reviews && (
                                      <span className="text-white/50">({deal.seller_info.reviews})</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Shipping Info */}
                        {deal.shipping_info && (
                          <div className="flex items-start gap-2">
                            <Truck className="h-5 w-5 text-white/50 mt-0.5" />
                            <div>
                              <div className="font-medium text-white">Shipping</div>
                              <div className="text-sm text-white/70">
                                {deal.shipping_info.free_shipping 
                                  ? 'Free Shipping' 
                                  : typeof deal.shipping_info.cost === 'number' 
                                    ? `$${deal.shipping_info.cost.toFixed(2)} shipping` 
                                    : 'Shipping cost unavailable'}
                                {deal.shipping_info.estimated_days && (
                                  <div className="mt-1 text-white/50">
                                    Estimated delivery: {deal.shipping_info.estimated_days} days
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Created Date */}
                        {deal.created_at && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-5 w-5 text-white/50 mt-0.5" />
                            <div>
                              <div className="font-medium text-white">Posted On</div>
                              <div className="text-sm text-white/70">
                                {formatDate(deal.created_at)}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Expiration Date */}
                        {deal.expires_at && (
                          <div className="flex items-start gap-2">
                            <Clock className="h-5 w-5 text-white/50 mt-0.5" />
                            <div>
                              <div className="font-medium text-white">Expires</div>
                              <div className="text-sm text-white/70">
                                {formatDate(deal.expires_at)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Availability */}
                        {deal.availability && (
                          <div className="flex items-start gap-2">
                            <ShoppingBag className="h-5 w-5 text-white/50 mt-0.5" />
                            <div>
                              <div className="font-medium text-white">Availability</div>
                              <div className="text-sm text-white/70">
                                {deal.availability.in_stock 
                                  ? (deal.availability.quantity 
                                      ? `${deal.availability.quantity} in stock` 
                                      : 'In Stock') 
                                  : 'Out of Stock'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Market */}
                        {deal.market_id && (
                          <div className="flex items-start gap-2">
                            <ShoppingCart className="h-5 w-5 text-white/50 mt-0.5" />
                            <div>
                              <div className="font-medium text-white">Market</div>
                              <div className="text-sm text-white/70">
                                {deal.market_id}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* AI Deal Analysis */}
                    <DealAnalysis dealId={dealId} />
                    
                    {/* Tags */}
                    {deal?.tags && deal.tags.length > 0 && (
                      <Card className="w-full bg-background/60 backdrop-blur-sm border">
                        <CardHeader>
                          <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {deal.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="bg-white/[0.05] border border-white/10 text-white/70">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - takes 1 column */}
          <div className="space-y-6">
            {/* Deal Information - quick details card */}
            <Card className="w-full bg-background/60 backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ... existing deal information code ... */}
              </CardContent>
            </Card>
            
            {/* Other sidebar content */}
            {/* ... */}
          </div>
        </div>
      ) : (
        <DealDetailSkeleton />
      )}
    </div>
  );
}; 