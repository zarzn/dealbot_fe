"use client";

import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="bottom-right" />
    </SessionProvider>
  );
}

// Default export for dynamic import
export default Providers; 