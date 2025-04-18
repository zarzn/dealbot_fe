import { useRouter } from 'next/router';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PriceAlert, PriceChart, PriceHistory, PricePrediction } from '@/components/Price';
import { dealsService } from '@/services/deals';
import { DealResponse } from '@/types/deals';
import { useState } from 'react';

export default function PriceMonitoringPage() {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <PriceMonitoringContent />
    </QueryClientProvider>
  );
}

function PriceMonitoringContent() {
  const router = useRouter();
  const { dealId } = router.query;

  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', dealId],
    queryFn: () => (dealId ? dealsService.getDealDetails(dealId as string) : null),
    enabled: !!dealId,
  });

  if (isLoading) {
    return <div>Loading deal information...</div>;
  }

  if (!deal) {
    return <div>Deal not found</div>;
  }

  // Helper function to safely convert price to number
  const getPrice = (price: any): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return parseFloat(price);
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
        <div className="flex items-center space-x-4 text-gray-600">
          <p className="text-2xl font-semibold">${getPrice(deal.price).toFixed(2)}</p>
          {deal.original_price && getPrice(deal.original_price) > getPrice(deal.price) && (
            <p className="text-lg line-through">${getPrice(deal.original_price).toFixed(2)}</p>
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
            <PriceAlert dealId={deal.id} currentPrice={getPrice(deal.price)} />
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <PriceHistory dealId={deal.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 