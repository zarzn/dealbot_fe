"use client";

import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// Metadata needs to be in a separate file for app router
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} font-plus-jakarta`}>
        <QueryClientProvider client={queryClient}>
          <Providers>
            {children}
          </Providers>
        </QueryClientProvider>
      </body>
    </html>
  );
} 