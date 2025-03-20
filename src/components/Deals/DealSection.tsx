import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Deal, DealResponse } from '@/types/deals';
import { DealsList } from './DealsList';
import { DealDetail } from './DealDetail';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useIsMobile';
import { dealsService } from '@/services/deals';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function DealSection() {
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Set mounted state on component mount
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Check for dealId in URL on mount
  useEffect(() => {
    if (!isMounted) return;
    
    // Get dealId from query params
    const dealId = searchParams.get('dealId');
    if (dealId) {
      setSelectedDeal(dealId);
    }
  }, [isMounted, searchParams]);

  // Load deals on component mount, but only when client-side
  useEffect(() => {
    if (!isMounted) return;
    fetchDeals();
  }, [isMounted]);

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
    if (!isMounted) return;
    
    // Update URL with the selected deal ID without full navigation
    const newUrl = `/dashboard/deals?dealId=${dealId}`;
    window.history.pushState({}, '', newUrl);
    
    // Update state
    setSelectedDeal(dealId);
  }, [isMounted]);

  const handleDealCreate = useCallback(() => {
    if (isMounted) {
      router.push('/dashboard/goals/create');
    }
  }, [isMounted, router]);

  const handleBackToList = useCallback(() => {
    // Clear selected deal from URL and state
    window.history.pushState({}, '', '/dashboard/deals');
    setSelectedDeal(null);
  }, []);

  const handleDealDelete = useCallback(() => {
    // After successful deletion, return to list view
    handleBackToList();
    // Refresh deals list
    fetchDeals();
  }, [handleBackToList]);

  const handleDealUpdate = useCallback(async (updatedDeal: Deal) => {
    // Instead of manually updating the deals list with type mismatches,
    // just refresh the entire deals list
    await fetchDeals();
    toast.success('Deal updated successfully');
  }, [fetchDeals]);

  // Return null during SSR to prevent errors
  if (!isMounted) {
    return null;
  }

  // If a deal is selected, show the DealDetail component
  if (selectedDeal) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">Deal Details</h2>
        </div>
        
        <DealDetail 
          dealId={selectedDeal}
          onDelete={handleDealDelete}
          onUpdate={handleDealUpdate}
          onBack={handleBackToList}
          onRefresh={(updatedDeal) => handleDealUpdate(updatedDeal)}
        />
      </div>
    );
  }

  // Otherwise show the deals list
  return (
    <div className="grid grid-cols-1 gap-6">
      <DealsList 
        initialDeals={deals}
        showCreateButton={true}
        initialFilters={{}}
        onDealSelect={handleDealSelect}
        onCreateDeal={handleDealCreate}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DealSection; 