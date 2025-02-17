import Link from 'next/link';
import Image from 'next/image';
import { Star, Tag, Clock, Truck } from 'lucide-react';
import { DealSuggestion } from '@/types/deals';

interface DealCardProps {
  deal: DealSuggestion;
}

export default function DealCard({ deal }: DealCardProps) {
  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <Link
      href={`/dashboard/deals/${deal.id}`}
      className="bg-white/[0.05] rounded-xl overflow-hidden border border-white/10 hover:border-purple/50 transition group"
    >
      <div className="aspect-video relative">
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
            <Tag className="w-8 h-8 text-white/20" />
          </div>
        )}
        {/* Discount badge */}
        {deal.originalPrice > deal.price && (
          <div className="absolute top-2 right-2 bg-purple/90 text-white px-2 py-1 rounded-lg text-sm font-medium">
            {calculateDiscount(deal.originalPrice, deal.price)}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-purple transition">
          {deal.title}
        </h3>
        
        <div className="mt-2 space-y-2">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">${deal.price.toFixed(2)}</span>
            {deal.originalPrice > deal.price && (
              <span className="text-white/50 line-through text-sm">
                ${deal.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-white/70">
            {/* Rating */}
            {deal.reviews.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{deal.reviews.averageRating.toFixed(1)}</span>
              </div>
            )}
            {/* Source */}
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{deal.source}</span>
            </div>
            {/* Expiry */}
            {deal.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Expires in 2d</span>
              </div>
            )}
          </div>

          {/* AI Score */}
          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-1 rounded text-sm ${
                deal.score >= 8
                  ? 'bg-green-500/20 text-green-400'
                  : deal.score >= 6
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              AI Score: {deal.score}/10
            </div>
            {deal.shippingInfo.freeShipping && (
              <span className="text-sm text-white/70">
                Free Shipping
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 