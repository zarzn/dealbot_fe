"use client";

// Import useState and useEffect from React
import { useState, useEffect } from 'react';

/**
 * A safe session hook that works with static exports
 * This doesn't use next-auth's useSession directly to avoid SSG errors
 */
export function useSafeSession() {
  // This helps us track if we're on client side
  const [isClient, setIsClient] = useState(false);
  
  // Session state (matches next-auth's shape)
  const [session, setSession] = useState({
    data: null,
    status: 'loading',
    update: async () => null
  });
  
  // Mark when we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check authentication state from localStorage on client side only
  useEffect(() => {
    if (!isClient) return;
    
    // Check tokens first
    const checkTokenAuth = () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (accessToken) {
        // We have tokens, consider authenticated
        setSession({
          data: { 
            accessToken,
            user: JSON.parse(localStorage.getItem('user_data') || '{}')
          },
          status: 'authenticated',
          update: async () => null
        });
      } else {
        // No tokens, consider unauthenticated
        setSession({
          data: null,
          status: 'unauthenticated',
          update: async () => null
        });
      }
    };
    
    // Run the initial check
    checkTokenAuth();
    
    // Set up interval to keep checking (useful for token expiry)
    const interval = setInterval(checkTokenAuth, 2000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [isClient]);
  
  return session;
}

export default useSafeSession; 