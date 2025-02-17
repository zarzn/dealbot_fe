import { useQuery } from '@tanstack/react-query';
import { priceService } from '@/services/price';
import { PricePrediction as PricePredictionType, PriceTrends } from '@/types/price';

interface PricePredictionProps {
  dealId: string;
}

export const PricePrediction = ({ dealId }: PricePredictionProps) => {
  const { data: prediction, isLoading } = useQuery({
    queryKey: ['prediction', dealId],
    queryFn: () => priceService.getPrediction(dealId)
  });

  const { data: trends } = useQuery({
    queryKey: ['trends', dealId],
    queryFn: () => priceService.getPriceTrends(dealId)
  });

  if (isLoading) {
    return <div>Loading prediction...</div>;
  }

  if (!prediction) {
    return <div>No prediction available</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Price Prediction</h3>
      <div className="space-y-4">
        <div>
          <span className="text-sm text-gray-500">Predicted Price</span>
          <div className="text-2xl font-bold">
            ${prediction.price.toFixed(2)}
            <span className="text-sm text-gray-500 ml-2">
              {prediction.confidence}% confidence
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Model: {prediction.model_name}
          </div>
        </div>
        {trends && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Trend Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Direction</span>
                <div className="font-medium capitalize">{trends.direction}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Strength</span>
                <div className="font-medium">{trends.strength}%</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Seasonality</span>
                <div className="font-medium">{trends.seasonality_score}%</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Period</span>
                <div className="font-medium">{trends.trend_period}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 