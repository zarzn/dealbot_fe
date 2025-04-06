"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DealDetail } from '@/components/Deals/DealDetail';
import DealSection from '@/components/Deals/DealSection';
import { Loader } from '@/components/ui/loader';

export default function DealsPage() {
  const searchParams = useSearchParams();
  const dealId = searchParams.get('id');
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If not mounted yet (during SSR), return a minimal loader
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  
  // If dealId is provided in query parameters, show deal details
  if (dealId) {
    return (
      <div className="space-y-6">
        <DealDetail
          dealId={dealId}
          onBack={() => window.history.pushState({}, '', '/dashboard/deals')}
        />
      </div>
    );
  }
  
  // Otherwise show the deals list section
  return <DealSection />;
} 