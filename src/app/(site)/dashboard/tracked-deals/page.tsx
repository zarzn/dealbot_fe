'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dealsService } from '@/services/deals';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Calendar, Tag, ArrowUpDown, AlertCircle, EyeOff, Bell, BellOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import EmptyState from '@/components/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';

export interface TrackingInfo {
  tracking_id: string;
  tracking_started: string;
  last_checked: string | null;
  last_price: number | null;
  is_favorite: boolean;
  notify_on_price_drop: boolean;
  notify_on_availability: boolean;
  price_threshold: number | null;
  tracking_status: string;
}

export interface TrackedDeal {
  id: string;
  title: string;
  description: string;
  url: string;
  price: string;
  original_price: string | null;
  currency: string;
  source: string;
  image_url: string | null;
  category: string;
  status: string;
  is_tracked: boolean;
  tracking_info: TrackingInfo;
  expires_at: string | null;
  found_at: string;
}

export default function TrackedDealsPage() {
  const [deals, setDeals] = useState<TrackedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTrackedDeals = async () => {
      if (isRequesting) return; // Prevent duplicate requests
      
      try {
        setIsRequesting(true);
        setLoading(true);
        console.log('Fetching tracked deals...');
        const response = await dealsService.getTrackedDeals();
        console.log('Tracked deals response:', response);
        setDeals(response);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tracked deals:', err);
        setError('Failed to load tracked deals. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load tracked deals',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setIsRequesting(false);
      }
    };

    fetchTrackedDeals();
  }, []);

  const handleUntrackDeal = async (dealId: string) => {
    try {
      await dealsService.untrackDeal(dealId);
      setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
      toast({
        title: 'Success',
        description: 'Deal untracked successfully',
      });
    } catch (err) {
      console.error('Error untracking deal:', err);
      toast({
        title: 'Error',
        description: 'Failed to untrack deal',
        variant: 'destructive',
      });
    }
  };

  const handleViewDeal = (dealId: string) => {
    router.push(`/dashboard/deals/${dealId}`);
  };

  const getDealStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
      active: { label: 'Active', variant: 'default' },
      expired: { label: 'Expired', variant: 'destructive' },
      sold_out: { label: 'Sold Out', variant: 'secondary' },
      paused: { label: 'Paused', variant: 'outline' },
    };

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tracked Deals" 
        description="Monitor the deals you're interested in"
        actions={
          <Button 
            onClick={() => router.push('/dashboard/deals')} 
            variant="outline"
          >
            Browse All Deals
          </Button>
        }
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-80">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold">Error Loading Deals</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          title="No Tracked Deals"
          description="You are not tracking any deals. Start tracking deals to get updates on price changes."
          icon={<EyeOff className="h-12 w-12" />}
          action={
            <Button onClick={() => router.push('/dashboard/deals')}>
              Browse Deals
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2 hover:text-primary cursor-pointer" onClick={() => handleViewDeal(deal.id)}>
                      {deal.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">
                      {deal.category}
                    </CardDescription>
                  </div>
                  {getDealStatusBadge(deal.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{formatCurrency(parseFloat(deal.price), deal.currency)}</span>
                      {deal.original_price && parseFloat(deal.original_price) > parseFloat(deal.price) && (
                        <span className="text-muted-foreground line-through ml-2">
                          {formatCurrency(parseFloat(deal.original_price), deal.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Tracking since: </span>
                      <span className="text-sm">{formatDate(deal.tracking_info.tracking_started)}</span>
                    </div>
                  </div>
                  
                  {deal.tracking_info.price_threshold && (
                    <div className="flex items-center space-x-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Price threshold: </span>
                        <span className="text-sm font-medium">{formatCurrency(deal.tracking_info.price_threshold, deal.currency)}</span>
                      </div>
                    </div>
                  )}
                  
                  {deal.tracking_info.last_checked && deal.tracking_info.last_price && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Last price: </span>
                        <span className="text-sm">{formatCurrency(deal.tracking_info.last_price, deal.currency)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {deal.tracking_info.notify_on_price_drop ? (
                      <Bell className="h-4 w-4 text-green-400" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <span className="text-sm">
                        {deal.tracking_info.notify_on_price_drop 
                          ? "Price drop notifications enabled" 
                          : "Price drop notifications disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDeal(deal.id)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUntrackDeal(deal.id)}
                >
                  Untrack
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 