"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ExternalLink, Share2, Clock, Facebook, Twitter, Linkedin, Mail, Copy, Check as CheckIcon, TagIcon, Eye, Calendar, ShoppingBag, User, Check, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate, getRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Header from '@/components/layout/Header';
import Footer from '@/components/Footer';
import { extractIdFromPath } from '@/lib/routing';
import SharedDealClientWrapper from './client-wrapper';

export default function SharedDealPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [dealId, setDealId] = useState<string | null>(null);
  const [sharedContent, setSharedContent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiTried, setApiTried] = useState<boolean>(false);

  // Extract ID from URL or localStorage on mount
  useEffect(() => {
    const extractId = () => {
      console.log('SharedDealPage: Extracting ID from available sources');
      
      // Check for global variable set by our early detection script
      // @ts-ignore - Custom property added by script
      const earlyDetectedId = typeof window !== 'undefined' && window.__SHARED_DEAL_ID;
      if (earlyDetectedId) {
        console.log('SharedDealPage: Found early detected ID:', earlyDetectedId);
        setDealId(earlyDetectedId);
        return;
      }
      
      // Check URL query parameters
      const idFromQuery = searchParams.get('id');
      if (idFromQuery) {
        console.log('SharedDealPage: Found ID in URL query params:', idFromQuery);
        setDealId(idFromQuery);
        
        // Also store it for future reference
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('agentic_deals_viewing_shared_deal', idFromQuery);
        }
        return;
      }
      
      // Check URL path (for /shared-deal/XYZ format)
      if (pathname.startsWith('/shared-deal/')) {
        const idFromPath = pathname.split('/')[2];
        if (idFromPath) {
          console.log('SharedDealPage: Found ID in URL path:', idFromPath);
          setDealId(idFromPath);
          
          // Also store it for future reference
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('agentic_deals_viewing_shared_deal', idFromPath);
          }
          return;
        }
      }
      
      // Check meta tags (for CloudFront headers)
      if (typeof document !== 'undefined') {
        const metaTag = document.head.querySelector('meta[name="x-shared-deal-id"]');
        if (metaTag && metaTag.getAttribute('content')) {
          const idFromMeta = metaTag.getAttribute('content');
          console.log('SharedDealPage: Found ID in meta tag:', idFromMeta);
          setDealId(idFromMeta);
          
          // Also store it for future reference
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('agentic_deals_viewing_shared_deal', idFromMeta);
          }
          return;
        }
      }
      
      // Check localStorage as last resort
      if (typeof window !== 'undefined') {
        const idFromStorage = window.localStorage.getItem('agentic_deals_viewing_shared_deal');
        if (idFromStorage) {
          console.log('SharedDealPage: Found ID in localStorage:', idFromStorage);
          setDealId(idFromStorage);
          
          // Update URL for better sharing
          if (!searchParams.has('id') && pathname === '/shared-deal') {
            console.log('SharedDealPage: Updating URL to include ID for better sharing');
            router.replace(`/shared-deal?id=${idFromStorage}`, { scroll: false });
          }
          return;
        }
      }
      
      // No ID found - show error
        console.error('SharedDealPage: No ID found from any source');
        setDealId(null);
      setError("No share ID provided. Please check the URL and try again.");
        setLoading(false);
    };
    
    // Run extraction immediately
    extractId();
    
    // Also listen for the custom event from the client wrapper
    const handleIdDetected = (event: CustomEvent) => {
      console.log('SharedDealPage: Received custom event with ID:', event.detail.id);
      setDealId(event.detail.id);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('shared-deal-id-detected', handleIdDetected as EventListener);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('shared-deal-id-detected', handleIdDetected as EventListener);
      }
    };
  }, [searchParams, pathname, router]);
  
  // Fetch content when ID changes
  useEffect(() => {
    if (!dealId || apiTried) {
      return; // Wait until we have an ID or avoid duplicate API calls
    }

    const fetchSharedContent = async () => {
      try {
        console.log('SharedDealPage: Fetching content for ID:', dealId);
        setLoading(true);
        setError(null);
        setApiTried(true); // Mark that we've tried the API
        
        // Try multiple API endpoints to handle potential deployment differences
        const endpoints = [
          `/api/v1/shared-public/${dealId}`,    // New endpoint format
          `/api/v1/shared/${dealId}`,           // Legacy endpoint format
        ];
        
        // Add timestamp to prevent caching issues
        const timestamp = new Date().getTime();
        const queryParams = `?_=${timestamp}`;
        
        let response = null;
        let succeeded = false;
        let lastError = null;
        
        // Try each endpoint until one works
        for (const baseEndpoint of endpoints) {
          const apiUrl = baseEndpoint + queryParams;
          
          try {
            console.log('SharedDealPage: Trying API endpoint:', apiUrl);
            
            // Use axios with timeout and proper error handling
            response = await axios.get(apiUrl, {
              timeout: 15000, // 15 second timeout
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            if (response.status === 200 && response.data) {
              console.log('SharedDealPage: Successful response from:', apiUrl);
              succeeded = true;
              break; // Exit the loop, we got a successful response
            }
          } catch (err) {
            lastError = err;
            console.warn(`SharedDealPage: Failed to fetch from ${apiUrl}:`, err);
            // Continue to try the next endpoint
          }
        }
        
        if (!succeeded || !response) {
          throw lastError || new Error('All API endpoints failed');
        }
        
        console.log('SharedDealPage: API response structure:', response.data);
        
        // Process and save the response data
        if (response.data) {
          // Ensure the response has the expected structure, add fallbacks
          if (!response.data.content_type && response.data.content) {
            // Try to infer content type from content structure
            if (response.data.content.deal || 
                (response.data.content.price && response.data.content.title)) {
              console.log('SharedDealPage: Inferring content_type as "deal" from structure');
              response.data.content_type = 'deal';
            }
          }
          
        setSharedContent(response.data);
        setLoading(false);
        
        // Update page title with actual content title
        if (response.data?.title && typeof window !== 'undefined') {
          document.title = `${response.data.title} | RebatOn`;
        }
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err: any) {
        console.error("Error fetching shared content:", err);
        
        let errorMessage = "Failed to load shared content. Please try again later.";
        
        // Extract more specific error message if available
        if (err.response) {
          errorMessage = err.response.data?.detail || 
                        err.response.data?.message || 
                        `Server error: ${err.response.status}`;
                        
          // Log the full error response for debugging
          console.error("Error response data:", err.response.data);
        } else if (err.request) {
          errorMessage = "Unable to reach the server. Please check your connection.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, [dealId, apiTried]);

  // Make sure we render the shared deal view even if the URL is just /shared-deal?id=XYZ
  useEffect(() => {
    // Force this component to render the shared deal view
    if (pathname === '/shared-deal' && searchParams.has('id') && !loading && !error && !sharedContent) {
      console.log('SharedDealPage: Forcing re-fetch of shared deal content');
      setApiTried(false); // Reset API tried flag to force a re-fetch
    }
  }, [pathname, searchParams, loading, error, sharedContent]);

  const copyShareLink = () => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle rendering based on content type
  const renderContent = () => {
    if (!sharedContent) return null;

    try {
      // Debug the content structure to help identify issues
      console.log('SharedDealPage: Content structure:', {
        content_type: sharedContent.content_type,
        has_content: !!sharedContent.content,
        content_keys: sharedContent.content ? Object.keys(sharedContent.content) : [],
        raw_content: sharedContent.content,
      });
      
      // Case-insensitive content type check and handle multiple possible API response formats
      const contentType = (sharedContent.content_type || '').toLowerCase();
      
      // Process deal content type (check variations of the structure)
      if (contentType === 'deal' || contentType.includes('deal') || 
          (sharedContent.content && sharedContent.content.deal)) {
        
        // Try multiple possible locations for the deal data
        let deal = null;
        
        // Option 1: Direct access to content
        if (sharedContent.content && typeof sharedContent.content === 'object') {
          if (sharedContent.content.deal) {
            // Structure: content.deal
            deal = sharedContent.content.deal;
          } else if (sharedContent.content.price || sharedContent.content.title) {
            // Structure: content is the deal itself
            deal = sharedContent.content;
          }
        }
        
        // Option 2: Content is directly in the shared content
        if (!deal && (sharedContent.price || sharedContent.title || sharedContent.url)) {
          deal = sharedContent;
        }
        
        // Option 3: Deal is in a different place in the response
        if (!deal && sharedContent.deal) {
          deal = sharedContent.deal;
        }
        
        console.log('SharedDealPage: Deal data extraction result:', !!deal);
        
        if (!deal) {
          return (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Content Structure Error</AlertTitle>
              <AlertDescription>
                We found a shared deal, but the content structure is not as expected.
                Please report this issue to support with ID: {dealId}
              </AlertDescription>
            </Alert>
          );
        }
      
      // Calculate discount percentage if applicable
      let discountPercentage = null;
      if (deal.original_price && deal.price) {
        const original = parseFloat(deal.original_price);
        const current = parseFloat(deal.price);
        if (original > current) {
          discountPercentage = Math.round(((original - current) / original) * 100);
        }
      }

      return (
        <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
          <CardContent className="p-0">
            {/* Deal Image */}
            {deal.image_url && (
              <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-t-lg">
                <Image 
                  src={deal.image_url} 
                  alt={deal.title} 
                  fill 
                  className="object-cover" 
                  priority
                />
                
                {/* Deal tags as badges */}
                {deal.tags && deal.tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {deal.tags.map((tag, index) => (
                      <Badge key={index} className="bg-purple text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{deal.title}</h2>
              
              <div className="space-y-6">
                {/* Price Info */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                      {formatCurrency(parseFloat(deal.price), deal.currency || 'USD')}
                  </span>
                  {deal.original_price && (
                    <>
                      <span className="ml-2 text-lg line-through text-white/50">
                          {formatCurrency(parseFloat(deal.original_price), deal.currency || 'USD')}
                      </span>
                      {discountPercentage && (
                        <Badge className="bg-green-500/20 text-green-400 preserve-color">
                          {discountPercentage}% OFF
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                
                {/* Description Card */}
                  {deal.description && (
                <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80">{deal.description}</p>
                  </CardContent>
                </Card>
                  )}
                
                {/* Seller Info Card (if available) */}
                {deal.seller_info && (
                  <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Seller Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-white/80">
                            {deal.seller_info.name || 'Unknown seller'}
                          </span>
                          {deal.seller_info.rating && (
                            <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 preserve-color">
                              Rating: {deal.seller_info.rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* View Deal Button */}
                  {deal.url && (
                <div className="mt-6">
                  <Button asChild size="lg" className="w-full md:w-auto bg-purple hover:bg-purple/80">
                    <a href={deal.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      View Deal <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
      } else if (contentType === 'search_results' || contentType.includes('search')) {
        // Handle search results type
    return (
      <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
        <CardHeader>
              <CardTitle>Shared Search Results</CardTitle>
              <CardDescription>
                These are search results that were shared with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
              {/* Render search results content here */}
              <p className="text-white/80">Search results feature coming soon.</p>
        </CardContent>
      </Card>
    );
      } else if (contentType === 'goal' || contentType.includes('goal')) {
        // Handle goal type
    return (
          <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle>Shared Goal</CardTitle>
              <CardDescription>
                A deal-finding goal has been shared with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Render goal content here */}
              <p className="text-white/80">Goal details feature coming soon.</p>
            </CardContent>
          </Card>
        );
      } else {
        // Unknown content type - add more debugging information
        console.error('SharedDealPage: Unrecognized content type. Full content:', sharedContent);
        
    return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Content Structure Issue</AlertTitle>
            <AlertDescription>
              <div>
                <p>We encountered an issue understanding this shared content.</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-purple">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto">
                    Content type: {sharedContent.content_type || 'not specified'}<br/>
                    Available fields: {Object.keys(sharedContent).join(', ')}
                  </pre>
                </details>
                <p className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    size="sm"
                  >
                    <Link href="/">Return Home</Link>
                  </Button>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        );
      }
    } catch (err) {
      console.error('Error rendering content:', err);
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
          <AlertTitle>Rendering Error</AlertTitle>
          <AlertDescription>
            <p>There was an error displaying this content.</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-white/70">Error Details</summary>
              <pre className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto">
                {err instanceof Error ? err.message : 'Unknown error'}
              </pre>
            </details>
          </AlertDescription>
          </Alert>
      );
    }
  };

  return (
    <SharedDealClientWrapper>
      <div className="min-h-screen bg-black flex flex-col dashboard-content">
        <Header showLoginButton />
        <div className="container mx-auto px-4 py-16 flex-grow">
          {/* Page Header with ID info */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="mr-4 text-white hover:bg-white/[0.05]"
            >
              <Link href="/">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to Home
              </Link>
            </Button>
              
              {dealId && !error && !loading && (
                <p className="text-sm text-white/50">Viewing Shared Deal: {dealId}</p>
              )}
            </div>
            
            {!loading && !error && dealId && (
                      <Button 
                        variant="outline" 
                size="sm"
                className="bg-white/[0.05] border-white/10 hover:bg-white/[0.1]"
                        onClick={copyShareLink}
              >
                {copied ? (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
                      </Button>
            )}
                    </div>
                    
          {/* Content Display */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <LoadingSpinner size={48} />
              <span className="ml-3 text-xl text-white">Loading shared deal...</span>
            </div>
          ) : error ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="p-8 rounded-lg bg-white/[0.05] border border-white/10 text-center">
                <h2 className="text-xl font-semibold mb-4">Unable to Display Content</h2>
                <p className="text-white/70 mb-6">
                  The shared content couldn&apos;t be loaded. It may have expired or been removed.
                </p>
                <Input
                  value={dealId || ''}
                  readOnly
                  className="max-w-sm mx-auto mb-4 bg-white/5 border border-white/10"
                  placeholder="Share ID"
                />
                <Button asChild variant="default">
                  <Link href="/">
                    Return to Home
                  </Link>
                            </Button>
                    </div>
                  </div>
          ) : sharedContent ? (
            <div className="mt-4">
              {/* Content Title */}
              {sharedContent.title && (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">{sharedContent.title}</h1>
                  {sharedContent.description && (
                    <p className="text-white/70 mt-1">{sharedContent.description}</p>
                  )}
                </div>
              )}
              
              {/* Personal Notes */}
              {sharedContent.content?.personal_notes && (
                <div className="mb-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
                  <h3 className="font-semibold text-white mb-2">Personal Notes</h3>
                  <p className="text-white/80 whitespace-pre-line">
                    {sharedContent.content.personal_notes}
                  </p>
                    </div>
              )}
              
              {/* Main Content */}
              {renderContent()}
              
              {/* Sharing Info */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-white/50">
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>{sharedContent.view_count || 0} {(sharedContent.view_count || 0) === 1 ? 'view' : 'views'}</span>
                    </div>
                
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Shared: {getRelativeTime(sharedContent.created_at)}</span>
                    </div>
                
                    {sharedContent.expires_at && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Expires: {formatDate(sharedContent.expires_at)}</span>
                      </div>
                    )}
                  </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
              <p className="text-white/70 mb-4">
                Unable to find the shared content. The ID may be invalid or the content has been removed.
              </p>
              {dealId && (
                <div className="mb-4">
                  <p className="text-sm text-white/50 mb-2">Share ID:</p>
                  <code className="px-2 py-1 bg-white/10 rounded">{dealId}</code>
                </div>
              )}
              <Button asChild>
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
          </div>
          )}
        </div>
        <Footer />
      </div>
    </SharedDealClientWrapper>
  );
}