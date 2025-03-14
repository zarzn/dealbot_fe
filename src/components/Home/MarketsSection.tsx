"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the Markets component with no SSR to prevent hydration issues
const Markets = dynamic(() => import('@/components/Markets'), { 
  ssr: false, // Disable server-side rendering
  loading: () => <MarketsLoading /> 
});

function MarketsLoading() {
  return (
    <section className="relative z-10 overflow-hidden py-20 lg:py-25">
      <div className="container">
        <div className="wow fadeInUp mx-auto max-w-[1170px]">
          <div className="mb-10">
            <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
              Active Markets
            </h2>
            <div className="flex items-center justify-center py-20">
              <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-purple"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MarketsSection() {
  return (
    <Suspense fallback={<MarketsLoading />}>
      <Markets />
    </Suspense>
  );
} 