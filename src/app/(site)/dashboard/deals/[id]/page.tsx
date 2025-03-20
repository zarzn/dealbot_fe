"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DealDetail } from '@/components/Deals/DealDetail';
import { Loader } from '@/components/ui/loader';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { dealsService } from '@/services/deals';
import { toast } from 'sonner';
import { DealResponse } from '@/types/deals';

export default function DealDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deal, setDeal] = useState<DealResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchDeal = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedDeal = await dealsService.getDealDetails(id);
        setDeal(fetchedDeal);
      } catch (err) {
        console.error('Error fetching deal:', err);
        setError('Failed to load deal information. The deal might not exist or there was a server error.');
        toast.error('Failed to load deal details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeal();
  }, [id]);

  const handleBack = () => {
    router.push('/dashboard/deals');
  };

  const handleDelete = () => {
    // After successful deletion, navigate back to deals list
    router.push('/dashboard/deals');
  };

  const handleRefresh = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const refreshedDeal = await dealsService.refreshDeal(id);
      setDeal(refreshedDeal);
      toast.success('Deal refreshed successfully');
    } catch (err) {
      console.error('Error refreshing deal:', err);
      setError('Failed to refresh deal information');
      toast.error('Failed to refresh deal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/deals"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Deal Details" 
          description="View and manage deal information"
        />
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/[0.05] rounded-lg">
          <Loader2 className="w-10 h-10 text-white/50 animate-spin mb-4" />
          <p className="text-white/70">Loading deal information...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/[0.05] rounded-lg p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Cannot Load Deal</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <div className="flex gap-3">
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Back to Deals
            </Button>
          </div>
        </div>
      ) : (
        <DealDetail 
          dealId={id}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      )}
    </div>
  );
} 