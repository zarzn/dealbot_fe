"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Tag, Clock, Truck, ExternalLink, LineChart, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDealDetails, useAIAnalysis, usePriceHistory } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import PriceHistoryChart from '@/components/Deals/PriceHistoryChart';
import TrackDealButton from '@/components/Deals/TrackDealButton';

export default function DealDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: deal, isLoading: isDealLoading } = useDealDetails(id);
  const { data: analysis, isLoading: isAnalysisLoading } = useAIAnalysis(id);
  const { data: priceHistory, isLoading: isPriceHistoryLoading } = usePriceHistory(id);

  const isLoading = isDealLoading || isAnalysisLoading || isPriceHistoryLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/deals"
            className="p-2 hover:bg-white/[0.05] rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!deal || !analysis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/30" />
        <h3 className="text-lg font-semibold mb-2">Deal not found</h3>
        <p className="text-white/70 mb-6">This deal may have expired or been removed</p>
        <Link
          href="/dashboard/deals"
          className="text-purple hover:underline"
        >
          Back to Deals
        </Link>
      </div>
    );
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/deals"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{deal.title}</h1>
          <p className="text-white/70">From {deal.source}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrackDealButton dealId={id} isTracked={deal.isTracked} />
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition flex items-center gap-2"
          >
            <span>View Deal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Deal Info */}
        <div className="space-y-6">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              fill
              className="object-cover"
            />
            {deal.originalPrice && (
              <div className="absolute top-2 right-2 bg-purple/90 text-white px-2 py-1 rounded text-sm font-medium">
                {calculateDiscount(deal.originalPrice, deal.price)}% OFF
              </div>
            )}
          </div>

          <div className="bg-white/[0.05] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">${deal.price.toFixed(2)}</p>
                {deal.originalPrice && (
                  <p className="text-white/70 text-sm line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-white/70">
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <span className="text-lg">{deal.reviews.averageRating.toFixed(1)}</span>
                <span className="text-sm">({deal.reviews.count} reviews)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <Tag className="w-4 h-4" />
                <span>{deal.category}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>Expires in {new Date(deal.expiresAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Truck className="w-4 h-4" />
                <span>
                  {deal.shippingInfo.freeShipping
                    ? 'Free Shipping'
                    : `Ships in ${deal.shippingInfo.estimatedDays} days`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <LineChart className="w-4 h-4" />
                <span>Match Score: {deal.score.toFixed(1)}</span>
              </div>
            </div>

            {deal.features && deal.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <ul className="list-disc list-inside text-white/70 space-y-1">
                  {deal.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-6">
          <div className="bg-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Price History</h2>
            <div className="h-[300px]">
              {priceHistory && <PriceHistoryChart data={priceHistory} currentPrice={deal.price} />}
            </div>
          </div>

          <div className="bg-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Deal Score</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{analysis.score.toFixed(1)}</span>
                  <span className="text-white/70">/ 10</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Factors</h3>
                <div className="space-y-2">
                  {analysis.factors.map((factor, index) => (
                    <div key={index} className="bg-white/[0.02] p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{factor.factor}</span>
                        <span className={`text-sm ${
                          factor.impact > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-white/70 space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 