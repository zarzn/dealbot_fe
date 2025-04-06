import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronLeft,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ChartLine,
  Info,
  Shield
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import DealAnalysis from './DealAnalysis';
import ShareButton from './ShareButton';
import { BiEdit } from 'react-icons/bi';
import { FiMoreVertical } from 'react-icons/fi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUserStore } from '@/stores/userStore';
import { walletService } from '@/services/wallet';

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

/**
 * Prevents click events from bubbling up to parent elements
 * Useful for preventing navigation when clicking on interactive elements within links
 */
const stopPropagation = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
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
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(
    localStorage.getItem('has_used_analysis_feature') !== 'true'
  );
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userStore = useUserStore();

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

  const handleDeleteDeal = async () => {
    try {
      await dealsService.deleteDeal(dealId);
      toast.success("Deal deleted successfully");
      
      if (onDelete) {
        onDelete();
      } else {
        // Using the correct navigation method for the App Router with query params
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

  const handleEdit = () => {
    router.push(`/dashboard/deals/edit?id=${dealId}`);
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

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check for cached analysis
      const cachedAnalysis = dealsService.getCachedAnalysis(dealId);
      if (cachedAnalysis && cachedAnalysis.status === 'completed') {
        console.log('Using cached analysis from dealsService');
        setAnalysis(cachedAnalysis);
        setIsLoading(false);
        return;
      }
      
      // If not in cache, fetch from API
      const response = await dealsService.getDealAnalysis(dealId);
      setAnalysis(response);
      
      // Update first-time user status if this is a valid analysis
      if (response.status === 'completed') {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
    } catch (error: any) {
      console.error('Error fetching deal analysis:', error);
      if (error.response?.status !== 404) {
        setError(error.message || 'Failed to fetch analysis');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestAnalysis = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await dealsService.analyzeDeal(dealId);
      setAnalysis(response);
      
      toast.success('Analysis requested successfully!');
      
      // If this was a first-time user, update the status
      if (isFirstTimeUser) {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
      
      // Start polling for updates
      startPolling();
      
      // Update the token balance after successful analysis request
      try {
        await walletService.refreshBalanceAndUpdateStore();
        console.log('[DealDetail] Updated token balance after analysis request');
      } catch (balanceError) {
        console.error('[DealDetail] Failed to update balance after analysis request:', balanceError);
      }
    } catch (error: any) {
      console.error('Error requesting deal analysis:', error);
      setError(error.message || 'Failed to request analysis');
      
      if (error.response?.status === 402) {
        toast.error('Insufficient tokens. Please purchase more tokens to use this feature.');
      } else {
        toast.error('Failed to request analysis. Please try again.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await dealsService.getDealAnalysis(dealId);
        setAnalysis(response);
        
        // Stop polling once we have a completed status
        if (response.status === 'completed') {
          // Update first-time user status
          localStorage.setItem('has_used_analysis_feature', 'true');
          setIsFirstTimeUser(false);
          
          // Stop polling
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          toast.success('Deal analysis completed!');
        } else if (response.status === 'error') {
          // Stop polling on failure
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          toast.error('Analysis failed. Please try again.');
        }
      } catch (error) {
        console.error('Error polling for analysis:', error);
        // Stop polling on error
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 5000); // Poll every 5 seconds
  };
  
  // Clean up polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

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
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
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
                            preserve-color
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
                  </div>
                </div>
              </CardHeader>
              
              <Divider className="mx-6" />
              
              <CardContent className="pt-4">
                {/* Prominent Image Display - Full width */}
                <div 
                  className="relative w-full rounded-lg overflow-hidden bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition-all hover:from-white/[0.08] hover:to-white/[0.04] duration-300 cursor-pointer mb-6 border border-white/10 shadow-xl"
                  onClick={() => setIsImageDialogOpen(true)}
                >
                  <div className="relative w-full" style={{ height: '400px' }}>
                      {deal?.image_url ? (
                        <Image
                          src={deal.image_url}
                          alt={deal.title || 'Deal Image'}
                          fill
                          className="object-contain hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                        priority
                          onError={(e) => {
                            // Set fallback image to our SVG placeholder
                            e.currentTarget.src = '/placeholder-deal.svg';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="h-32 w-32 text-white/30" />
                        </div>
                      )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-center">
                    <div className="text-sm text-white/80">Click to view full size image</div>
                    {getAnalysisScore(analysis) > 0 && (
                      <div className="ml-auto bg-white/[0.1] border border-white/20 rounded-full px-3 py-1 flex items-center">
                        <span className="text-sm font-medium text-white mr-2">AI Score:</span>
                        <span className={`text-sm font-bold preserve-color ${
                          getAnalysisScore(analysis) >= 0.8 ? 'text-green-500' : 
                          getAnalysisScore(analysis) >= 0.6 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}>
                          {Math.round(getAnalysisScore(analysis) * 10)}/10
                        </span>
                      </div>
                    )}
                  </div>
                    </div>
                    
                {/* Deal content section */}
                <div className="space-y-6">
                  {/* Deal Description */}
                  {deal.description && (
                    <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/80">{deal.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Shipping Information */}
                  {deal.shipping_info && (
                    <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Truck className="h-5 w-5 mr-2" />
                          Shipping Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {deal.shipping_info.free_shipping && (
                            <div className="flex items-center text-green-400">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Free Shipping
                        </div>
                          )}
                          
                          {typeof deal.shipping_info.cost === 'number' && !deal.shipping_info.free_shipping && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Shipping Cost: ${deal.shipping_info.cost.toFixed(2)}
                          </div>
                        )}
                          
                          {deal.shipping_info.estimated_days && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Estimated Delivery: {deal.shipping_info.estimated_days} days
                      </div>
                          )}
                          
                          {deal.shipping_info.provider && (
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2" />
                              Shipping Provider: {deal.shipping_info.provider}
                        </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Verification Details */}
                  {deal.verified && (
                    <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-blue-400" />
                          Verification Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-blue-400">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            This deal has been verified as authentic
                          </div>
                          
                          <div className="text-sm text-white/70">
                            <p>Our verification process ensures that:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>The seller is legitimate and has a good reputation</li>
                              <li>The product is as described</li>
                              <li>The price is accurately reported</li>
                              <li>The offer is currently valid</li>
                            </ul>
                          </div>
                          
                          {deal.created_at && (
                            <div className="text-sm text-white/70 mt-2">
                              <p>Verified on: {formatDate(deal.created_at)}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Deal Analysis - Single instance */}
                  <DealAnalysis dealId={dealId} />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - takes 1 column */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                        <Button 
                  className={`w-full ${isTracking ? 'bg-purple/20 text-purple border border-purple/20' : ''}`} 
                          onClick={handleTrackDeal}
                        >
                          <FiBookmark className="mr-2 h-4 w-4" />
                  {isTracking ? 'Untrack Deal' : 'Track This Deal'}
                        </Button>
                          
                          {deal?.url && (
                            <Button
                              variant="outline"
                    className="w-full flex items-center justify-center gap-1 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                            >
                              <Link href={deal.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center text-white">
                                <FiExternalLink size={16} className="mr-2" />
                      Visit Deal Website
                              </Link>
                            </Button>
                          )}
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-1 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <FiTrash2 className="mr-2 h-4 w-4 text-red-400" />
                  Delete Deal
                </Button>
                      </CardContent>
                    </Card>
                    
            {/* Deal Summary Card */}
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                      <CardHeader>
                <CardTitle>Deal Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                {/* Price Info */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-white/70">Current Price</div>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                    ${typeof deal?.price === 'number' ? deal.price.toFixed(2) : parseFloat(deal?.price || '0').toFixed(2)}
                    {deal?.original_price && (
                      <span className="text-sm line-through text-white/50">
                        ${typeof deal.original_price === 'number' 
                          ? deal.original_price.toFixed(2) 
                          : parseFloat(deal.original_price || '0').toFixed(2)}
                                  </span>
                                )}
                              </div>
                  {deal?.original_price && (
                    <Badge className="bg-green-500/20 text-green-400">
                      {Math.round(100 - ((typeof deal.price === 'number' ? deal.price : parseFloat(deal.price || '0')) / 
                        (typeof deal.original_price === 'number' ? deal.original_price : parseFloat(deal.original_price || '0'))) * 100)}% OFF
                    </Badge>
                  )}
                            </div>
                
                <Divider />
                
                {/* Key Info */}
                <div className="space-y-3">
                  {/* Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70 flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Status
                    </span>
                    <Badge 
                      className={`
                        preserve-color
                        ${deal.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                        deal.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'}
                      `}
                    >
                      {deal.status?.charAt(0).toUpperCase() + deal.status?.slice(1) || 'Unknown'}
                    </Badge>
                  </div>
                  
                  {/* Market */}
                  {deal?.market_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        Market
                      </span>
                      <span className="text-sm font-medium text-white">
                        {(deal as any).market_name || 'Marketplace'}
                      </span>
                          </div>
                        )}
                        
                  {/* Source */}
                  {deal?.source && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        Source
                      </span>
                      <span className="text-sm font-medium text-white">{deal.source}</span>
                                  </div>
                                )}
                  
                  {/* Category */}
                  {deal?.category && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        Category
                      </span>
                      <span className="text-sm font-medium text-white">{deal.category}</span>
                          </div>
                        )}
                        
                  {/* Posted Date */}
                  {deal?.created_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Posted
                      </span>
                      <span className="text-sm font-medium text-white">{formatDate(deal.created_at)}</span>
                          </div>
                        )}
                        
                        {/* Expiration Date */}
                  {deal?.expires_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Expires
                      </span>
                      <span className="text-sm font-medium text-white">{formatDate(deal.expires_at)}</span>
                              </div>
                  )}
                  
                  {/* Seller Rating */}
                  {deal?.seller_info && typeof deal.seller_info.rating === 'number' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        Seller Rating
                      </span>
                      <span className="text-sm font-medium text-white flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        {deal.seller_info.rating.toFixed(1)}
                        {deal.seller_info.reviews && (
                          <span className="text-white/50 ml-1">({deal.seller_info.reviews})</span>
                        )}
                      </span>
                          </div>
                        )}

                        {/* Availability */}
                  {deal?.availability && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                        Availability
                      </span>
                      <span className="text-sm font-medium text-white">
                                {deal.availability.in_stock 
                                  ? (deal.availability.quantity 
                                      ? `${deal.availability.quantity} in stock` 
                                      : 'In Stock') 
                                  : 'Out of Stock'}
                      </span>
                          </div>
                        )}
                </div>
              </CardContent>
            </Card>
            
            {/* Price History Card */}
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent>
                {priceHistory && priceHistory.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-40 relative">
                      {/* Price history chart would go here */}
                      <div className="text-center text-sm text-white/50 absolute inset-0 flex items-center justify-center">
                        <ChartLine className="h-10 w-10 text-white/30 mb-2 mr-2" />
                        Price trend visualization
                              </div>
                            </div>
                    <div className="space-y-2">
                      {priceHistory.slice(0, 3).map((historyItem, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-white/10">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-white/50" />
                            <span>{formatDate(historyItem.date)}</span>
                          </div>
                          <span className={historyItem.price < (priceHistory[index+1]?.price || historyItem.price) ? 'text-green-400' : 'text-red-400'}>
                            ${typeof historyItem.price === 'number' ? historyItem.price.toFixed(2) : historyItem.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-white/50 flex flex-col items-center">
                    <ChartLine className="h-10 w-10 text-white/30 mb-2" />
                    <p>No price history available yet</p>
                    <p className="text-xs mt-1">Track this deal to see price changes</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
            {/* Move Seller Information to sidebar (after Price History) */}
            {/* Seller Information */}
            {deal.seller_info && (
              <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                        <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Seller Information
                  </CardTitle>
                        </CardHeader>
                        <CardContent>
                  <div className="space-y-3">
                    {deal.seller_info.name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Seller: {deal.seller_info.name}
                          </div>
                    )}
                    
                    {typeof deal.seller_info.rating === 'number' && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        Rating: {deal.seller_info.rating.toFixed(1)}
                        {deal.seller_info.reviews && (
                          <span className="text-white/50 ml-1">({deal.seller_info.reviews} reviews)</span>
                    )}
                  </div>
                    )}
                    
                    {deal.seller_info.condition && (
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Condition: {deal.seller_info.condition}
                      </div>
                    )}
                    
                    {deal.seller_info.warranty && (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Warranty: {deal.seller_info.warranty}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
            )}
            
            {/* Similar Deals */}
            {deal && 'similar_products' in deal && Array.isArray((deal as any).similar_products) && (deal as any).similar_products.length > 0 && (
              <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Similar Deals
                  </CardTitle>
              </CardHeader>
                <CardContent className="space-y-3">
                  {(deal as any).similar_products.slice(0, 3).map((similarDeal) => (
                    <Link 
                      key={similarDeal.id} 
                      href={`/dashboard/deals/${similarDeal.id}`}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.05]"
                    >
                      <div className="w-12 h-12 relative bg-white/[0.05] rounded">
                        {similarDeal.image_url ? (
                          <Image
                            src={similarDeal.image_url}
                            alt={similarDeal.title}
                            fill
                            className="object-contain rounded"
                          />
                        ) : (
                          <ShoppingBag className="h-6 w-6 text-white/30 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{similarDeal.title}</div>
                        <div className="text-xs text-white/70">${typeof similarDeal.price === 'number' ? similarDeal.price.toFixed(2) : similarDeal.price}</div>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      ) : (
        <DealDetailSkeleton />
      )}

      {/* Add image dialog for full-size view */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[80vw] h-[80vh] flex items-center justify-center p-0 bg-[#121212]/80 backdrop-blur-xl">
          {deal?.image_url ? (
            <div className="relative h-full w-full">
              <Image
                src={deal.image_url}
                alt={deal.title || 'Deal Image'}
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-deal.svg';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ShoppingBag className="h-32 w-32 text-white/30" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 