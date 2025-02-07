'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '@/providers/AppProvider';
import NextTopLoader from 'nextjs-toploader';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AppProvider>
        <NextTopLoader />
        <Toaster position="top-right" />
        {children}
      </AppProvider>
    </SessionProvider>
  );
}

// Default export for dynamic import
export default Providers; 