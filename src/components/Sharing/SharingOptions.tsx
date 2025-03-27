"use client";

import React, { useState } from 'react';
import { Copy, Share, Twitter, Facebook, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';

interface SharingOptionsProps {
  dealId: string;
  dealTitle: string;
  shareUrl?: string;
  isPublic?: boolean;
  onTogglePublic?: (isPublic: boolean) => Promise<void>;
}

export const SharingOptions: React.FC<SharingOptionsProps> = ({
  dealId,
  dealTitle,
  shareUrl = `${window.location.origin}/deals/${dealId}`,
  isPublic = true,
  onTogglePublic
}) => {
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dealTitle,
          text: `Check out this deal: ${dealTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      // Fallback for browsers that don't support sharing
      handleCopyLink();
    }
  };

  const handleTogglePublic = async () => {
    if (onTogglePublic) {
      setIsToggling(true);
      try {
        await onTogglePublic(!isPublic);
      } catch (err) {
        console.error('Error toggling deal visibility:', err);
      } finally {
        setIsToggling(false);
      }
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this deal: ${dealTitle}`)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(`Check out this deal: ${dealTitle}`)}&body=${encodeURIComponent(`I found this great deal and thought you might be interested: ${shareUrl}`)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Sharing</h3>
          {onTogglePublic && (
            <div className="flex items-center space-x-2">
              <Switch 
                checked={isPublic} 
                onCheckedChange={handleTogglePublic}
                disabled={isToggling}
              />
              <span className="text-xs text-gray-500">
                {isPublic ? 'Public' : 'Private'}
              </span>
              {isToggling && <Spinner size="sm" />}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy deal link to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {navigator.share && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share using device sharing options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => window.open(twitterShareUrl, '_blank')}
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on Twitter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => window.open(facebookShareUrl, '_blank')}
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on Facebook</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => window.open(emailShareUrl, '_blank')}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share via Email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SharingOptions; 