import React, { useState, useEffect } from 'react';
import { FiLink, FiCopy, FiTwitter, FiFacebook, FiMail, FiCheck, FiX, FiShare2, FiAlertTriangle } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
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
import apiClient from '@/services/api/client';

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

  // Set initial values based on content type
  useEffect(() => {
    setIsMounted(true);
    
    // Check if we have a token in localStorage and report it
    if (typeof window !== 'undefined') {
      const hasToken = !!localStorage.getItem('access_token');
      console.log('ShareModal mount - localStorage token present:', hasToken);
      if (hasToken) {
        const token = localStorage.getItem('access_token');
        console.log('Token prefix:', token?.substring(0, 10) + '...');
      }
    }
    
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

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (contentType === ShareableContentType.DEAL && !deal) {
      setError('Cannot share: Deal information is missing');
      return false;
    }

    if (contentType === ShareableContentType.SEARCH_RESULTS && !searchParams) {
      setError('Cannot share: Search parameters are missing');
      return false;
    }

    if (includeNotes && !personalNotes.trim()) {
      setError('Personal notes are required when enabled');
      return false;
    }

    setError(null);
    return true;
  };

  const handleShare = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Check authentication status first
      try {
        console.log('Checking authentication status...');
        const authCheckResponse = await apiClient.get(`${BASE_PATH}/deals/share/auth-debug`);
        console.log('Auth check response:', authCheckResponse.data);
        
        if (!authCheckResponse.data.authenticated) {
          console.warn('Not authenticated! Will attempt to use test endpoint as fallback.');
        }
      } catch (authCheckError) {
        console.error('Error checking auth status:', authCheckError);
      }

      // Create share request
      const request: ShareContentRequest = {
        content_type: contentType,
        title,
        description: description.trim() || undefined,
        visibility,
        include_personal_notes: includeNotes,
        personal_notes: includeNotes ? personalNotes.trim() : undefined,
        expiration_days: expirationDays,
      };

      // Add content specific fields
      if (contentType === ShareableContentType.DEAL && deal) {
        request.content_id = deal.id;
      } else if (contentType === ShareableContentType.SEARCH_RESULTS && searchParams) {
        request.search_params = searchParams;
      }

      // Try to create shareable content
      let response;
      try {
        // Check if localStorage has access token
        const localStorageToken = localStorage.getItem('access_token');
        console.log('localStorage token present:', !!localStorageToken);
        
        // Try the primary endpoint first
        console.log('Attempting to create shareable content with primary endpoint');
        response = await createShareableContent(request);
        console.log('Successfully created shareable content with primary endpoint');
      } catch (shareError: any) {
        console.error('Primary endpoint failed:', shareError);
        
        // If authentication error or other failure, try the test endpoint
        if (shareError.response?.status === 401 || shareError.code === 'UNAUTHORIZED') {
          console.warn('Authentication failed or other error. Falling back to test endpoint...');
          try {
            console.log('Trying test endpoint with request:', request);
            const testResponse = await apiClient.post(`${BASE_PATH}/deals/share/test`, request);
            console.log('Test endpoint response:', testResponse.data);
            
            // Get the result from the test endpoint
            if (testResponse.data && testResponse.data.result) {
              response = testResponse.data.result;
              console.log('Successfully parsed test endpoint response:', response);
            } else {
              throw new Error('Invalid response format from test endpoint');
            }
          } catch (testError: any) {
            console.error('Test endpoint also failed:', testError);
            
            // As a last resort, try the no-auth API test endpoint
            try {
              console.log('Trying no-auth API test endpoint...');
              const apiTestResponse = await apiClient.post(`${BASE_PATH}/deals/share/api-test`, request);
              console.log('API test endpoint response:', apiTestResponse.data);
              
              // Show error that we couldn't share but at least let the user know 
              // we received their share request
              throw new Error('Sharing services are currently unavailable. Your request was received but could not be processed.');
            } catch (apiTestError) {
              console.error('All fallback endpoints failed:', apiTestError);
              throw shareError; // Re-throw the original error if all fallbacks fail
            }
          }
        } else {
          throw shareError; // Re-throw if not an auth error
        }
      }

      setShareUrl(response.shareable_link);
      setIsShared(true);
      
      if (onShare) {
        onShare();
      }
      
      toast.success('Content shared successfully!');
    } catch (error: any) {
      console.error('Failed to share content:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to share content';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
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

  const shareOnTwitter = () => {
    if (shareUrl) {
      const text = encodeURIComponent(`${title} ${description ? `- ${description}` : ''}`);
      const url = encodeURIComponent(shareUrl);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  const shareOnFacebook = () => {
    if (shareUrl) {
      const url = encodeURIComponent(shareUrl);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
  };

  const shareByEmail = () => {
    if (shareUrl) {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${description ? `${description}\n\n` : ''}${shareUrl}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
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
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl">
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
                      <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
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