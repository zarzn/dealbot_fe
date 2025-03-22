'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';

export default function SharedContentRedirect() {
  const { shareId } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect from old path to new API path
    if (shareId) {
      console.log(`Redirecting from old shared path to new API path: /api/v1/shared-public/${shareId}`);
      // Use window.location for a complete page refresh to the new URL
      window.location.href = `/api/v1/shared-public/${shareId}`;
    }
  }, [shareId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to updated sharing URL...</p>
    </div>
  );
} 