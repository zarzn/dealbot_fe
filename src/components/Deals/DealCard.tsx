import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Tag, Clock, Truck, ShoppingBag, ThumbsUp, BarChart2, Package, Shield, FileCheck, Share } from 'lucide-react';
import { FiHeart, FiEye, FiStar, FiCheckCircle, FiShare2 } from 'react-icons/fi';
import { Deal, DealSuggestion } from '@/types/deals';
import { calculateDiscount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import ShareButton from './ShareButton';

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
  // Debug logging to track what data is being received
  useEffect(() => {
    console.log("Deal card data:", deal);
  }, [deal]);

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
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
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

  return (
    <Card className={`overflow-hidden transition-all duration-200 bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] ${isSelected ? 'ring-2 ring-purple shadow-lg' : 'hover:shadow-md hover:scale-[1.01]'}`}>
      <Link href={`/dashboard/deals/${deal.id}`}>
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
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
                {discountPercent}% OFF
              </Badge>
            )}
            {deal.verified && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
            )}
            {deal.featured && (
              <Badge className="bg-purple/20 text-purple border-purple/30 backdrop-blur-sm flex items-center gap-1">
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
          {deal.latest_score && (
            <div className="absolute bottom-2 right-2 bg-white/10 text-white px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
              <BarChart2 className="h-3 w-3 text-purple" />
              <span className={`text-xs font-semibold ${getScoreColor(deal.latest_score)}`}>
                {typeof deal.latest_score === 'number' ? deal.latest_score.toFixed(1) : deal.latest_score}/10
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
            </div>
            
            {deal.seller_info && typeof deal.seller_info.rating === 'number' && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-white">
                  {deal.seller_info.rating.toFixed(1)}
                  {deal.seller_info.reviews && (
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
              <span className="text-xl font-bold text-white">
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
            
            {deal.shipping_info?.estimated_days && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-purple" />
                {deal.shipping_info.estimated_days} days delivery
              </div>
            )}
            
            {deal.source && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-purple" />
                {deal.source}
              </div>
            )}
            
            {showActions && onTrack && (
              <Button size="sm" variant={deal.is_tracked ? "default" : "outline"} 
                onClick={handleTrackClick}
                className={`mt-2 w-full ${deal.is_tracked ? 'bg-purple hover:bg-purple/90' : 'border-white/20 hover:bg-white/10'}`}>
                {deal.is_tracked ? "Tracking" : "Track Deal"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default DealCard; 