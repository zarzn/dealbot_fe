import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dealsService } from '@/services/deals';

interface TrackDealButtonProps {
  dealId: string;
  isTracked?: boolean;
  onTrackingChange?: (isTracked: boolean) => void;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function TrackDealButton({
  dealId,
  isTracked = false,
  onTrackingChange,
  variant = 'full',
  className = '',
}: TrackDealButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTrackedState, setIsTrackedState] = useState(isTracked);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isTrackedState) {
        await dealsService.untrackDeal(dealId);
        toast.success('Deal removed from tracking');
      } else {
        await dealsService.trackDeal(dealId);
        toast.success('Deal added to tracking');
      }
      setIsTrackedState(!isTrackedState);
      onTrackingChange?.(!isTrackedState);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tracking');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`p-2 rounded-lg transition ${
          isTrackedState
            ? 'text-purple hover:bg-purple/10'
            : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
        } ${className}`}
        title={isTrackedState ? 'Stop tracking deal' : 'Track deal'}
      >
        <Bookmark
          className={`w-5 h-5 ${isTrackedState ? 'fill-current' : ''}`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
        isTrackedState
          ? 'bg-purple/20 text-purple hover:bg-purple/30'
          : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white'
      } ${className}`}
    >
      <Bookmark className={`w-4 h-4 ${isTrackedState ? 'fill-current' : ''}`} />
      <span>{isTrackedState ? 'Tracking' : 'Track Deal'}</span>
    </button>
  );
} 