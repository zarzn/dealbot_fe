import React, { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';
import { Button, Tooltip } from '@/components/ui';
import { ShareModal } from './ShareModal';
import { Deal } from '@/types/deals';
import { ShareableContentType } from '@/types/sharing';

interface ShareButtonProps {
  deal?: Deal;
  searchParams?: Record<string, any>;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  tooltip?: string;
  onShare?: () => void;
  disabled?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  deal,
  searchParams,
  variant = 'outline',
  size = 'icon',
  className = '',
  tooltip = 'Share',
  onShare,
  disabled = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine content type based on provided props
  const contentType = deal 
    ? ShareableContentType.DEAL 
    : ShareableContentType.SEARCH_RESULTS;

  const handleOpenModal = () => {
    if (disabled) return;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  // Ensure we have required data before enabling the button
  const isShareable = Boolean(
    (contentType === ShareableContentType.DEAL && deal) || 
    (contentType === ShareableContentType.SEARCH_RESULTS && searchParams)
  );

  const buttonDisabled = disabled || !isShareable;

  // Updated styling for the share button
  const defaultButtonClass = "inline-flex items-center justify-center text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white/5 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-md border border-white/10";

  return (
    <>
      <Tooltip content={tooltip}>
        <Button
          variant={variant}
          size={size}
          onClick={handleOpenModal}
          className={`${defaultButtonClass} ${className}`}
          aria-label="Share"
          disabled={buttonDisabled}
        >
          <FiShare2 className={`h-4 w-4 ${size !== 'icon' ? 'mr-1' : ''}`} />
          {size !== 'icon' && 'Share'}
        </Button>
      </Tooltip>

      <ShareModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        deal={deal}
        searchParams={searchParams}
        contentType={contentType}
        onShare={handleShare}
      />
    </>
  );
};

export default ShareButton; 