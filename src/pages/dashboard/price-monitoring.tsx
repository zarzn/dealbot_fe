import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { PriceAlert, PriceChart, PriceHistory, PricePrediction } from '@/components/Price';
import { dealsService } from '@/services/deals';
import { DealSuggestion } from '@/types/deals';

export default function PriceMonitoringPage() {
  const router = useRouter();
  const { dealId } = router.query;

  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', dealId],
    queryFn: () => (dealId ? dealsService.getDealById(dealId as string) : null),
    enabled: !!dealId,
  });

  if (isLoading) {
    return <div>Loading deal information...</div>;
  }

  if (!deal) {
    return <div>Deal not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
        <div className="flex items-center space-x-4 text-gray-600">
          <p className="text-2xl font-semibold">${deal.price}</p>
          {deal.originalPrice > deal.price && (
            <p className="text-lg line-through">${deal.originalPrice}</p>
          )}
          {deal.source && (
            <p className="text-sm">from {deal.source}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow">
            <PriceChart dealId={deal.id} />
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <PricePrediction dealId={deal.id} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow">
            <PriceAlert dealId={deal.id} currentPrice={deal.price} />
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <PriceHistory dealId={deal.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 