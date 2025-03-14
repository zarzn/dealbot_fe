"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';

// Import the RecentDeals component with no SSR to prevent hydration issues
const RecentDeals = dynamic(() => import('./RecentDeals'), { 
  ssr: false, // Disable server-side rendering
  loading: () => <RecentDealsLoading /> 
});

function RecentDealsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-white/[0.1] rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

export default function ClientRecentDeals() {
  return (
    <Suspense fallback={<RecentDealsLoading />}>
      <RecentDeals />
    </Suspense>
  );
} 