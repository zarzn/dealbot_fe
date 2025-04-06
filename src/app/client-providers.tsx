"use client";

import { Providers } from '@/components/providers';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useStaticRoutingFix } from '@/lib/routing';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Apply the routing fix for static export
  useStaticRoutingFix();
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Providers>
        {children}
      </Providers>
    </QueryClientProvider>
  );
} 