'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";
import { authService } from '@/services/auth';
import { clearAuthCookies } from '@/lib/authCookies';
import { API_CONFIG } from '@/services/api/config';

export default function SignOutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'complete' | 'error'>('pending');
  const [message, setMessage] = useState("Starting sign-out process...");

  useEffect(() => {
    // Perform complete sign-out across all systems
    const performSignOut = async () => {
      try {
        setMessage("Clearing client-side tokens...");
        
        // Immediately force the session state to appear logged out 
        // by dispatching a custom event that the Header can listen for
        window.dispatchEvent(new Event('force-logout'));
        
        // Clear any local tokens using auth service
        authService.clearTokens();
        
        // Also manually clear any tokens just to be sure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Clear auth cookies - this is crucial for middleware detection
        clearAuthCookies();
        
        // Clear any session storage items too
        sessionStorage.clear();
        
        setMessage("Calling server-side sign-out API...");
        // Use full API URL
        const signoutUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/auth/signout`;
        console.log('Making signout request to:', signoutUrl);
        
        await fetch(signoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        setMessage("Signing out from NextAuth...");
        // Sign out from NextAuth - wrap in try/catch as this might fail
        try {
          await signOut({ 
            redirect: false,
          });
        } catch (nextAuthError) {
          console.error('NextAuth signout error:', nextAuthError);
          // Continue anyway since we've already cleared tokens
        }
        
        // Double-check that cookies are cleared
        clearAuthCookies();
        
        setStatus('complete');
        setMessage("Sign-out complete, redirecting to home page...");
        
        // Give a small delay to ensure UI updates before redirect
        setTimeout(() => {
          // Use hard navigation to force a complete page refresh
          window.location.href = '/';
        }, 1000);
      } catch (error) {
        console.error('Signout error:', error);
        setStatus('error');
        setMessage("Error during sign-out. Please try again or contact support.");
        
        // Even on error, try to redirect user to home page
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-lg rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white">Signing out...</h1>
        <div className="flex justify-center">
          {status === 'pending' && (
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          )}
          {status === 'complete' && (
            <div className="rounded-full h-10 w-10 bg-green-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-full h-10 w-10 bg-red-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-center text-gray-300">
          {message}
        </p>
      </div>
    </div>
  );
} 