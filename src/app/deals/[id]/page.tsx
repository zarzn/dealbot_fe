"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dealsService } from '@/services/deals';
import { Deal, PriceHistory } from '@/types/deals';
import PriceHistoryChart from '@/components/Deals/PriceHistoryChart';
import TrackDealButton from '@/components/Deals/TrackDealButton';

export default function DealDetailsPage() {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const fetchDealDetails = async () => {
      if (!id) {
        setError('Invalid deal ID');
        setIsLoading(false);
        return;
      }

      try {
        const [dealData, priceHistoryData] = await Promise.all([
          dealsService.getDealDetails(id),
          dealsService.getPriceHistory(id),
        ]);
        setDeal(dealData);
        setPriceHistory(priceHistoryData);
      } catch (err: any) {
        setError(err.message || 'Failed to load deal details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealDetails();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!deal) {
    return <div>Deal not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">{deal.title}</h1>
          <p className="text-gray-400">{deal.description}</p>
        </div>
        <TrackDealButton dealId={id} isTracked={deal.isTracked} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/[0.02] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <div className="h-[300px]">
            <PriceHistoryChart data={priceHistory} currentPrice={deal.price} />
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Deal Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Current Price</p>
              <p className="text-2xl font-bold">${deal.price.toFixed(2)}</p>
            </div>
            {deal.originalPrice && (
              <div>
                <p className="text-gray-400">Original Price</p>
                <p className="text-xl line-through text-gray-500">
                  ${deal.originalPrice.toFixed(2)}
                </p>
              </div>
            )}
            {deal.seller && (
              <div>
                <p className="text-gray-400">Seller</p>
                <p>{deal.seller}</p>
              </div>
            )}
            {deal.shippingInfo && (
              <div>
                <p className="text-gray-400">Shipping</p>
                <p>
                  {deal.shippingInfo.freeShipping
                    ? 'Free Shipping'
                    : `$${deal.shippingInfo.cost.toFixed(2)}`}
                </p>
              </div>
            )}
            {deal.reviews && (
              <div>
                <p className="text-gray-400">Reviews</p>
                <p>
                  {deal.reviews.averageRating.toFixed(1)} ★ ({deal.reviews.count}{' '}
                  reviews)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 