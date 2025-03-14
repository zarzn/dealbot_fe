"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader } from '@/components/ui/loader';

// Import DealSection dynamically to prevent SSR hydration issues
const DealSection = dynamic(() => import('@/components/Deals/DealSection'), {
  ssr: false, // Completely disable server-side rendering to prevent router issues
  loading: () => <DealSectionLoading />
});

function DealSectionLoading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Deal list loading placeholder */}
      <div className="space-y-6">
        {/* Header placeholder */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-white/[0.05] rounded animate-pulse"></div>
          <div className="h-9 w-28 bg-white/[0.05] rounded animate-pulse"></div>
        </div>
        
        {/* Filters placeholder */}
        <div className="h-12 bg-white/[0.05] rounded animate-pulse"></div>
        
        {/* Deal cards placeholders */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/[0.05] rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClientDealSection() {
  return (
    <Suspense fallback={<DealSectionLoading />}>
      <DealSection />
    </Suspense>
  );
} 