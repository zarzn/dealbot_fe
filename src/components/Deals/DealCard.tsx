import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Tag, Clock, Truck, ShoppingBag, ThumbsUp, BarChart2, Package, Shield, FileCheck, Share, ChevronDown, ChevronUp, Brain, RefreshCw, RotateCw, TrendingUp, DollarSign, Award, CheckCircle } from 'lucide-react';
import { FiHeart, FiEye, FiStar, FiCheckCircle, FiShare2, FiAlertTriangle } from 'react-icons/fi';
import { Deal, DealSuggestion, AIAnalysis } from '@/types/deals';
import { calculateDiscount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import ShareButton from './ShareButton';
import { dealsService } from '@/services/deals';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, AlertTriangle } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  onTrack?: (deal: Deal) => void;
  onFavorite?: (dealId: string) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
  isSelected?: boolean;
  showActions?: boolean;
}

export function DealCard({ 
  deal, 
  onTrack, 
  onFavorite, 
  isFavorite = false, 
  isLoading = false, 
  isSelected = false,
  showActions = true
}: DealCardProps) {
  // State for tracking analysis
  const [analysisExpanded, setAnalysisExpanded] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(
    localStorage.getItem('has_used_analysis_feature') !== 'true'
  );
  const [isRequestingAnalysis, setIsRequestingAnalysis] = useState<boolean>(false);

  // Reference for the polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging to track what data is being received
  useEffect(() => {
    console.log("Deal card data:", deal);
    
    // Check local storage for persisted analysis state
    const expandedDeals = JSON.parse(localStorage.getItem('expanded_deal_analysis') || '{}');
    if (expandedDeals[deal.id]) {
      setAnalysisExpanded(true);
      // Load analysis data if the card is expanded
      fetchAnalysis();
    }

    // Check if user has used the analysis feature before
    const hasUsedAnalysisFeature = localStorage.getItem('has_used_analysis_feature');
    setIsFirstTimeUser(!hasUsedAnalysisFeature);
  }, [deal.id]);

  // Get a formatted date string
  const formattedDate = React.useMemo(() => {
    if (!deal.created_at) return '';
    try {
      return formatDistanceToNow(new Date(deal.created_at), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  }, [deal.created_at]);

  // Helper function to convert price to number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  // Calculate discount percentage
  const discountPercent = React.useMemo(() => {
    if (deal.original_price && deal.price) {
      const originalPrice = toNumber(deal.original_price);
      const currentPrice = toNumber(deal.price);
      if (originalPrice > 0) {
        return Math.round(100 - (currentPrice / originalPrice) * 100);
      }
    }
    return 0;
  }, [deal.original_price, deal.price]);

  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-500 preserve-color';
    if (score >= 6) return 'text-yellow-500 preserve-color';
    if (score >= 4) return 'text-orange-500 preserve-color';
    return 'text-red-500 preserve-color';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(deal.id);
    }
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTrack) {
      onTrack(deal);
    }
  };

  // Toggle analysis expanded state
  const toggleAnalysisExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update state
    const newExpandedState = !analysisExpanded;
    setAnalysisExpanded(newExpandedState);
    
    // Persist expanded state to localStorage
    const expandedDeals = JSON.parse(localStorage.getItem('expanded_deal_analysis') || '{}');
    if (newExpandedState) {
      expandedDeals[deal.id] = true;
      // Load analysis if expanding
      fetchAnalysis();
    } else {
      delete expandedDeals[deal.id];
    }
    localStorage.setItem('expanded_deal_analysis', JSON.stringify(expandedDeals));
  };

  // Fetch existing analysis
  const fetchAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      setAnalysisError(null);
      
      // First check for cached analysis
      const cachedAnalysis = dealsService.getCachedAnalysis(deal.id);
      if (cachedAnalysis && cachedAnalysis.status === 'completed') {
        console.log('Using cached analysis from dealsService');
        setAnalysis(cachedAnalysis);
        setAnalysisLoading(false);
        return;
      }
      
      // If not in cache, fetch from API
      const response = await dealsService.getDealAnalysis(deal.id);
      setAnalysis(response);
      
      // Update first-time user status if this is a valid analysis
      if (response && response.status === 'completed') {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
    } catch (error: any) {
      console.error('Error fetching deal analysis:', error);
      if (error.response?.status !== 404) {
        setAnalysisError(error.message || 'Failed to fetch analysis');
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Request new analysis
  const requestAnalysis = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsRequestingAnalysis(true);
      setAnalysisError(null);
      
      const response = await dealsService.analyzeDeal(deal.id);
      setAnalysis(response);
      
      toast.success('Analysis requested successfully!');
      
      // If this was a first-time user, update the status
      if (isFirstTimeUser) {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
      
      // Start polling for updates
      startPolling();
    } catch (error: any) {
      console.error('Error requesting deal analysis:', error);
      setAnalysisError(error.message || 'Failed to request analysis');
      
      if (error.response?.status === 402) {
        toast.error('Insufficient tokens. Please purchase more tokens to use this feature.');
      } else {
        toast.error('Failed to request analysis. Please try again.');
      }
    } finally {
      setIsRequestingAnalysis(false);
    }
  };

  // Start polling for analysis status updates
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await dealsService.getDealAnalysis(deal.id);
        setAnalysis(response);
        
        // Stop polling once we have a completed status
        if (response.status === 'completed') {
          // Update first-time user status
          localStorage.setItem('has_used_analysis_feature', 'true');
          setIsFirstTimeUser(false);
          
          // Stop polling
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
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

  // Function to safely access the score from the analysis object
  const getAnalysisScore = (analysis: AIAnalysis | null): number => {
    if (!analysis || !analysis.analysis || analysis.analysis.score === undefined) {
      return 0;
    }
    return analysis.analysis.score;
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Helper function to format complex values for display that properly handles empty objects
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    
    // Handle empty objects
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      return 'None';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        // Format arrays
        if (value.length === 0) return '[]';
        return value.map(item => formatValue(item)).join(', ');
      } else if (value !== null) {
        // Format objects
        try {
          return JSON.stringify(value, null, 2);
        } catch (e) {
          return '[Complex Object]';
        }
      }
    }
    
    // Handle basic types
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      // Check if it looks like a percentage
      if (value >= 0 && value <= 1 && value.toString().includes('.')) {
        return `${(value * 100).toFixed(1)}%`;
      }
      // Check if it looks like a price
      if (value > 1) {
        return `$${value.toFixed(2)}`;
      }
      return value.toString();
    }
    
    return String(value);
  };

  // Render analysis content based on status
  const renderAnalysisContent = () => {
    // Debug log to help identify structure issues
    console.log("[DealCard] Analysis data:", JSON.stringify(analysis, null, 2));

    if (!analysis || analysis.status === 'not_found') {
      return (
        <div className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Brain className="h-12 w-12 text-white/30" />
          </div>
          <h3 className="text-md font-medium mb-2">
            {isFirstTimeUser ? "Your First Analysis is Free!" : "Premium Feature"}
          </h3>
          <p className="text-sm text-white/70 mb-4">
            {isFirstTimeUser 
              ? "Try out AI analysis and get insights about price fairness and recommendations."
              : "Get detailed AI insights about price and market comparison."}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Price Analysis
            </Badge>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Market Comparison
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Deal Score
            </Badge>
          </div>
          <Button 
            onClick={requestAnalysis}
            disabled={isRequestingAnalysis}
            size="sm"
            variant="default"
            className="w-full"
          >
            {isRequestingAnalysis ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              isFirstTimeUser ? "Get Free Analysis" : "Analyze This Deal"
            )}
          </Button>
          {!isFirstTimeUser && (
            <p className="mt-2 text-xs text-white/50">
              This will consume 2 tokens from your balance
            </p>
          )}
        </div>
      );
    }
    
    if (analysis.status === 'pending') {
      return (
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-12 h-12 mb-2">
            <Brain className="absolute h-12 w-12 text-white/30" />
            <Loader2 className="absolute h-12 w-12 animate-spin text-purple/50" />
          </div>
          <p className="text-sm text-white/70 mb-1">Analysis in progress...</p>
          <p className="text-xs text-white/50">This usually takes 15-30 seconds</p>
        </div>
      );
    }
    
    if (analysis.status === 'completed' && analysis.analysis) {
      // Extract analysis data with robust fallbacks
      const { 
        price_analysis = {}, 
        market_analysis = {}, 
        recommendations = [],
        score = 0
      } = analysis.analysis;
      
      // Log extracted data for debugging
      console.log("[DealCard] Extracted analysis:", {
        price_analysis_keys: Object.keys(price_analysis),
        market_analysis_keys: Object.keys(market_analysis),
        recommendations_length: recommendations?.length || 0,
        score
      });
      
      return (
        <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()} data-click-area="analysis-content" data-no-navigation="true">
          {/* Deal Score */}
          <div className="flex items-center justify-between" data-no-navigation="true">
            <div className="text-sm font-medium">Deal Score:</div>
            <div className="flex items-center">
              <div className="h-8 w-8 relative border-2 border-white/10 rounded-full flex items-center justify-center mr-2">
                <span className={getScoreColor(score * 10)}>
                  {Math.round(score * 10)}
                </span>
              </div>
              <span className={`text-sm font-medium preserve-color ${
                score >= 0.8 ? 'text-green-500' : 
                score >= 0.6 ? 'text-yellow-500' : 
                'text-red-500'
              }`}>
                {score >= 0.8 ? 'Great Deal' : 
                 score >= 0.6 ? 'Good Deal' : 
                 'Fair Deal'}
              </span>
            </div>
          </div>
          
          {/* Accordion for details - with improved event handling */}
          <div 
            className="w-full accordion interactive-element" 
            onClick={(e) => {
              e.stopPropagation();
            }}
            data-no-navigation="true"
            data-click-area="accordion-container"
          >
            <Accordion type="single" collapsible className="w-full" data-no-navigation="true">
              {/* Price Analysis */}
              {Object.keys(price_analysis).length > 0 ? (
                <AccordionItem value="price_analysis" className="border-white/10" data-no-navigation="true">
                  <div data-no-navigation="true">
                    <AccordionTrigger 
                      className="text-sm py-2 interactive-element" 
                      data-no-navigation="true"
                    >
                      <span className="flex items-center interactive-element" data-no-navigation="true">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Price Analysis
                      </span>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent 
                    onClick={(e) => e.stopPropagation()}
                    data-no-navigation="true"
                    className="interactive-element"
                  >
                    <div className="space-y-1 interactive-element" data-no-navigation="true">
                      {Object.entries(price_analysis).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs py-1 border-b border-white/10 interactive-element" data-no-navigation="true">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span>{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div 
                  className="py-2 px-3 border-b border-white/10 text-xs text-white/50 interactive-element" 
                  onClick={(e) => e.stopPropagation()}
                  data-no-navigation="true"
                >
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 opacity-50" />
                    <span>Price Analysis not available</span>
                  </div>
                </div>
              )}
              
              {/* Market Analysis */}
              {Object.keys(market_analysis).length > 0 ? (
                <AccordionItem value="market_analysis" className="border-white/10" data-no-navigation="true">
                  <div data-no-navigation="true">
                    <AccordionTrigger 
                      className="text-sm py-2 interactive-element" 
                      data-no-navigation="true"
                    >
                      <span className="flex items-center interactive-element" data-no-navigation="true">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Market Comparison
                      </span>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent 
                    onClick={(e) => e.stopPropagation()}
                    data-no-navigation="true"
                    className="interactive-element"
                  >
                    <div className="space-y-1 interactive-element" data-no-navigation="true">
                      {Object.entries(market_analysis).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs py-1 border-b border-white/10 interactive-element" data-no-navigation="true">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span>{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div 
                  className="py-2 px-3 border-b border-white/10 text-xs text-white/50 interactive-element" 
                  onClick={(e) => e.stopPropagation()}
                  data-no-navigation="true"
                >
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 opacity-50" />
                    <span>Market Comparison not available</span>
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {recommendations && recommendations.length > 0 ? (
                <AccordionItem value="recommendations" className="border-white/10" data-no-navigation="true">
                  <div data-no-navigation="true">
                    <AccordionTrigger 
                      className="text-sm py-2 interactive-element" 
                      data-no-navigation="true"
                    >
                      <span className="flex items-center interactive-element" data-no-navigation="true">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Recommendations
                      </span>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent 
                    onClick={(e) => e.stopPropagation()}
                    data-no-navigation="true"
                    className="interactive-element"
                  >
                    <ul className="space-y-1 list-disc list-inside interactive-element" data-no-navigation="true">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="text-xs">{rec}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div 
                  className="py-2 px-3 border-b border-white/10 text-xs text-white/50 interactive-element" 
                  onClick={(e) => e.stopPropagation()}
                  data-no-navigation="true"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 opacity-50" />
                    <span>Recommendations not available</span>
                  </div>
                </div>
              )}
            </Accordion>
          </div>
          
          {/* Refresh Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs interactive-element" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              requestAnalysis(e);
            }}
            data-no-navigation="true"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Analysis
          </Button>
        </div>
      );
    }
    
    // Fallback for error or other states
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
        <p className="text-sm text-white/70 mb-4">
          {analysis?.message || "There was an issue with the analysis"}
        </p>
        <Button 
          onClick={(e) => requestAnalysis(e)}
          size="sm"
          variant="default"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
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

  return (
    <Card className={`overflow-hidden transition-all duration-200 bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] ${isSelected ? 'ring-2 ring-purple shadow-lg' : 'hover:shadow-md hover:scale-[1.01]'}`}>
      <Link href={`/dashboard/deals/${deal.id}`} className="block">
        <div className="relative h-52 bg-white/[0.02] overflow-hidden">
          {deal.image_url ? (
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-contain hover:scale-105 transition-transform duration-300"
              priority={false}
              onError={(e) => {
                // Set fallback image to our SVG placeholder
                e.currentTarget.src = '/placeholder-deal.svg';
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-white/30" />
            </div>
          )}
          
          {/* Deal indicators */}
          <div className="absolute top-2 left-2 flex flex-row flex-wrap gap-1">
            {discountPercent > 0 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm hover:bg-green-500/20 hover:text-green-400">
                {discountPercent}% OFF
              </Badge>
            )}
            {deal.status && (
              <Badge 
                className={`
                  preserve-color hover:no-underline
                  ${deal.status === 'active' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20 hover:text-green-400' : 
                  deal.status === 'expired' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-400' :
                  'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-400'}
                `}
              >
                {deal.status === 'active' ? 
                  <FiCheckCircle className="w-3 h-3 mr-1" /> : 
                  <FiAlertTriangle className="w-3 h-3 mr-1" />
                }
                {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
              </Badge>
            )}
            {/* Best Seller Badge */}
            {(deal.best_seller || deal.metadata?.best_seller) && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 backdrop-blur-sm flex items-center gap-1 hover:bg-orange-500/20 hover:text-orange-400">
                <Award className="h-3 w-3" />
                Best Seller
              </Badge>
            )}
            {/* Amazon's Choice Badge */}
            {(deal.is_amazons_choice || deal.metadata?.is_amazons_choice) && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm flex items-center gap-1 hover:bg-blue-500/20 hover:text-blue-400">
                <CheckCircle className="h-3 w-3" />
                Amazon&apos;s Choice
              </Badge>
            )}
            {deal.verified && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm flex items-center gap-1 hover:bg-blue-500/20 hover:text-blue-400">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
            )}
            {deal.featured && (
              <Badge className="bg-purple/20 text-purple border-purple/30 backdrop-blur-sm flex items-center gap-1 hover:bg-purple/20 hover:text-purple">
                <FiStar size={12} />
                Featured
              </Badge>
            )}
          </div>
         
          {/* Action buttons */}
          {showActions && (
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {/* Favorite button */}
              {onFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteClick}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 p-1 backdrop-blur-sm"
                  disabled={isLoading}
                >
                  <FiHeart 
                    size={18} 
                    className={isFavorite ? "fill-purple text-purple" : "text-white"} 
                  />
                </Button>
              )}
              
              {/* Share button */}
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="z-10"
              >
                <ShareButton
                  deal={deal}
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 p-1 backdrop-blur-sm"
                />
              </div>
            </div>
          )}

          {/* AI Score badge if available */}
          {(deal.latest_score || (analysis && getAnalysisScore(analysis) > 0)) && (
            <div className="absolute bottom-2 right-2 bg-white/10 text-white px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
              <BarChart2 className="h-3 w-3 text-purple preserve-color" />
              <span className={`text-xs font-semibold preserve-color ${
                getScoreColor(analysis && getAnalysisScore(analysis) > 0 
                  ? getAnalysisScore(analysis) * 10 
                  : (typeof deal.latest_score === 'number' ? deal.latest_score : parseFloat(deal.latest_score || '0')))
              }`}>
                {analysis && getAnalysisScore(analysis) > 0 
                  ? Math.round(getAnalysisScore(analysis) * 10) 
                  : (typeof deal.latest_score === 'number' ? deal.latest_score.toFixed(1) : deal.latest_score)
                }/10
              </span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Category and Date */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">
                {deal.category || 'Uncategorized'}
              </span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs text-white/50">
                {formattedDate}
              </span>
              {deal.market_id && (
                <>
                  <span className="text-xs text-white/50">•</span>
                  <span className="text-xs text-white/50 flex items-center">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    {deal.source || (deal as any).market_name || 'Marketplace'}
                    {deal.seller_info?.name && ` • ${deal.seller_info.name}`}
                  </span>
                </>
              )}
            </div>
            
            {/* Always show rating when available in seller_info */}
            {deal.seller_info && deal.seller_info.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-white">
                  {typeof deal.seller_info.rating === 'number' 
                    ? deal.seller_info.rating.toFixed(1) 
                    : deal.seller_info.rating}
                  {deal.seller_info.reviews !== undefined && (
                    <span className="text-white/50"> ({deal.seller_info.reviews})</span>
                  )}
                </span>
              </div>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 text-white">{deal.title}</h3>
          
          {/* Price section */}
          <div className="mt-3 flex items-center gap-4">
            <div>
              {/* Apply green color to price when there's a discount */}
              <span className={`text-xl font-bold ${deal.original_price && Number(deal.original_price) > Number(deal.price) ? 'text-green-400' : 'text-white'}`}>
                ${typeof deal.price === 'number' ? deal.price.toFixed(2) : parseFloat(deal.price || '0').toFixed(2)}
              </span>
              {deal.original_price && (
                <div className="flex items-center gap-2">
                  <span className="text-sm line-through text-white/50">
                    ${typeof deal.original_price === 'number' ? deal.original_price.toFixed(2) : parseFloat(deal.original_price || '0').toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm line-clamp-2 mt-2">{deal.description}</p>

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {deal.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="bg-white/[0.05] text-white/70 border-white/10 text-xs">
                  {tag}
                </Badge>
              ))}
              {deal.tags.length > 3 && (
                <span className="text-xs text-white/50">+{deal.tags.length - 3} more</span>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 px-4 pb-4 flex justify-between border-t border-white/10 mt-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-white/60 w-full">
            {deal.shipping_info?.free_shipping && (
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-purple" />
                Free Shipping
              </div>
            )}
            
            {deal.availability?.in_stock && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Stock
              </div>
            )}
            
            {onTrack && (
              <div className="col-span-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTrackClick}
                  className="w-full bg-white/[0.05] border-white/10 hover:bg-white/10 text-white/80"
                >
                  <FiEye className="mr-1 h-3 w-3" />
                  Track
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Link>
      
      {/* AI Analysis Button - Make sure it's completely outside the Link */}
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleAnalysisExpanded(e);
          }}
          className="w-full bg-white/[0.05] border-white/10 hover:bg-white/10 text-white/80 flex justify-between items-center"
        >
          <div className="flex items-center">
            <Brain className="mr-1 h-3 w-3" />
            AI Analysis
          </div>
          {analysisExpanded ? (
            <ChevronUp className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-auto" />
          )}
        </Button>
      </div>
      
      {/* Analysis Expanded Section - Make sure it handles events correctly */}
      {analysisExpanded && (
        <div 
          className="border-t border-white/10 bg-white/[0.03]" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {renderAnalysisContent()}
        </div>
      )}
    </Card>
  );
}

export default DealCard;