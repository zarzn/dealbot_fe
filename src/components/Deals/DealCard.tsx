import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Tag, Clock, Truck, ShoppingBag, ThumbsUp, BarChart } from 'lucide-react';
import { FiHeart, FiEye, FiStar, FiCheckCircle } from 'react-icons/fi';
import { Deal, DealSuggestion } from '@/types/deals';
import { calculateDiscount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface DealCardProps {
  deal: Deal;
  onTrack?: (deal: Deal) => void;
  onFavorite?: (dealId: string) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
  isSelected?: boolean;
}

export function DealCard({ deal, onTrack, onFavorite, isFavorite = false, isLoading = false, isSelected = false }: DealCardProps) {
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

  // Calculate discount percentage
  const discountPercent = React.useMemo(() => {
    if (deal.original_price && deal.price) {
      return Math.round(100 - (deal.price / deal.original_price) * 100);
    }
    return 0;
  }, [deal.original_price, deal.price]);

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
    <Card className={`overflow-hidden transition-shadow ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}>
      <Link href={`/deals/${deal.id}`}>
        <div className="relative h-48 bg-gray-100">
          {deal.image_url ? (
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
            </div>
          )}
          
          {/* Deal indicators */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <Badge className="bg-red-500 text-white border-0">
                {discountPercent}% OFF
              </Badge>
            )}
            {deal.verified && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <FiCheckCircle size={12} />
                Verified
              </Badge>
            )}
            {deal.featured && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <FiStar size={12} />
                Featured
              </Badge>
            )}
          </div>
         
          {/* Favorite button */}
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 hover:text-primary rounded-full w-8 h-8 p-1 shadow-sm"
              disabled={isLoading}
            >
              <FiHeart 
                size={18} 
                className={isFavorite ? "fill-primary text-primary" : ""} 
              />
            </Button>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium text-lg line-clamp-2">{deal.title}</h3>
          <p className="text-gray-500 text-sm line-clamp-2 mt-1">{deal.description}</p>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {deal.category && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {deal.category}
                </Badge>
              )}
              
              {formattedDate && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formattedDate}
                </Badge>
              )}
            </div>
            
            {deal.seller_info && typeof deal.seller_info.rating === 'number' && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs">{deal.seller_info.rating.toFixed(1)}</span>
                {deal.seller_info.reviews && (
                  <span className="text-xs text-gray-400 ml-1">({deal.seller_info.reviews})</span>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-baseline">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">${typeof deal.price === 'number' ? deal.price.toFixed(2) : 'N/A'}</span>
              {deal.original_price && typeof deal.original_price === 'number' && (
                <span className="text-sm line-through text-white/60">
                  ${deal.original_price.toFixed(2)}
                </span>
              )}
            </div>
            {deal.original_price && typeof deal.original_price === 'number' && 
             typeof deal.price === 'number' && deal.original_price > deal.price && (
              <>
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-100">
                  {discountPercent}% off
                </Badge>
              </>
            )}
          </div>

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {deal.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {deal.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{deal.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 px-4 pb-4 flex justify-between">
          <div className="flex gap-2 text-xs text-gray-500">
            {deal.shipping_info?.free_shipping && (
              <div className="flex items-center">
                <Truck className="h-3 w-3 mr-1" />
                Free Shipping
              </div>
            )}
          </div>
          
          {onTrack && (
            <Button size="sm" variant="outline" onClick={handleTrackClick}>
              {deal.is_tracked ? "Untrack" : "Track Deal"}
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}

export default DealCard; 