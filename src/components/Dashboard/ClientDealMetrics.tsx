"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import DealMetrics dynamically to prevent SSR hydration issues
const DealMetrics = dynamic(() => import('@/components/Dashboard/DealMetrics'), {
  ssr: false,
  loading: () => <DealMetricsLoading />
});

function DealMetricsLoading() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Deal Metrics</h3>
      <div className="animate-pulse">
        <div className="h-40 bg-white/[0.1] rounded-lg mb-4"></div>
        <div className="h-20 bg-white/[0.1] rounded-lg"></div>
      </div>
    </div>
  );
}

export default function ClientDealMetrics() {
  return (
    <Suspense fallback={<DealMetricsLoading />}>
      <DealMetrics />
    </Suspense>
  );
} 