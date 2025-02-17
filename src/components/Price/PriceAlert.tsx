import { useState } from 'react';
import { priceService } from '@/services/price';

interface PriceAlertProps {
  dealId: string;
  currentPrice: number;
}

export const PriceAlert = ({ dealId, currentPrice }: PriceAlertProps) => {
  const [threshold, setThreshold] = useState(currentPrice * 0.9);
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackPrice = async () => {
    try {
      await priceService.createTracker(dealId, threshold);
      setIsTracking(true);
    } catch (error) {
      console.error('Failed to create price tracker:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Price Alert</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Alert me when price drops below
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="pl-7 block w-full rounded-md border-gray-300"
              placeholder="0.00"
            />
          </div>
        </div>
        <button
          onClick={handleTrackPrice}
          disabled={isTracking}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          {isTracking ? 'Tracking Price' : 'Track Price'}
        </button>
      </div>
    </div>
  );
}; 