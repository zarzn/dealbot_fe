"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Notification } from '@/services/notifications';

// Import LiveNotifications with no SSR to prevent hydration issues
const LiveNotifications = dynamic(() => import('./LiveNotifications'), { 
  ssr: false, // Disable server-side rendering
  loading: () => null 
});

interface ClientLiveNotificationsProps {
  onNewNotification?: (notification: Notification) => void;
}

export default function ClientLiveNotifications({ onNewNotification }: ClientLiveNotificationsProps) {
  return (
    <Suspense fallback={null}>
      <LiveNotifications onNewNotification={onNewNotification} />
    </Suspense>
  );
} 