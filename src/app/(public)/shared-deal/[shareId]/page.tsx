"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ChevronLeft, ExternalLink, Share2, Clock, Facebook, Twitter, Linkedin, Mail, Copy, Check as CheckIcon, TagIcon, Eye, Calendar, ShoppingBag, User, Check, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate, getRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

// Types
interface SharedContent {
  share_id: string;
  title: string;
  description?: string;
  content_type: string;
  content: {
    deal: {
      id: string;
      title: string;
      description: string;
      url: string;
      price: string;
      original_price?: string;
      currency: string;
      image_url?: string;
      source: string;
      availability?: {
        in_stock: boolean;
        quantity?: number;
      };
      latest_score?: number;
      expires_at?: string;
      created_at: string;
      deal_metadata?: any;
      price_metadata?: {
        price_history?: {
          price: string;
          timestamp: string;
          source: string;
        }[];
      };
      seller_info?: {
        name?: string;
        rating?: number;
      };
    };
    personal_notes?: string;
  };
  created_by: string;
  created_at: string;
  expires_at?: string;
  view_count: number;
}

export default function SharedDealPage() {
  const { shareId } = useParams();
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/shared-public/${shareId}`);
        setSharedContent(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching shared content:', err);
        setError(
          err.response?.data?.detail || 
          'This shared deal could not be loaded. It may have expired or been removed.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedContent();
    }
  }, [shareId]);

  useEffect(() => {
    if (!sharedContent?.content?.deal?.expires_at) return;
    
    const expiryDate = new Date(sharedContent.content.deal.expires_at);
    
    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown('Expired');
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setCountdown(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m remaining`);
      } else {
        setCountdown(`${minutes}m remaining`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [sharedContent?.content?.deal?.expires_at]);

  const deal = sharedContent?.content?.deal;
  const discountPercentage = deal?.original_price 
    ? Math.round(((parseFloat(deal.original_price) - parseFloat(deal.price)) / parseFloat(deal.original_price)) * 100) 
    : null;

  const getPriceChangeColor = () => {
    if (!discountPercentage) return 'text-gray-500';
    return discountPercentage > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col dashboard-content">
        <Header showLoginButton />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size={48} />
            <span className="ml-3 text-xl text-white">Loading shared deal...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col dashboard-content">
        <Header showLoginButton />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <Alert variant="destructive" className="max-w-3xl mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" className="bg-white/[0.05] border-white/10 hover:bg-white/[0.1]">
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" /> Return to Home
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sharedContent || !deal) {
    return (
      <div className="min-h-screen bg-black flex flex-col dashboard-content">
        <Header showLoginButton />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <Alert variant="destructive" className="max-w-3xl mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>The shared deal you&apos;re looking for doesn&apos;t exist or has expired.</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" className="bg-white/[0.05] border-white/10 hover:bg-white/[0.1]">
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" /> Return to Home
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col dashboard-content">
      <Header showLoginButton />
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="mb-6 flex items-center">
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="mr-4 text-white hover:bg-white/[0.05]"
          >
            <Link href="/">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{sharedContent.title}</h1>
            {sharedContent.description && (
              <p className="text-white/70 mt-1">{sharedContent.description}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main deal card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{deal.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center gap-1 border-white/10">
                        <TagIcon className="w-3 h-3" />
                        {deal.source}
                      </Badge>
                      
                      {deal.availability?.in_stock ? (
                        <Badge 
                          className="preserve-color bg-green-500/20 text-green-400 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          In Stock
                        </Badge>
                      ) : (
                        <Badge 
                          className="preserve-color bg-red-500/20 text-red-400 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Out of Stock
                        </Badge>
                      )}
                      
                      {countdown && (
                        <span className="text-sm text-white/60 flex items-center">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {countdown}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-start">
                    {deal.latest_score !== undefined && (
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full ${getScoreColor(deal.latest_score)} text-white h-12 w-12 flex items-center justify-center font-bold`}>
                          {Math.round(deal.latest_score)}
                        </div>
                        <span className="text-xs text-white/60 mt-1">Deal Score</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <div className="h-px bg-white/10 mx-6"></div>
              
              <CardContent className="pt-6">
                {/* Prominent Image Display - Full width */}
                <div 
                  className="relative w-full rounded-lg overflow-hidden bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition-all hover:from-white/[0.08] hover:to-white/[0.04] duration-300 mb-6 border border-white/10 shadow-xl"
                >
                  <div className="relative w-full" style={{ height: '300px' }}>
                    {deal.image_url ? (
                      <Image 
                        src={deal.image_url} 
                        alt={deal.title}
                        fill
                        className="object-contain hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="h-32 w-32 text-white/30" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Deal Info Sections */}
                <div className="space-y-6">
                  {/* Price Info */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(parseFloat(deal.price), deal.currency)}
                    </span>
                    {deal.original_price && (
                      <>
                        <span className="ml-2 text-lg line-through text-white/50">
                          {formatCurrency(parseFloat(deal.original_price), deal.currency)}
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
                  <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80">{deal.description}</p>
                    </CardContent>
                  </Card>
                  
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
                  <div className="mt-6">
                    <Button asChild size="lg" className="w-full md:w-auto bg-purple hover:bg-purple/80">
                      <a href={deal.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        View Deal <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 border-t border-white/10">
                <div className="w-full flex justify-between items-center">
                  <div className="text-sm text-white/60">
                    {sharedContent.view_count} views • Shared {getRelativeTime(sharedContent.created_at)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 bg-white/[0.05] border-white/10 hover:bg-white/[0.1]" 
                            onClick={copyShareLink}
                          >
                            {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? 'Copied!' : 'Copy link'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-400 bg-white/[0.05] border-white/10 hover:bg-white/[0.1]" 
                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                          >
                            <Facebook className="h-4 w-4" />
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
                            size="icon" 
                            className="h-8 w-8 text-blue-400 bg-white/[0.05] border-white/10 hover:bg-white/[0.1]" 
                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this deal: ${deal.title}`)}`, '_blank')}
                          >
                            <Twitter className="h-4 w-4" />
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
                            size="icon" 
                            className="h-8 w-8 text-blue-600 bg-white/[0.05] border-white/10 hover:bg-white/[0.1]" 
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share on LinkedIn</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-white/70 bg-white/[0.05] border-white/10 hover:bg-white/[0.1]" 
                            onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Check out this deal: ${deal.title}`)}&body=${encodeURIComponent(`I found this great deal that I thought you might like: ${window.location.href}`)}`, '_blank')}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share via Email</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Call to action and notes */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle>Want to find your best deals?</CardTitle>
                <CardDescription className="text-white/70">Create an account to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5 bg-green-900/50 rounded-full p-1">
                      <CheckIcon className="h-3 w-3 text-green-300" />
                    </div>
                    <p className="text-sm text-white/80">AI-powered deal search and analysis</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5 bg-green-900/50 rounded-full p-1">
                      <CheckIcon className="h-3 w-3 text-green-300" />
                    </div>
                    <p className="text-sm text-white/80">Track prices and get notified of drops</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5 bg-green-900/50 rounded-full p-1">
                      <CheckIcon className="h-3 w-3 text-green-300" />
                    </div>
                    <p className="text-sm text-white/80">Share deals with friends and family</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5 bg-green-900/50 rounded-full p-1">
                      <CheckIcon className="h-3 w-3 text-green-300" />
                    </div>
                    <p className="text-sm text-white/80">Compare deals and see what&apos;s best for you</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-purple hover:bg-purple/80" size="lg">
                  <Link href="/auth/register">
                    Register Now
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Personal Notes Card (if available) */}
            {sharedContent.content.personal_notes && (
              <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle>Personal Notes</CardTitle>
                  <CardDescription className="text-white/70">Notes shared by {sharedContent.created_by}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/[0.02] p-3 rounded-md border border-white/5">
                    <p className="text-white/80">{sharedContent.content.personal_notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Share info */}
            <Card className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle>Share Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70 flex items-center">
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Views
                    </span>
                    <span className="text-sm font-medium text-white">{sharedContent.view_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      Created
                    </span>
                    <span className="text-sm font-medium text-white">{formatDate(sharedContent.created_at)}</span>
                  </div>
                  {sharedContent.expires_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Expires
                      </span>
                      <span className="text-sm font-medium text-white">{formatDate(sharedContent.expires_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Related deals section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-white">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards for related deals */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10 overflow-hidden">
                <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border-b border-white/10">
                  <div className="flex items-center justify-center h-[150px]">
                    <Skeleton className="h-[120px] w-[80%] bg-white/[0.05]" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4 mb-2 bg-white/[0.05]" />
                  <Skeleton className="h-4 w-1/2 bg-white/[0.05]" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-6 w-1/3 bg-white/[0.05]" />
                    <Skeleton className="h-6 w-1/4 bg-white/[0.05]" />
                  </div>
                  <Skeleton className="h-10 w-full bg-white/[0.05]" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild className="bg-purple hover:bg-purple/80">
              <Link href="/auth/register">
                Register to discover more deals
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 