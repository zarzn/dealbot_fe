import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { dealsService } from '@/services/deals';
import { AIAnalysis as BaseAIAnalysis } from '@/types/deals';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Brain, Star, DollarSign, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TokenCostModal from './TokenCostModal';
import { useUserStore } from '@/stores/userStore';
import { walletService } from '@/services/wallet';

interface DealAnalysisProps {
  dealId: string;
}

// Extended interface for AIAnalysis with completeness info
interface ExtendedAIAnalysis extends BaseAIAnalysis {
  completenessInfo?: {
    label: string;
    color: string;
    ratio: string;
  };
}

// Prevent click event propagation to avoid navigation when clicking on interactive elements
const stopPropagation = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export const DealAnalysisLoading: React.FC = () => {
  return (
    <Card className="w-full mt-4 bg-white/[0.05] backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading Deal Analysis</span>
        </CardTitle>
        <CardDescription>
          Please wait while we retrieve the analysis data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Fetching analysis results...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DealAnalysisError: React.FC<{error: string; onRetry: () => void}> = ({ error, onRetry }) => {
  return (
    <Card className="w-full mt-4 bg-white/[0.05] backdrop-blur-sm border border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Analysis Error</span>
        </CardTitle>
        <CardDescription>
          There was a problem retrieving the deal analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DealAnalysisRequestView: React.FC<{
  dealId: string;
  onRequestAnalysis: () => void;
  isFirstAnalysis?: boolean;
}> = ({ dealId, onRequestAnalysis, isFirstAnalysis = false }) => {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const userStore = useUserStore();
  
  const handleRequestAnalysis = async () => {
    if (isFirstAnalysis) {
      // If it's the first analysis, proceed directly without showing modal
      onRequestAnalysis();
    } else {
      // Fetch latest balance before showing the token modal
      setIsFetchingBalance(true);
      try {
        await walletService.refreshBalanceAndUpdateStore();
        console.log(`[DealAnalysis] Updated user balance before showing token cost modal`);
      } catch (error) {
        console.error('[DealAnalysis] Failed to update balance before showing token cost modal:', error);
        // Continue anyway - the modal will use whatever balance is in the store
      } finally {
        setIsFetchingBalance(false);
        // Show the token cost modal
        setShowTokenModal(true);
      }
    }
  };
  
  return (
    <Card className="w-full mt-4 bg-white/[0.05] backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>AI Deal Analysis</span>
        </CardTitle>
        <CardDescription>
          Get detailed insights and recommendations for this deal
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex justify-center items-center pb-6">
        <div className="text-center">
          <Button 
            onClick={handleRequestAnalysis} 
            size="lg"
            className="relative overflow-hidden group"
            disabled={isFetchingBalance}
          >
            <span className="relative z-10">
              {isFirstAnalysis ? "Get Your Free Analysis" : "Analyze This Deal"}
            </span>
            {isFirstAnalysis && (
              <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            )}
            {isFetchingBalance && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
          
          {!isFirstAnalysis && (
            <p className="mt-3 text-xs text-muted-foreground">
              This will consume 2 tokens from your balance
            </p>
          )}
        </div>
      </CardContent>
      
      {/* Token cost confirmation modal for non-first-time analysis */}
      <TokenCostModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onConfirm={() => {
          setShowTokenModal(false);
          onRequestAnalysis();
        }}
        tokenCost={2}
        title="Request Deal Analysis"
        description="You're about to request an AI analysis of this deal. This will consume 2 tokens from your balance."
      />
    </Card>
  );
};

export const DealAnalysisPending: React.FC = () => {
  return (
    <Card className="w-full mt-4 bg-white/[0.05] backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Analysis in Progress</span>
        </CardTitle>
        <CardDescription>
          Our AI is analyzing this deal for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-6 w-16 h-16">
              <Brain className="absolute inset-0 w-16 h-16 text-primary/30" />
              <Loader2 className="absolute inset-0 w-16 h-16 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground mb-2">Analysis is being generated</p>
            <p className="text-xs text-muted-foreground">This usually takes 15-30 seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DealAnalysisResult: React.FC<{
  analysis: ExtendedAIAnalysis;
  onRefresh: () => void;
}> = ({ analysis, onRefresh }) => {
  // Move useState to the top level of the component to fix linter error
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  // Add useEffect for debugging the openAccordion state changes
  useEffect(() => {
    console.log(`[DealAnalysisResult] Current open accordion: ${openAccordion}`);
  }, [openAccordion]);
  
  if (!analysis) return null;
  
  // Debug log to help identify structure issues
  console.log("[DealAnalysisResult] Analysis data received:", JSON.stringify(analysis, null, 2));
  
  // Format the analysis data for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };
  
  // Improved function to handle accordion toggle with better logging
  const handleAccordionToggle = (value: string) => {
    console.log(`[DealAnalysisResult] Toggling accordion: ${value}, current state:`, openAccordion === value ? 'open → closing' : 'closed → opening');
    setOpenAccordion(prev => prev === value ? null : value);
  };

  // Helper function to format complex values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    
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
  
  const renderAnalysisContent = () => {
    if (!analysis.analysis) {
      console.log("[DealAnalysisResult] No analysis object found in:", analysis);
      return (
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-amber-400/70 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Analysis Data Incomplete</h3>
          <p className="text-white/60 mb-4">The AI analysis didn&apos;t return complete data for this deal</p>
          <div className="p-4 bg-white/[0.03] rounded-md border border-white/10 text-sm text-white/50">
            <p>This can happen when:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The deal has limited information</li>
              <li>No comparable products were found</li>
              <li>The analysis service encountered an issue</li>
            </ul>
          </div>
        </div>
      );
    }
    
    // Extract data with robust fallbacks
    const { 
      price_analysis = {}, 
      market_analysis = {}, 
      recommendations = [],
      score = 0
    } = analysis.analysis;
    
    // Calculate completeness for visualization
    const sections = [
      Object.keys(price_analysis).length > 0,
      Object.keys(market_analysis).length > 0,
      recommendations && recommendations.length > 0
    ];
    const completedSections = sections.filter(Boolean).length;
    const completeness = completedSections / sections.length;
    
    // Define completeness label and color
    let completenessLabel = '';
    let completenessColor = '';
    
    if (completeness === 1) {
      completenessLabel = 'Complete';
      completenessColor = 'text-green-400';
    } else if (completeness >= 0.66) {
      completenessLabel = 'Mostly Complete';
      completenessColor = 'text-amber-400';
    } else if (completeness >= 0.33) {
      completenessLabel = 'Partial';
      completenessColor = 'text-amber-500';
    } else {
      completenessLabel = 'Limited';
      completenessColor = 'text-red-400';
    }
    
    // Store these in the analysis object for use in the card header
    analysis.completenessInfo = {
      label: completenessLabel,
      color: completenessColor,
      ratio: `${completedSections}/${sections.length}`
    };
    
    // More detailed logging
    console.log("[DealAnalysisResult] Extracted analysis data:", {
      price_analysis: typeof price_analysis === 'object' ? Object.keys(price_analysis) : 'not an object',
      market_analysis: typeof market_analysis === 'object' ? Object.keys(market_analysis) : 'not an object',
      recommendations: Array.isArray(recommendations) ? recommendations.length : 'not an array',
      score: typeof score === 'number' ? score : 'not a number',
      completeness: {
        label: completenessLabel,
        ratio: `${completedSections}/${sections.length}`
      }
    });
    
    return (
      <div className="space-y-6">
        {/* Deal Score - Updated to match the first block's style */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white/80">Overall Score</span>
          <div className="flex items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div 
                className="absolute inset-0 rounded-full border-4" 
                style={{ 
                  borderColor: score >= 0.8 ? 'rgba(34, 197, 94, 0.7)' : 
                              score >= 0.6 ? 'rgba(234, 179, 8, 0.7)' : 
                              'rgba(239, 68, 68, 0.7)',
                  clipPath: `inset(0 0 ${100 - (score * 100)}%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                {Math.round(score * 10)}
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-semibold">
                {score >= 0.7 ? 'Excellent Deal!' : score >= 0.5 ? 'Good Deal' : score > 0.3 ? 'Fair Deal' : 'Poor Deal'}
              </div>
              <div className="text-xs text-white/60">Based on AI analysis</div>
            </div>
          </div>
        </div>
        
        {/* Improved Custom Accordion Implementation */}
        <div className="w-full border rounded-md border-white/10 overflow-hidden">
          {/* Price Analysis */}
          {Object.keys(price_analysis).length > 0 ? (
            <div className="border-b border-white/10">
              <button
                type="button"
                className={`flex w-full items-center justify-between p-3 text-sm font-medium ${
                  openAccordion === 'price_analysis' ? 'bg-white/[0.08]' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAccordionToggle('price_analysis');
                }}
              >
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <div className="relative text-left">
                    <div className="absolute -left-1 top-1 w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                    <span className="pl-2">Price Analysis</span>
                    <p className="text-xs font-normal text-white/50 mt-0.5 pl-2">Evaluation of price fairness and value</p>
                  </div>
                </span>
                <div className={`transform transition-transform ${
                  openAccordion === 'price_analysis' ? 'rotate-180' : ''
                }`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
              
              {openAccordion === 'price_analysis' && (
                <div className="p-3 border-t border-white/10 bg-white/[0.03]">
                  {Object.keys(price_analysis).length > 0 ? (
                    <div className="space-y-2 text-sm">
                      {Object.entries(price_analysis).map(([key, value], index) => (
                        <div key={`price-${key}-${index}`} className="flex justify-between border-b border-muted pb-2">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">
                            {formatValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-white/60">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-400/70" />
                      <p className="font-medium mb-1">No price analysis data available</p>
                      <p className="text-xs text-white/40">The AI analysis didn&apos;t generate price evaluation data for this deal</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border-b border-white/10">
              <button
                type="button"
                className="flex w-full items-center justify-between p-3 text-sm font-medium opacity-70"
                disabled
              >
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <div className="relative text-left">
                    <div className="absolute -left-1 top-1 w-2 h-2 bg-red-400/60 rounded-full" aria-hidden="true"></div>
                    <span className="pl-2">Price Analysis</span>
                    <p className="text-xs font-normal text-white/40 mt-0.5 pl-2">Evaluation of price fairness and value</p>
                  </div>
                </span>
                <div className="flex items-center text-xs text-white/50">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-400/70" />
                  No price data
                </div>
              </button>
            </div>
          )}
          
          {/* Market Analysis */}
          {Object.keys(market_analysis).length > 0 ? (
            <div className="border-b border-white/10">
              <button
                type="button"
                className={`flex w-full items-center justify-between p-3 text-sm font-medium ${
                  openAccordion === 'market_analysis' ? 'bg-white/[0.08]' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAccordionToggle('market_analysis');
                }}
              >
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <div className="relative text-left">
                    <div className="absolute -left-1 top-1 w-2 h-2 bg-blue-400 rounded-full" aria-hidden="true"></div>
                    <span className="pl-2">Market Comparison</span>
                    <p className="text-xs font-normal text-white/50 mt-0.5 pl-2">Comparison with similar products</p>
                  </div>
                </span>
                <div className={`transform transition-transform ${
                  openAccordion === 'market_analysis' ? 'rotate-180' : ''
                }`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
              
              {openAccordion === 'market_analysis' && (
                <div className="p-3 border-t border-white/10 bg-white/[0.03]">
                  {Object.keys(market_analysis).length > 0 ? (
                    <div className="space-y-2 text-sm">
                      {Object.entries(market_analysis).map(([key, value], index) => (
                        <div key={`market-${key}-${index}`} className="flex justify-between border-b border-muted pb-2">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">
                            {formatValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-white/60">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-400/70" />
                      <p className="font-medium mb-1">No market comparison data available</p>
                      <p className="text-xs text-white/40">The AI analysis couldn&apos;t find comparable products or market data</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border-b border-white/10">
              <button
                type="button"
                className="flex w-full items-center justify-between p-3 text-sm font-medium opacity-70"
                disabled
              >
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <div className="relative text-left">
                    <div className="absolute -left-1 top-1 w-2 h-2 bg-red-400/60 rounded-full" aria-hidden="true"></div>
                    <span className="pl-2">Market Comparison</span>
                    <p className="text-xs font-normal text-white/40 mt-0.5 pl-2">Comparison with similar products</p>
                  </div>
                </span>
                <div className="flex items-center text-xs text-white/50">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-400/70" />
                  No market data
                </div>
              </button>
            </div>
          )}
          
          {/* Recommendations */}
          {recommendations && recommendations.length > 0 ? (
            <div className="border-b border-white/10">
              <button
                type="button"
                className={`flex w-full items-center justify-between p-3 text-sm font-medium ${
                  openAccordion === 'recommendations' ? 'bg-white/[0.08]' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAccordionToggle('recommendations');
                }}
              >
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <div className="relative text-left">
                    <div className="absolute -left-1 top-1 w-2 h-2 bg-amber-400 rounded-full" aria-hidden="true"></div>
                    <span className="pl-2">Recommendations</span>
                    <p className="text-xs font-normal text-white/50 mt-0.5 pl-2">Advice and insights for this deal</p>
                  </div>
                </span>
                <div className={`transform transition-transform ${
                  openAccordion === 'recommendations' ? 'rotate-180' : ''
                }`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
              
              {openAccordion === 'recommendations' && (
                <div className="p-3 border-t border-white/10 bg-white/[0.03]">
                  {recommendations.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {recommendations.map((rec, index) => (
                        <li key={`rec-${index}`} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-sm text-white/60">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-400/70" />
                      <p className="font-medium mb-1">No recommendations available</p>
                      <p className="text-xs text-white/40">The AI analysis didn&apos;t generate specific recommendations for this deal</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border-b border-white/10">
              <button
                type="button"
                className="flex w-full items-center justify-between p-3 text-sm font-medium opacity-70"
                disabled
              >
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <div className="relative text-left">
                    <div className="absolute -left-1 top-1 w-2 h-2 bg-red-400/60 rounded-full" aria-hidden="true"></div>
                    <span className="pl-2">Recommendations</span>
                    <p className="text-xs font-normal text-white/40 mt-0.5 pl-2">Advice and insights for this deal</p>
                  </div>
                </span>
                <div className="flex items-center text-xs text-white/50">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-400/70" />
                  No recommendations
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Add a helper message when minimal data is available */}
        {(!Object.keys(price_analysis).length && !Object.keys(market_analysis).length && (!recommendations || !recommendations.length)) && (
          <div className="mt-6 p-4 bg-white/[0.03] rounded-md border border-white/10 text-sm">
            <p className="flex items-center text-amber-400/80 mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">Limited Analysis Data Available</span>
            </p>
            <p className="text-white/60 mb-3">
              The AI analysis couldn&apos;t generate detailed information for this deal, which can happen for several reasons:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/50">
              <li>Deal description may be too brief or generic</li>
              <li>Product may be unique with few comparable items</li>
              <li>Limited market data available for this type of product</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-white/60 text-xs">
                Try refreshing the analysis or adding more deal details for better results
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render based on the analysis status
  return (
    <Card className="w-full mt-4 bg-white/[0.05] backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>AI Deal Analysis</span>
          </CardTitle>
          
          {analysis.completenessInfo && (
            <div className="flex items-center">
              <span className={`text-xs ${analysis.completenessInfo.color} mr-2`}>
                {analysis.completenessInfo.label}
              </span>
              <span className="text-xs bg-white/10 px-2 py-1 rounded">
                {analysis.completenessInfo.ratio} sections
              </span>
            </div>
          )}
        </div>
        <CardDescription>
          {analysis.status === 'completed' 
            ? 'Analysis completed at ' + formatDate(analysis.request_time)
            : analysis.status === 'pending'
              ? 'Analysis is being processed...'
              : analysis.status === 'error'
                ? 'Analysis failed: ' + analysis.message
                : 'Analysis status: ' + analysis.status
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysis.status === 'completed' ? (
          renderAnalysisContent()
        ) : analysis.status === 'pending' ? (
          <div className="h-40 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto mb-6 w-16 h-16">
                <Brain className="absolute inset-0 w-16 h-16 text-primary/30" />
                <Loader2 className="absolute inset-0 w-16 h-16 animate-spin text-primary" />
              </div>
              <p className="text-muted-foreground mb-2">Analysis is being generated</p>
              <p className="text-xs text-muted-foreground">This usually takes 15-30 seconds</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{analysis.message || 'An error occurred while analyzing this deal'}</p>
            <Button onClick={onRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
      {analysis.status === 'completed' && (
        <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
          <div className="text-xs text-muted-foreground">
            {analysis.token_cost > 0
              ? `This analysis cost ${analysis.token_cost} tokens`
              : 'Free analysis'
            }
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Analysis
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export function useAnalysis(dealId: string) {
  const [analysis, setAnalysis] = useState<ExtendedAIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(
    typeof window !== 'undefined' && localStorage.getItem('has_used_analysis_feature') !== 'true'
  );
  const userStore = useUserStore();
  
  // Load the analysis data when the component mounts
  useEffect(() => {
    fetchAnalysis();
    
    // Check if user has used the analysis feature before
    // This would typically come from the user profile or a specific API endpoint
    // For now, we'll just set a flag based on localStorage
    const hasUsedAnalysisFeature = localStorage.getItem('has_used_analysis_feature');
    setIsFirstTimeUser(!hasUsedAnalysisFeature);
  }, [dealId]);
  
  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if there's a cached analysis
      const cachedAnalysis = dealsService.getCachedAnalysis(dealId);
      if (cachedAnalysis && cachedAnalysis.status === 'completed') {
        console.log("Using cached analysis from dealsService:", cachedAnalysis);
        setAnalysis(cachedAnalysis as ExtendedAIAnalysis);
        setLoading(false);
        
        // Update first-time user status
        if (cachedAnalysis.status === 'completed') {
          localStorage.setItem('has_used_analysis_feature', 'true');
          setIsFirstTimeUser(false);
        }
        return;
      }
      
      // If no cache hit, fetch from API
      const data = await dealsService.getDealAnalysis(dealId);
      setAnalysis(data as ExtendedAIAnalysis);
      
      // Update first-time user status if this is a valid analysis
      if (data && data.status === 'completed') {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
    } catch (error: any) {
      console.error('Error fetching deal analysis:', error);
      
      // If no analysis exists, this is expected - we'll show the request view
      if (error.response?.status === 404) {
        setAnalysis(null);
        setError(null);
      } else {
        setError(error.message || 'Failed to load analysis data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const requestAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dealsService.analyzeDeal(dealId);
      setAnalysis(response as ExtendedAIAnalysis);
      
      toast.success('Analysis requested successfully!');
      
      // If this was a first-time user, update the status
      if (isFirstTimeUser) {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
      
      // Poll for the completed analysis
      startPolling();
      
      // Update the token balance after successful analysis request
      try {
        await walletService.refreshBalanceAndUpdateStore();
        console.log('[DealAnalysis] Updated token balance after analysis request');
      } catch (balanceError) {
        console.error('[DealAnalysis] Failed to update balance after analysis request:', balanceError);
      }
    } catch (error: any) {
      console.error('Error requesting deal analysis:', error);
      setError(error.message || 'Failed to request analysis');
      setLoading(false);
      
      if (error.response?.status === 402) {
        toast.error('Insufficient tokens. Please purchase more tokens to use this feature.');
      } else {
        toast.error('Failed to request analysis. Please try again.');
      }
    }
  };
  
  // Poll for the analysis status until it's completed
  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const data = await dealsService.getDealAnalysis(dealId);
        setAnalysis(data as ExtendedAIAnalysis);
        
        // If the analysis is completed or failed, stop polling
        if (data.status !== 'pending') {
          clearInterval(pollInterval);
          setLoading(false);
          
          if (data.status === 'completed') {
            toast.success('Deal analysis completed!');
            
            // Update the token balance when analysis is completed
            try {
              await walletService.refreshBalanceAndUpdateStore();
              console.log('[DealAnalysis] Updated token balance after analysis completed');
            } catch (balanceError) {
              console.error('[DealAnalysis] Failed to update balance after analysis:', balanceError);
            }
          } else if (data.status === 'error') {
            toast.error('Analysis failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error polling analysis status:', error);
        clearInterval(pollInterval);
        setLoading(false);
      }
    }, 5000); // Poll every 5 seconds
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(pollInterval);
  };
  
  // Render the appropriate view based on the analysis status
  if (loading) {
    return <DealAnalysisLoading />;
  }
  
  if (error) {
    return <DealAnalysisError error={error} onRetry={fetchAnalysis} />;
  }
  
  // If no analysis exists or status is not_found, show the request view
  if (!analysis || analysis.status === 'not_found') {
    return (
      <DealAnalysisRequestView 
        dealId={dealId} 
        onRequestAnalysis={requestAnalysis}
        isFirstAnalysis={isFirstTimeUser}
      />
    );
  }
  
  // If analysis is pending, show the pending view
  if (analysis.status === 'pending') {
    return <DealAnalysisPending />;
  }
  
  // Otherwise, show the analysis results
  return <DealAnalysisResult analysis={analysis} onRefresh={requestAnalysis} />;
}

const DealAnalysis: React.FC<DealAnalysisProps> = ({ dealId }) => {
  const [analysis, setAnalysis] = useState<ExtendedAIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(
    localStorage.getItem('has_used_analysis_feature') !== 'true'
  );
  const userStore = useUserStore();
  
  // Load the analysis data when the component mounts
  useEffect(() => {
    fetchAnalysis();
    
    // Check if user has used the analysis feature before
    // This would typically come from the user profile or a specific API endpoint
    // For now, we'll just set a flag based on localStorage
    const hasUsedAnalysisFeature = localStorage.getItem('has_used_analysis_feature');
    setIsFirstTimeUser(!hasUsedAnalysisFeature);
  }, [dealId]);
  
  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if there's a cached analysis
      const cachedAnalysis = dealsService.getCachedAnalysis(dealId);
      if (cachedAnalysis && cachedAnalysis.status === 'completed') {
        console.log("Using cached analysis from dealsService:", cachedAnalysis);
        setAnalysis(cachedAnalysis as ExtendedAIAnalysis);
        setLoading(false);
        
        // Update first-time user status
        if (cachedAnalysis.status === 'completed') {
          localStorage.setItem('has_used_analysis_feature', 'true');
          setIsFirstTimeUser(false);
        }
        return;
      }
      
      // If no cache hit, fetch from API
      const data = await dealsService.getDealAnalysis(dealId);
      setAnalysis(data as ExtendedAIAnalysis);
      
      // Update first-time user status if this is a valid analysis
      if (data && data.status === 'completed') {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
    } catch (error: any) {
      console.error('Error fetching deal analysis:', error);
      
      // If no analysis exists, this is expected - we'll show the request view
      if (error.response?.status === 404) {
        setAnalysis(null);
        setError(null);
      } else {
        setError(error.message || 'Failed to load analysis data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const requestAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dealsService.analyzeDeal(dealId);
      setAnalysis(response as ExtendedAIAnalysis);
      
      toast.success('Analysis requested successfully!');
      
      // If this was a first-time user, update the status
      if (isFirstTimeUser) {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
      
      // Poll for the completed analysis
      startPolling();
      
      // Update the token balance after successful analysis request
      try {
        await walletService.refreshBalanceAndUpdateStore();
        console.log('[DealAnalysis] Updated token balance after analysis request');
      } catch (balanceError) {
        console.error('[DealAnalysis] Failed to update balance after analysis request:', balanceError);
      }
    } catch (error: any) {
      console.error('Error requesting deal analysis:', error);
      setError(error.message || 'Failed to request analysis');
      setLoading(false);
      
      if (error.response?.status === 402) {
        toast.error('Insufficient tokens. Please purchase more tokens to use this feature.');
      } else {
        toast.error('Failed to request analysis. Please try again.');
      }
    }
  };
  
  // Poll for the analysis status until it's completed
  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const data = await dealsService.getDealAnalysis(dealId);
        setAnalysis(data as ExtendedAIAnalysis);
        
        // If the analysis is completed or failed, stop polling
        if (data.status !== 'pending') {
          clearInterval(pollInterval);
          setLoading(false);
          
          if (data.status === 'completed') {
            toast.success('Deal analysis completed!');
            
            // Update the token balance when analysis is completed
            try {
              await walletService.refreshBalanceAndUpdateStore();
              console.log('[DealAnalysis] Updated token balance after analysis completed');
            } catch (balanceError) {
              console.error('[DealAnalysis] Failed to update balance after analysis:', balanceError);
            }
          } else if (data.status === 'error') {
            toast.error('Analysis failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error polling analysis status:', error);
        clearInterval(pollInterval);
        setLoading(false);
      }
    }, 5000); // Poll every 5 seconds
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(pollInterval);
  };
  
  // Render the appropriate view based on the analysis status
  if (loading) {
    return <DealAnalysisLoading />;
  }
  
  if (error) {
    return <DealAnalysisError error={error} onRetry={fetchAnalysis} />;
  }
  
  // If no analysis exists or status is not_found, show the request view
  if (!analysis || analysis.status === 'not_found') {
    return (
      <DealAnalysisRequestView 
        dealId={dealId} 
        onRequestAnalysis={requestAnalysis}
        isFirstAnalysis={isFirstTimeUser}
      />
    );
  }
  
  // If analysis is pending, show the pending view
  if (analysis.status === 'pending') {
    return <DealAnalysisPending />;
  }
  
  // Otherwise, show the analysis results
  return <DealAnalysisResult analysis={analysis} onRefresh={requestAnalysis} />;
};

export default DealAnalysis; 