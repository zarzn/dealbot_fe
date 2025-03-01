"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Tag, Clock, Truck, ExternalLink, LineChart, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDeal, useDealAnalysis, usePriceHistory } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import PriceHistoryChart from '@/components/Deals/PriceHistoryChart';
import TrackDealButton from '@/components/Deals/TrackDealButton';

export default function DealDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: deal, isLoading: isDealLoading } = useDeal(id);
  const { data: analysis, isLoading: isAnalysisLoading } = useDealAnalysis(id);
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
          <TrackDealButton dealId={id} isTracked={deal.is_tracked} />
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
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-cover"
            />
            {deal.original_price && (
              <div className="absolute top-2 right-2 bg-purple/90 text-white px-2 py-1 rounded text-sm font-medium">
                {calculateDiscount(deal.original_price, deal.price)}% OFF
              </div>
            )}
          </div>

          <div className="bg-white/[0.05] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">${deal.price.toFixed(2)}</p>
                {deal.original_price && (
                  <p className="text-white/70 text-sm line-through">
                    ${deal.original_price.toFixed(2)}
                  </p>
                )}
              </div>
              {deal.ai_analysis && (
                <div className="flex items-center gap-1 text-white/70">
                  <Star className="w-5 h-5 fill-current text-yellow-500" />
                  <span className="text-lg">{deal.ai_analysis.score.toFixed(1)}</span>
                  <span className="text-white/70">/ 10</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <Tag className="w-4 h-4" />
                <span>{deal.category}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>Expires in {new Date(deal.expires_at || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Truck className="w-4 h-4" />
                <span>
                  {deal.shipping_info?.estimated_days
                    ? `Ships in ${deal.shipping_info.estimated_days} days`
                    : 'Shipping info unavailable'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <LineChart className="w-4 h-4" />
                <span>Match Score: {deal.ai_analysis?.score?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>

            {/* Only show features if they exist */}
            {deal.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-white/70">{deal.description}</p>
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
                  <span className="font-semibold">{(analysis.score * 10).toFixed(1)}</span>
                  <span className="text-white/70">/ 10</span>
                </div>
              </div>

              {analysis.price_analysis && (
                <div>
                  <h3 className="font-semibold mb-2">Price Analysis</h3>
                  <div className="space-y-2">
                    {analysis.price_analysis.price_trend && (
                      <div className="bg-white/[0.02] p-3 rounded-lg">
                        <p className="text-sm text-white/70">
                          Price trend: {analysis.price_analysis.price_trend}
                        </p>
                      </div>
                    )}
                    {analysis.price_analysis.discount_percentage !== undefined && (
                      <div className="bg-white/[0.02] p-3 rounded-lg">
                        <p className="text-sm text-white/70">
                          Discount: {analysis.price_analysis.discount_percentage.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {analysis.price_analysis.is_good_deal !== undefined && (
                      <div className="bg-white/[0.02] p-3 rounded-lg">
                        <p className="text-sm text-white/70">
                          {analysis.price_analysis.is_good_deal 
                            ? "This appears to be a good deal based on our analysis." 
                            : "This may not be the best deal available."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysis.market_analysis && Object.keys(analysis.market_analysis).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Market Analysis</h3>
                  <div className="space-y-2">
                    {analysis.market_analysis.competition && (
                      <div className="bg-white/[0.02] p-3 rounded-lg">
                        <p className="text-sm text-white/70">
                          Competition: {analysis.market_analysis.competition}
                        </p>
                      </div>
                    )}
                    {analysis.market_analysis.availability && (
                      <div className="bg-white/[0.02] p-3 rounded-lg">
                        <p className="text-sm text-white/70">
                          Availability: {analysis.market_analysis.availability}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysis.recommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-white/70 space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.expiration_analysis && (
                <div>
                  <h3 className="font-semibold mb-2">Expiration</h3>
                  <div className="bg-white/[0.02] p-3 rounded-lg">
                    <p className="text-sm text-white/70">{analysis.expiration_analysis}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 