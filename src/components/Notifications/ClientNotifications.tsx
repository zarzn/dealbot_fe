"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import NotificationCenter with no SSR to prevent hydration issues
const NotificationCenter = dynamic(() => import('./NotificationCenter'), { 
  ssr: false, // Disable server-side rendering
  loading: () => <NotificationLoading /> 
});

function NotificationLoading() {
  return (
    <div className="relative inline-block">
      {/* Bell icon placeholder */}
      <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse"></div>
      
      {/* Badge placeholder */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/20 animate-pulse"></div>
    </div>
  );
}

export default function ClientNotifications() {
  return (
    <Suspense fallback={<NotificationLoading />}>
      <NotificationCenter />
    </Suspense>
  );
} 