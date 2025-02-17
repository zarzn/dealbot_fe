"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Tag, Clock, Truck, ExternalLink, LineChart, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dealsService } from '@/services/deals';
import type { DealSuggestion, AIAnalysis, PriceHistory } from '@/types/deals';
import PriceHistoryChart from '@/components/Deals/PriceHistoryChart';

export default function DealDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [deal, setDeal] = useState<DealSuggestion | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDealDetails();
    }
  }, [id]);

  const fetchDealDetails = async () => {
    try {
      const [dealData, analysisData, historyData] = await Promise.all([
        dealsService.getDealById(id),
        dealsService.getAIAnalysis(id),
        dealsService.getPriceHistory(id)
      ]);
      setDeal(dealData);
      setAnalysis(analysisData);
      setPriceHistory(historyData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch deal details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="aspect-video w-full bg-white/10 rounded-lg" />
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-white/10 rounded" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!deal || !analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">Deal not found</p>
        <Link
          href="/dashboard/deals"
          className="text-purple hover:underline mt-4 inline-block"
        >
          Back to Deals
        </Link>
      </div>
    );
  }

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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="aspect-video relative rounded-lg overflow-hidden">
            {deal.imageUrl ? (
              <Image
                src={deal.imageUrl}
                alt={deal.title}
                fill
                className="object-contain bg-white/[0.02]"
              />
            ) : (
              <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
                <Tag className="w-12 h-12 text-white/20" />
              </div>
            )}
          </div>

          {/* Price History Chart */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Price History</h2>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <LineChart className="w-4 h-4" />
                <span>Last 30 days</span>
              </div>
            </div>
            <div className="h-[300px]">
              <PriceHistoryChart
                data={priceHistory}
                currentPrice={deal.price}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg space-y-4">
            <h2 className="text-lg font-semibold">Product Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/70 text-sm">Category</div>
                <div>{deal.category}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Condition</div>
                <div>{deal.condition}</div>
              </div>
              {deal.warranty && (
                <div>
                  <div className="text-white/70 text-sm">Warranty</div>
                  <div>{deal.warranty}</div>
                </div>
              )}
              <div>
                <div className="text-white/70 text-sm">Stock Status</div>
                <div>{deal.inStock ? `In Stock (${deal.stockCount || 'Limited'})` : 'Out of Stock'}</div>
              </div>
            </div>

            {deal.features.length > 0 && (
              <div>
                <div className="text-white/70 text-sm mb-2">Key Features</div>
                <ul className="list-disc list-inside space-y-1">
                  {deal.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Analysis & Actions */}
        <div className="space-y-6">
          {/* Price Info */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">${deal.price.toFixed(2)}</span>
              {deal.originalPrice > deal.price && (
                <span className="text-white/50 line-through">
                  ${deal.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4" />
                <span>
                  {deal.shippingInfo.freeShipping
                    ? 'Free Shipping'
                    : `$${deal.shippingInfo.price.toFixed(2)} Shipping`}
                </span>
                {deal.shippingInfo.estimatedDays > 0 && (
                  <span className="text-white/70">
                    ({deal.shippingInfo.estimatedDays} days)
                  </span>
                )}
              </div>

              {/* Rating */}
              {deal.reviews.averageRating > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{deal.reviews.averageRating.toFixed(1)}</span>
                  <span className="text-white/70">
                    ({deal.reviews.count} reviews)
                  </span>
                </div>
              )}

              {/* Expiry */}
              {deal.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock className="w-4 h-4" />
                  <span>Deal expires in 2d</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg space-y-4">
            <h2 className="text-lg font-semibold">AI Analysis</h2>

            {/* Deal Score */}
            <div>
              <div className="text-white/70 text-sm mb-2">Deal Score</div>
              <div
                className={`px-3 py-1.5 rounded text-sm inline-flex items-center gap-2 ${
                  deal.score >= 8
                    ? 'bg-green-500/20 text-green-400'
                    : deal.score >= 6
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                <span>{deal.score}/10</span>
                {deal.score >= 8 ? 'Excellent Deal' : deal.score >= 6 ? 'Good Deal' : 'Fair Deal'}
              </div>
            </div>

            {/* Price Analysis */}
            <div>
              <div className="text-white/70 text-sm mb-2">Price Analysis</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-1 shrink-0" />
                  <p>{analysis.priceAnalysis.reasoning}</p>
                </div>
                {analysis.priceAnalysis.historicalContext && (
                  <p className="text-white/70 text-sm">
                    {analysis.priceAnalysis.historicalContext}
                  </p>
                )}
              </div>
            </div>

            {/* Buying Advice */}
            <div>
              <div className="text-white/70 text-sm mb-2">Buying Advice</div>
              <div className="space-y-2">
                <p>{analysis.buyingAdvice.recommendation}</p>
                <p className="text-white/70 text-sm">{analysis.buyingAdvice.timing}</p>
              </div>
            </div>

            {/* Alternative Deals */}
            {analysis.alternatives.length > 0 && (
              <div>
                <div className="text-white/70 text-sm mb-2">Alternative Deals</div>
                <div className="space-y-2">
                  {analysis.alternatives.map((alt, index) => (
                    <Link
                      key={index}
                      href={`/dashboard/deals/${alt.dealId}`}
                      className="block p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm">{alt.reason}</div>
                        <div className="text-sm text-white/70">
                          {alt.priceDifference > 0 ? '+' : ''}
                          ${alt.priceDifference.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 