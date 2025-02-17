import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { PricePoint } from '@/types/price';
import { priceService } from '@/services/price';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  dealId: string;
}

export const PriceChart = ({ dealId }: PriceChartProps) => {
  const { data: priceHistory, isLoading } = useQuery({
    queryKey: ['priceHistory', dealId],
    queryFn: () => priceService.getPriceHistory(dealId)
  });

  const { data: prediction } = useQuery({
    queryKey: ['prediction', dealId],
    queryFn: () => priceService.getPrediction(dealId)
  });

  if (isLoading || !priceHistory) {
    return <div>Loading price data...</div>;
  }

  const data = {
    labels: priceHistory.map(p => format(new Date(p.timestamp), 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Historical Price',
        data: priceHistory.map(p => p.price),
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
        tension: 0.1
      },
      prediction && {
        label: 'Predicted Price',
        data: prediction.map(p => p.price),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1
      }
    ].filter(Boolean)
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price History & Prediction'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price ($)'
        }
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
}; 