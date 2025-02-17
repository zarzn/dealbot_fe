import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { priceService } from '@/services/price';
import { PricePoint } from '@/types/price';

interface PriceHistoryProps {
  dealId: string;
}

export const PriceHistory = ({ dealId }: PriceHistoryProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['priceHistory', dealId],
    queryFn: () => priceService.getPriceHistory(dealId)
  });

  if (isLoading) {
    return <div>Loading price history...</div>;
  }

  if (!history || history.length === 0) {
    return <div>No price history available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((point: PricePoint, index: number) => {
            const prevPrice = index > 0 ? history[index - 1].price : point.price;
            const change = ((point.price - prevPrice) / prevPrice) * 100;
            const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';

            return (
              <tr key={point.timestamp}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(point.timestamp), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${point.price.toFixed(2)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${changeColor}`}>
                  {change !== 0 && (change > 0 ? '+' : '')}{change.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 