import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Deal, DealResponse } from '@/types/deals';
import { DealsList } from './DealsList';
import { DealDetail } from './DealDetail';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useIsMobile';
import { dealsService } from '@/services/api/deals';
import { AlertCircle } from 'lucide-react';

function DealSection() {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

  // Set mounted state on component mount
  useEffect(() => {
    setIsMounted(true);
    
    // Get URL parameters on mount
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
    }
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Load deals on component mount, but only when client-side
  useEffect(() => {
    if (!isMounted) return;
    fetchDeals();
  }, [isMounted]);

  // Check if deal ID is in URL params
  useEffect(() => {
    if (!isMounted || !searchParams) return;
    
    const dealId = searchParams.get('dealId');
    if (dealId) {
      setSelectedDealId(dealId);
    }
  }, [searchParams, isMounted]);

  const fetchDeals = async () => {
    if (!isMounted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dealsService.getDeals();
      setDeals(response);
      if (response.length === 0) {
        // Set a specific error for empty results vs. actual errors
        setError('empty');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('error');
      toast.error('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDealSelect = useCallback((dealId: string) => {
    setSelectedDealId(dealId);
    
    // Only update URL if mounted and in client side
    if (isMounted && typeof window !== 'undefined') {
      // Use URL API for client-side routing
      const url = new URL(window.location.href);
      url.searchParams.set('dealId', dealId);
      window.history.pushState({}, '', url);
    }
  }, [isMounted]);

  const handleDealCreate = useCallback(() => {
    if (isMounted && typeof window !== 'undefined') {
      window.location.href = '/deals/create';
    }
  }, [isMounted]);

  const handleDealUpdate = useCallback(async (updatedDeal: Deal) => {
    if (!isMounted) return;
    
    setIsUpdating(true);
    
    try {
      if (!updatedDeal.id) {
        throw new Error('Deal ID is missing');
      }
      
      // Call API to update the deal
      const response = await dealsService.updateDeal(updatedDeal.id, updatedDeal);
      
      // Update local state
      setDeals(prevDeals => prevDeals.map(deal => deal.id === response.id ? response : deal));
      toast.success('Deal updated successfully');
    } catch (err) {
      console.error('Error updating deal:', err);
      toast.error('Failed to update deal');
    } finally {
      setIsUpdating(false);
    }
  }, [isMounted]);

  const handleDealDelete = useCallback(async (dealId: string) => {
    if (!isMounted || !dealId) return;
    
    if (!confirm('Are you sure you want to delete this deal?')) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Call API to delete the deal
      await dealsService.deleteDeal(dealId);
      
      // Update local state
      setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
      setSelectedDealId(null);
      
      // Remove dealId from URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('dealId');
        window.history.pushState({}, '', url);
      }
      
      toast.success('Deal deleted successfully');
    } catch (err) {
      console.error('Error deleting deal:', err);
      toast.error('Failed to delete deal');
    } finally {
      setIsUpdating(false);
    }
  }, [isMounted]);

  const handleDealRefresh = useCallback(async (dealId: string) => {
    if (!isMounted || !dealId) return;
    
    setIsUpdating(true);
    
    try {
      // Call API to refresh the deal
      const refreshedDeal = await dealsService.refreshDeal(dealId);
      
      // Update local state
      setDeals(prevDeals => prevDeals.map(deal => deal.id === refreshedDeal.id ? refreshedDeal : deal));
      toast.success('Deal refreshed successfully');
    } catch (err) {
      console.error('Error refreshing deal:', err);
      toast.error('Failed to refresh deal');
    } finally {
      setIsUpdating(false);
    }
  }, [isMounted]);

  const handleBackToList = useCallback(() => {
    setSelectedDealId(null);
    
    // Remove dealId from URL
    if (isMounted && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('dealId');
      window.history.pushState({}, '', url);
    }
  }, [isMounted]);

  // Return null during SSR to prevent errors
  if (!isMounted) {
    return null;
  }

  // On mobile, show either list or detail view based on selection
  if (isMobile && selectedDealId) {
    const selectedDeal = deals.find(deal => deal.id === selectedDealId);
    
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBackToList}
          className="mb-4"
        >
          &larr; Back to Deals
        </Button>
        
        {isLoading ? (
          <div className="rounded-lg border border-white/10 p-6 animate-pulse">
            <div className="h-8 bg-white/[0.05] rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-white/[0.05] rounded w-full mb-3"></div>
            <div className="h-4 bg-white/[0.05] rounded w-5/6 mb-3"></div>
            <div className="h-4 bg-white/[0.05] rounded w-4/6 mb-6"></div>
            <div className="h-10 bg-white/[0.05] rounded w-full mb-4"></div>
            <div className="h-32 bg-white/[0.05] rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-white/10 p-6 bg-white/[0.05]">
            <div className="flex flex-col items-center justify-center text-center p-4">
              <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Cannot Load Deal</h3>
              <p className="text-white/70 mb-4">The deal information could not be loaded.</p>
              <Button onClick={() => handleDealRefresh(selectedDealId)} className="mb-2">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleBackToList}>
                Back to Deals
              </Button>
            </div>
          </div>
        ) : selectedDeal ? (
          <DealDetail 
            dealId={selectedDealId} 
            onUpdate={handleDealUpdate}
            onDelete={() => handleDealDelete(selectedDealId)}
            onRefresh={() => handleDealRefresh(selectedDealId)}
            isLoading={isUpdating}
          />
        ) : (
          <div className="text-center p-4 rounded-lg border border-white/10 bg-white/[0.05]">
            <p>Deal not found</p>
            <Button onClick={handleBackToList} className="mt-4">
              Back to Deals
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Desktop view or mobile list view
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className={`${selectedDealId ? 'hidden' : ''}`}>
        <DealsList 
          initialDeals={deals}
          showCreateButton={true}
          initialFilters={{}}
          onDealSelect={handleDealSelect}
          onCreateDeal={handleDealCreate}
          selectedDealId={selectedDealId}
          isLoading={isLoading}
        />
      </div>
      
      {selectedDealId ? (
        <div>
          {isLoading ? (
            <div className="rounded-lg border border-white/10 p-6 animate-pulse">
              <div className="h-8 bg-white/[0.05] rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-white/[0.05] rounded w-full mb-3"></div>
              <div className="h-4 bg-white/[0.05] rounded w-5/6 mb-3"></div>
              <div className="h-4 bg-white/[0.05] rounded w-4/6 mb-6"></div>
              <div className="h-10 bg-white/[0.05] rounded w-full mb-4"></div>
              <div className="h-32 bg-white/[0.05] rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-white/10 p-6 bg-white/[0.05]">
              <div className="flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Cannot Load Deal</h3>
                <p className="text-white/70 mb-4">The deal information could not be loaded.</p>
                <Button onClick={() => handleDealRefresh(selectedDealId)} className="mb-2">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleBackToList}>
                  Back to All Deals
                </Button>
              </div>
            </div>
          ) : (
            <DealDetail 
              dealId={selectedDealId}
              onUpdate={handleDealUpdate}
              onDelete={() => handleDealDelete(selectedDealId)}
              onRefresh={() => handleDealRefresh(selectedDealId)}
              onBack={handleBackToList}
              isLoading={isUpdating}
            />
          )}
        </div>
      ) : deals.length === 0 && !isLoading && error ? (
        <div className="flex items-center justify-center h-full bg-white/[0.05] rounded-lg border border-dashed border-white/10 p-8">
          <div className="text-center max-w-md">
            {error === 'empty' ? (
              <>
                <h3 className="text-lg font-medium text-white mb-2">No Deals Available</h3>
                <p className="text-white/70 mb-6">
                  There are no deals in the system yet. Get started by creating your first deal.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">System Error</h3>
                <p className="text-white/70 mb-6">
                  We couldn&apos;t load any deals due to a system error. Please try again.
                </p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={fetchDeals} variant="outline" className="flex-1">
                Refresh
              </Button>
              <Button onClick={handleDealCreate} className="flex-1">
                Create New Deal
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full bg-white/[0.05] rounded-lg border border-dashed border-white/10 p-8">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-medium text-white mb-2">No Deal Selected</h3>
            <p className="text-white/70 mb-6">
              Select a deal from the list to view its details, or create a new deal to get started.
            </p>
            <Button onClick={handleDealCreate}>Create New Deal</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealSection; 