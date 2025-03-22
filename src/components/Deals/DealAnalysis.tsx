import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { dealsService } from '@/services/deals';
import { AIAnalysis } from '@/types/deals';
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
import { Loader2, AlertTriangle, CheckCircle, Brain, Star, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TokenCostModal from './TokenCostModal';

interface DealAnalysisProps {
  dealId: string;
}

export const DealAnalysisLoading: React.FC = () => {
  return (
    <Card className="w-full mt-4 bg-background/60 backdrop-blur-sm border">
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
    <Card className="w-full mt-4 bg-background/60 backdrop-blur-sm border border-destructive/20">
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
  
  const handleRequestAnalysis = () => {
    if (isFirstAnalysis) {
      // If it's the first analysis, proceed directly without showing modal
      onRequestAnalysis();
    } else {
      // Otherwise show the token cost modal
      setShowTokenModal(true);
    }
  };
  
  return (
    <Card className="w-full mt-4 bg-background/60 backdrop-blur-sm border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>AI Deal Analysis</span>
        </CardTitle>
        <CardDescription>
          Get detailed insights and recommendations for this deal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4">
          <Brain className="h-16 w-16 mx-auto mb-6 text-primary/60" />
          
          <h3 className="text-lg font-medium mb-2">
            {isFirstAnalysis ? "Your First Analysis is Free!" : "Premium Feature"}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {isFirstAnalysis 
              ? "Try out our AI deal analysis for free! Get detailed insights about price fairness, market comparison, and personalized recommendations."
              : "Unlock deep insights with our AI analysis. Understand if this is truly a good deal with data-driven recommendations."}
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Badge variant="outline" className="text-xs py-2 px-3">
              <DollarSign className="h-3 w-3 mr-1" />
              Price Analysis
            </Badge>
            <Badge variant="outline" className="text-xs py-2 px-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              Market Comparison
            </Badge>
            <Badge variant="outline" className="text-xs py-2 px-3">
              <Star className="h-3 w-3 mr-1" />
              Deal Score
            </Badge>
            <Badge variant="outline" className="text-xs py-2 px-3">
              <Clock className="h-3 w-3 mr-1" />
              Timing Advice
            </Badge>
          </div>
          
          <Button 
            onClick={handleRequestAnalysis} 
            size="lg"
            className="relative overflow-hidden group"
          >
            <span className="relative z-10">
              {isFirstAnalysis ? "Get Your Free Analysis" : "Analyze This Deal"}
            </span>
            {isFirstAnalysis && (
              <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
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
    <Card className="w-full mt-4 bg-background/60 backdrop-blur-sm border">
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
  analysis: AIAnalysis;
  onRefresh: () => void;
}> = ({ analysis, onRefresh }) => {
  if (!analysis) return null;
  
  // Format the analysis data for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };
  
  const renderAnalysisContent = () => {
    if (!analysis.analysis) {
      return (
        <div className="text-center p-4">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No analysis data available</p>
        </div>
      );
    }
    
    const { 
      price_analysis = {}, 
      market_analysis = {}, 
      recommendations = [],
      score = 0
    } = analysis.analysis;
    
    return (
      <div className="space-y-6">
        {/* Deal Score */}
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-background/40">
          <h3 className="text-lg font-medium mb-2">Deal Score</h3>
          <div className="relative w-24 h-24 mb-2">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary" 
              style={{ 
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                opacity: 0.7,
                transform: `rotate(${(score / 100) * 360}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{score ? Math.round(score * 100) : '?'}</span>
            </div>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            {score > 0.7 ? 'Excellent Deal!' : score > 0.5 ? 'Good Deal' : score > 0.3 ? 'Fair Deal' : 'Poor Deal'}
          </div>
        </div>
        
        {/* Price Analysis */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <DollarSign className="h-5 w-5 mr-1" />
            Price Analysis
          </h3>
          <div className="space-y-2 text-sm">
            {Object.entries(price_analysis).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-muted pb-2">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Market Analysis */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-1" />
            Market Comparison
          </h3>
          <div className="space-y-2 text-sm">
            {Object.entries(market_analysis).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-muted pb-2">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Star className="h-5 w-5 mr-1" />
            Recommendations
          </h3>
          <ul className="space-y-2 list-disc pl-5">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No recommendations available</li>
            )}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full mt-4 bg-background/60 backdrop-blur-sm border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span>AI Deal Analysis</span>
            </CardTitle>
            <CardDescription>
              Insights and recommendations for this deal
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={onRefresh}
          >
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderAnalysisContent()}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground space-y-1 pt-2">
        <div>Analysis requested: {formatDate(analysis.request_time)}</div>
        <div>Token cost: {analysis.token_cost}</div>
        <div>Status: {analysis.status}</div>
      </CardFooter>
    </Card>
  );
};

const DealAnalysis: React.FC<DealAnalysisProps> = ({ dealId }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
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
      
      const data = await dealsService.getDealAnalysis(dealId);
      setAnalysis(data);
      
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
      setAnalysis(response);
      
      toast.success('Analysis requested successfully!');
      
      // If this was a first-time user, update the status
      if (isFirstTimeUser) {
        localStorage.setItem('has_used_analysis_feature', 'true');
        setIsFirstTimeUser(false);
      }
      
      // Poll for the completed analysis
      startPolling();
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
        setAnalysis(data);
        
        // If the analysis is completed or failed, stop polling
        if (data.status !== 'pending') {
          clearInterval(pollInterval);
          setLoading(false);
          
          if (data.status === 'completed') {
            toast.success('Deal analysis completed!');
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