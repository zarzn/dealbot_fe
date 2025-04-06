import React, { useState, useEffect } from 'react';
import { FiLink, FiCopy, FiTwitter, FiFacebook, FiMail, FiCheck, FiX, FiShare2, FiAlertTriangle } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { getSession } from 'next-auth/react';
import { 
  Button, 
  Input, 
  Textarea,
  Switch,
  Select,
  SelectItem,
  Spinner,
  Alert,
} from '@/components/ui';
import { Deal } from '@/types/deals';
import { 
  ShareableContentType, 
  ShareVisibility, 
  ShareContentRequest 
} from '@/types/sharing';
import { createShareableContent } from '@/services/sharing';
import { authService } from '@/services/auth';
import { apiClient } from '@/lib/api-client';

// API path constants
const BASE_PATH = '/api/v1';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal;
  searchParams?: Record<string, any>;
  contentType: ShareableContentType;
  onShare?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  deal,
  searchParams,
  contentType,
  onShare,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [personalNotes, setPersonalNotes] = useState<string>('');
  const [includeNotes, setIncludeNotes] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<ShareVisibility>(ShareVisibility.PUBLIC);
  const [expirationDays, setExpirationDays] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Reset form and set defaults when modal opens
  useEffect(() => {
    if (isOpen && isMounted) {
      // Reset all fields
      setError(null);
      setIsShared(false);
      setShareUrl('');
      
      // Set default values based on content type
      if (contentType === ShareableContentType.DEAL && deal) {
        setTitle(`Check out this deal: ${deal.title}`);
        setDescription(deal.description?.substring(0, 100) || '');
      } else if (contentType === ShareableContentType.SEARCH_RESULTS) {
        setTitle('Check out these search results');
        setDescription('I found some interesting deals you might like.');
      } else {
        setTitle('');
        setDescription('');
      }
      
      setPersonalNotes('');
      setIncludeNotes(false);
      setVisibility(ShareVisibility.PUBLIC);
      setExpirationDays(undefined);
    }
  }, [isOpen, deal, contentType, isMounted]);

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (includeNotes && !personalNotes.trim()) {
      setError('Personal notes cannot be empty if enabled');
      return false;
    }
    
    return true;
  };

  // Function to verify authentication before sharing
  const verifyAuthentication = async (): Promise<boolean> => {
    try {
      console.log('[AUTH DEBUG] Verifying authentication for sharing...');
      
      // First check localStorage for token (our main auth method)
      const localAccessToken = localStorage.getItem('access_token');
      
      if (localAccessToken) {
        console.log('[AUTH DEBUG] Found access token in localStorage');
        return true;
      }
      
      // Fallback to NextAuth session if no localStorage token
      const session = await getSession();
      
      console.log('[AUTH DEBUG] Session status:', {
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
        hasLocalToken: !!localAccessToken,
        user: session?.user?.email || 'No user'
      });
      
      if (!session?.accessToken && !localAccessToken) {
        console.error('[AUTH DEBUG] No active session found for sharing');
        setError('You must be logged in to share content. Please sign in and try again.');
        return false;
      }
      
      // Additional token verification
      try {
        // Make a lightweight API call to verify the token is valid
        const token = localAccessToken || session?.accessToken;
        await apiClient.get('/api/v1/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log('[AUTH DEBUG] Token verification successful');
      } catch (verifyError) {
        console.error('[AUTH DEBUG] Token verification failed:', verifyError);
        // Continue anyway since we'll handle auth errors during the actual share request
      }
      
      console.log('[AUTH DEBUG] Authentication verified successfully');
      return true;
    } catch (error) {
      console.error('[AUTH DEBUG] Error verifying authentication:', error);
      setError('Authentication error. Please try signing in again.');
      return false;
    }
  };

  // Handle share action
  const handleShare = async () => {
    console.log('[SHARE DEBUG] Starting share process...');
    if (!validateForm()) {
      console.log('[SHARE DEBUG] Form validation failed');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('[SHARE DEBUG] Set loading state, cleared errors');

    // First verify authentication
    console.log('[SHARE DEBUG] Verifying authentication...');
    const isAuthenticated = await verifyAuthentication();
    if (!isAuthenticated) {
      console.log('[SHARE DEBUG] Authentication verification failed');
      setIsLoading(false);
      return;
    }
    console.log('[SHARE DEBUG] Authentication verified successfully');

    const request: ShareContentRequest = {
      content_type: contentType as ShareableContentType,
      title,
      description,
      personal_notes: includeNotes ? personalNotes : undefined,
      visibility,
      expiration_days: parseInt(expirationDays?.toString() || '0'),
      include_personal_notes: includeNotes
    };

    if (contentType === ShareableContentType.DEAL && deal) {
      request.content_id = deal.id;
    } else if (contentType === ShareableContentType.SEARCH_RESULTS && searchParams) {
      request.search_params = searchParams;
    }
    
    console.log('[SHARE DEBUG] Prepared share request:', request);

    try {
      // Create shareable content
      console.log('[SHARE DEBUG] Calling createShareableContent...');
      const response = await createShareableContent(request);
      console.log('[SHARE DEBUG] Share request successful:', response);
      
      // Always use the production domain for share links
      let sharableUrl = response.shareable_link;
      
      if (typeof window !== 'undefined' && sharableUrl) {
        // Get the production URL from environment variables
        const productionDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://rebaton.ai';
        
        if (!sharableUrl.startsWith('http')) {
          // If it's a relative URL, prepend the production domain
          sharableUrl = `${productionDomain}${sharableUrl.startsWith('/') ? '' : '/'}${sharableUrl}`;
          console.log('[SHARE DEBUG] Converted relative URL to absolute using production domain:', sharableUrl);
        } else {
          try {
            // For any absolute URL, replace the domain part with the production domain
            const urlObj = new URL(sharableUrl);
            sharableUrl = sharableUrl.replace(`${urlObj.protocol}//${urlObj.host}`, productionDomain);
            console.log('[SHARE DEBUG] Replaced domain with production domain:', sharableUrl);
          } catch (urlError) {
            console.error('[SHARE DEBUG] Error parsing URL:', urlError);
            // If URL parsing fails, keep the original URL
          }
        }
      }
      
      // Store share URL in state and local storage for resilience
      setShareUrl(sharableUrl);
      
      // Store in localStorage to prevent loss during redirects
      if (typeof window !== 'undefined' && sharableUrl) {
        localStorage.setItem('last_share_url', sharableUrl);
        localStorage.setItem('last_share_title', title);
        console.log('[SHARE DEBUG] Stored share URL in localStorage');
      }
      
      // Update state
      setIsShared(true);
      setIsLoading(false);
      
      if (onShare) {
        onShare();
      }
      
      console.log('[SHARE DEBUG] Share process completed successfully');
      toast.success('Content shared successfully!');
    } catch (error: any) {
      console.error('[SHARE DEBUG] Failed to share content:', error);
      console.error('[SHARE DEBUG] Error details:', {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        stack: error.stack
      });
      
      // Check for authentication errors
      if (error.message && error.message.includes('Authentication')) {
        setError('Authentication error. Please sign in again and retry.');
      } else {
        setError(error.response?.data?.detail || error.message || 'Failed to share content');
      }
      
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success('Link copied to clipboard!'))
        .catch(err => {
          console.error('Failed to copy link:', err);
          toast.error('Failed to copy link to clipboard');
        });
    }
  };

  const safeOpenWindow = (url: string) => {
    try {
      const newWindow = window.open(url, '_blank');
      // If popup blocked or other issue
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback - copy to clipboard and show instructions
        navigator.clipboard.writeText(shareUrl || '')
          .then(() => {
            toast.success('Link copied to clipboard. Please share manually.');
          })
          .catch(() => {
            toast.error('Could not open sharing window. Please copy link manually.');
          });
      }
    } catch (error) {
      console.error('Error opening share window:', error);
      toast.error('Could not open sharing window');
    }
  };

  const shareOnTwitter = () => {
    if (shareUrl) {
      const text = encodeURIComponent(title);
      const url = encodeURIComponent(shareUrl);
      safeOpenWindow(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    }
  };

  const shareOnFacebook = () => {
    if (shareUrl) {
      const url = encodeURIComponent(shareUrl);
      safeOpenWindow(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
    }
  };

  const shareByEmail = () => {
    if (shareUrl) {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${description}\n\n${shareUrl}`);
      safeOpenWindow(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 z-50 overflow-y-auto" 
        onClose={isLoading ? () => {} : onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          {/* Center modal contents */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#121212]/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                {isShared ? 'Share Your Link' : 'Share Content'}
              </Dialog.Title>
              
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={onClose}
                disabled={isLoading}
              >
                <FiX className="h-5 w-5" />
              </button>

              {error && (
                <Alert
                  variant="destructive"
                  className="mt-4"
                >
                  <FiAlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </Alert>
              )}

              <div className="mt-4">
                {!isShared ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="share-title" className="block text-sm font-medium text-white/70">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="share-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for this share"
                        className="w-full mt-1 bg-white/5 border border-white/10 text-white"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div>
                      <label htmlFor="share-description" className="block text-sm font-medium text-white/70">
                        Description (optional)
                      </label>
                      <Textarea
                        id="share-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description"
                        rows={2}
                        className="w-full mt-1 bg-white/5 border border-white/10 text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="include-notes" className="text-sm font-medium text-white/70">
                        Include personal notes
                      </label>
                      <Switch
                        id="include-notes"
                        checked={includeNotes}
                        onCheckedChange={setIncludeNotes}
                      />
                    </div>

                    {includeNotes && (
                      <div>
                        <label htmlFor="personal-notes" className="block text-sm font-medium text-white/70">
                          Personal Notes <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          id="personal-notes"
                          value={personalNotes}
                          onChange={(e) => setPersonalNotes(e.target.value)}
                          placeholder="Add personal notes (visible to recipients)"
                          rows={3}
                          className="w-full mt-1 bg-white/5 border border-white/10 text-white"
                          required={includeNotes}
                          aria-required={includeNotes ? "true" : "false"}
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="visibility" className="block text-sm font-medium text-white/70">
                        Visibility
                      </label>
                      <Select
                        id="visibility"
                        value={visibility}
                        onValueChange={(value) => setVisibility(value as ShareVisibility)}
                        className="bg-white/5 border border-white/10 text-white"
                      >
                        <SelectItem value={ShareVisibility.PUBLIC} className="text-white bg-black/60">
                          Public (Anyone with the link)
                        </SelectItem>
                        <SelectItem value={ShareVisibility.PRIVATE} className="text-white bg-black/60">
                          Private (Only authenticated users)
                        </SelectItem>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="expiration" className="block text-sm font-medium text-white/70">
                        Expires After (days, optional)
                      </label>
                      <Select
                        id="expiration"
                        value={expirationDays?.toString() || ""}
                        onValueChange={(value) => setExpirationDays(value ? parseInt(value) : undefined)}
                        className="bg-white/5 border border-white/10 text-white"
                      >
                        <SelectItem value="" className="text-white bg-black/60">Never expires</SelectItem>
                        <SelectItem value="1" className="text-white bg-black/60">1 day</SelectItem>
                        <SelectItem value="7" className="text-white bg-black/60">7 days</SelectItem>
                        <SelectItem value="30" className="text-white bg-black/60">30 days</SelectItem>
                        <SelectItem value="90" className="text-white bg-black/60">90 days</SelectItem>
                      </Select>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <Button 
                        variant="ghost" 
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleShare} 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Sharing...
                          </>
                        ) : (
                          <>
                            <FiShare2 className="mr-2 h-4 w-4" />
                            Share
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="share-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Share Link
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <Input
                          id="share-url"
                          value={shareUrl}
                          readOnly
                          className="flex-grow rounded-none rounded-l-md bg-white/5 border border-white/10 text-white"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-none rounded-r-md bg-white/10 border border-white/10 hover:bg-white/20 text-white"
                          onClick={handleCopyLink}
                        >
                          <FiCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white/70 mb-2">
                        Share on Social Media
                      </p>
                      <div className="flex space-x-2 flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={shareOnTwitter} className="bg-white/5 border border-white/10 hover:bg-white/20 text-white">
                          <FiTwitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                        <Button variant="outline" size="sm" onClick={shareOnFacebook} className="bg-white/5 border border-white/10 hover:bg-white/20 text-white">
                          <FiFacebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                        <Button variant="outline" size="sm" onClick={shareByEmail} className="bg-white/5 border border-white/10 hover:bg-white/20 text-white">
                          <FiMail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <Button onClick={onClose} variant="default" className="text-white">
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

// Export as both named and default export for compatibility
export default ShareModal; 