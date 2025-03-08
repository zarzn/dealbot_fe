import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Tag, Clock, Truck, ShoppingBag, BarChart, ThumbsUp } from 'lucide-react';
import { DealSuggestion } from '@/types/deals';
import { calculateDiscount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DealCardProps {
  deal: DealSuggestion;
  onTrack?: (deal: DealSuggestion) => void;
}

export function DealCard({ deal, onTrack }: DealCardProps) {
  // Debug logging to track what data is being received
  useEffect(() => {
    console.log('DealCard received deal:', deal);
    // Add specific debug for ratings
    console.log('Deal ratings debug:', {
      reviews: deal.reviews,
      sellerInfo: deal.seller_info,
      hasReviews: Boolean(deal.reviews),
      hasSellerInfo: Boolean(deal.seller_info),
      averageRating: deal.reviews?.average_rating,
      sellerRating: deal.seller_info?.rating,
    });
  }, [deal]);

  // Calculate discount percentage
  const discountPercentage = calculateDiscount(deal.original_price, deal.price);
  
  // Extract score from ai_analysis if it exists and score isn't already defined
  const dealScore = deal.score !== undefined 
    ? deal.score 
    : (deal as any).ai_analysis?.score !== undefined 
      ? (deal as any).ai_analysis.score 
      : undefined;
  
  // Calculate a match score based on relevance or use existing match_score
  const matchScore = deal.match_score 
    ? deal.match_score 
    : dealScore 
      ? Math.min(Math.round(dealScore * 10), 100) 
      : 50;
  
  // Generate a match description if not provided
  const matchDescription = deal.match_description || getMatchDescription(matchScore);
  
  // Use recommendations from API or generate based on price/discount
  const recommendation = deal.recommendations && deal.recommendations.length > 0
    ? deal.recommendations[0]
    : discountPercentage > 15
      ? "Good discount! Consider buying now."
      : discountPercentage > 0
        ? "Limited discount. Compare with other options."
        : "No current discount. Consider waiting for a better deal.";
  
  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get match score color
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Format for star ratings - handle any type of input more robustly
  const formatRating = (rating: number | undefined | null) => {
    if (rating === undefined || rating === null) return "N/A";
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return isNaN(numRating) ? "N/A" : numRating.toFixed(1);
  };

  // Get the effective rating from multiple possible sources
  const getEffectiveRating = () => {
    // Try reviews.average_rating first
    if (deal.reviews?.average_rating !== undefined && deal.reviews.average_rating > 0) {
      return deal.reviews.average_rating;
    }
    // Then try seller_info.rating
    if (deal.seller_info?.rating !== undefined && deal.seller_info.rating > 0) {
      return deal.seller_info.rating;
    }
    // Return 0 if no rating found
    return 0;
  };

  // Get review count from multiple possible sources
  const getReviewCount = () => {
    // First check the reviews object
    if (deal.reviews?.count !== undefined && deal.reviews.count > 0) {
      return deal.reviews.count;
    }
    
    // Then try seller_info - need to handle type properly
    // TypeScript doesn't know about the 'reviews' property on seller_info
    if (deal.seller_info) {
      // Use type assertion for seller_info to access potential reviews property
      const sellerInfo = deal.seller_info as any;
      if (sellerInfo.reviews !== undefined && sellerInfo.reviews > 0) {
        return sellerInfo.reviews;
      }
    }
    
    // Return 0 if no review count found
    return 0;
  };

  // If essential properties are missing, log a warning
  if (!deal || !deal.id || !deal.title) {
    console.warn('DealCard received incomplete deal data:', deal);
  }

  // Get effective rating and review count
  const effectiveRating = getEffectiveRating();
  const reviewCount = getReviewCount();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {/* Deal image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={deal.image_url || '/placeholder-deal.jpg'}
          alt={deal.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Discount badge */}
        {discountPercentage > 0 && (
          <Badge className="absolute right-2 top-2 bg-red-500">
            {discountPercentage}% OFF
          </Badge>
        )}
        
        {/* Match score badge */}
        <Badge className={`absolute left-2 top-2 ${getMatchColor(matchScore)}`}>
          Match: {matchScore}%
        </Badge>
      </div>
      
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{deal.title}</h3>
        
        {/* Price information */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary">${deal.price}</p>
            {deal.original_price && (
              <p className="text-sm text-muted-foreground line-through">
                ${deal.original_price}
              </p>
            )}
          </div>
        </div>
        
        {/* Source with brand if available */}
        <div className="mb-3 flex items-center text-sm text-muted-foreground">
          <Tag className="mr-1 h-4 w-4" />
          <span>{deal.source} {deal.brand ? `· ${deal.brand}` : ''}</span>
        </div>
        
        {/* Reviews and ratings - Updated to use the new helper functions */}
        <div className="mb-3 flex items-center text-sm">
          <div className="flex items-center">
            {/* Display stars based on rating (up to 5) */}
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  i < Math.floor(effectiveRating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : i < effectiveRating 
                      ? 'text-yellow-400 fill-yellow-400 opacity-50' 
                      : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="ml-2 font-medium">{formatRating(effectiveRating)}</span>
          </div>
          {reviewCount > 0 && (
            <span className="ml-1 text-muted-foreground">({reviewCount})</span>
          )}
        </div>
        
        {/* AI Score */}
        {dealScore !== undefined && (
          <div className="mb-3 flex items-center">
            <BarChart className="mr-1 h-4 w-4 text-blue-400" />
            <span className="mr-1 text-sm font-medium">AI Score:</span>
            <span className={`text-sm font-bold ${getScoreColor(dealScore)}`}>
              {dealScore.toFixed(1)}
            </span>
          </div>
        )}
        
        {/* Shipping info */}
        {deal.shipping_info && (
          <div className="mb-3 flex items-center text-sm text-muted-foreground">
            <Truck className="mr-1 h-4 w-4" />
            <span>
              {deal.shipping_info.free_shipping
                ? 'Free Shipping'
                : `Shipping: ${deal.shipping_info.cost ? `$${deal.shipping_info.cost}` : 
                  deal.shipping_info.estimated_days ? `${deal.shipping_info.estimated_days} days` : 'N/A'}`}
              {deal.shipping_info.provider && ` via ${deal.shipping_info.provider}`}
            </span>
          </div>
        )}
        
        {/* Product recommendation */}
        <div className="mt-4 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded border-l-4 border-blue-500">
          <div className="flex items-start">
            <ThumbsUp className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
            <p>{recommendation}</p>
          </div>
        </div>
      </CardContent>
      
      {onTrack && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={() => onTrack(deal)} 
            variant={deal.is_tracked ? "outline" : "default"}
            className="w-full"
          >
            {deal.is_tracked ? "Untrack Deal" : "Track Deal"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper function to generate match descriptions
function getMatchDescription(score: number): string {
  if (score >= 90) return "Perfect match for your needs";
  if (score >= 80) return "Very good match for your preferences";
  if (score >= 70) return "Good match worth considering";
  if (score >= 50) return "Moderate match for your preferences";
  if (score >= 30) return "Partial match with some relevance";
  return "Limited match, may not meet your needs";
} 