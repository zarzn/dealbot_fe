"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function SharedDealClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    
    console.log('SharedDealClientWrapper: Current pathname:', pathname);
    
    // Check if we're on a shared deal page
    if (pathname.startsWith('/shared-deal')) {
      // First try to get ID from query parameters
      const idFromQuery = searchParams.get('id');
      
      // Improved path-based ID extraction
      let idFromPath = null;
      // Match patterns like /shared-deal/ABC123 or /shared-deal/ABC123/anything
      const pathPattern = /^\/shared-deal\/([A-Z0-9]+)(\/.*)?$/;
      const pathMatch = pathname.match(pathPattern);
      
      if (pathMatch && pathMatch[1]) {
        idFromPath = pathMatch[1];
        console.log('SharedDealClientWrapper: Successfully extracted ID from path:', idFromPath);
      }
      
      // Direct extraction method as fallback
      if (!idFromPath && pathname.startsWith('/shared-deal/')) {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
          idFromPath = segments[1];
          console.log('SharedDealClientWrapper: Extracted ID from path segments:', idFromPath);
        }
      }
      
      // Also check if we received the ID through an HTTP header (set by CloudFront)
      const idFromHeader = document.head.querySelector('meta[name="x-shared-deal-id"]')?.getAttribute('content');
      
      // Also check localStorage (might have been set in a previous visit)
      const idFromStorage = window.localStorage.getItem('agentic_deals_viewing_shared_deal');
      
      // Use the first available ID
      const id = idFromQuery || idFromPath || idFromHeader || idFromStorage;
      
      console.log('SharedDealClientWrapper: ID sources:', {
        fromQuery: idFromQuery,
        fromPath: idFromPath,
        fromHeader: idFromHeader,
        fromStorage: idFromStorage,
        selectedId: id
      });
      
      if (id) {
        // Store the ID in localStorage for component access and future visits
        window.localStorage.setItem('agentic_deals_viewing_shared_deal', id);
        
        // Update page title to include the ID for better user experience
        document.title = `Shared Deal ${id} | RebatOn`;
        
        // Determine the correct URL format to avoid duplication
        // If we have an ID in the path, we don't need it in the query
        if (idFromPath) {
          // We already have the ID in the path, so we don't need to add it to the query
          // But if there's a query ID and it's different, we should clean up
          if (idFromQuery && idFromQuery !== idFromPath) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('id');
            console.log('SharedDealClientWrapper: Cleaning up URL to remove duplicate ID param:', currentUrl.toString());
            try {
              window.history.replaceState({}, '', currentUrl.toString());
            } catch (err) {
              console.error('SharedDealClientWrapper: Error updating URL:', err);
            }
          }
        } 
        // If the ID is not in the path and not in the query, add it to the query
        else if (!idFromQuery) {
          try {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('id', id);
            
            // Only update if the URL would actually change
            if (currentUrl.toString() !== window.location.href) {
              console.log('SharedDealClientWrapper: Updating URL to include ID in query:', currentUrl.toString());
              window.history.replaceState({}, '', currentUrl.toString());
            }
          } catch (err) {
            console.error('SharedDealClientWrapper: Error updating URL with query param:', err);
            // Fall back to a simpler approach if URL manipulation fails
            if (pathname === '/shared-deal') {
              try {
                window.history.replaceState({}, '', `/shared-deal?id=${id}`);
              } catch (innerErr) {
                console.error('SharedDealClientWrapper: Error with fallback URL update:', innerErr);
              }
            }
          }
        }
        
        // Add a custom event that the page component can listen for
        try {
          const event = new CustomEvent('shared-deal-id-detected', { detail: { id } });
          window.dispatchEvent(event);
        } catch (err) {
          console.error('SharedDealClientWrapper: Error dispatching custom event:', err);
        }
      } else if (pathname === '/shared-deal' && !idFromQuery) {
        // If we're on the base shared-deal page with no ID, we need to show an error
        console.log('SharedDealClientWrapper: No ID found for shared deal');
        
        // You could either redirect to an error page or let the page component handle it
        window.localStorage.removeItem('agentic_deals_viewing_shared_deal');
      }
    }
  }, [pathname, searchParams, router]);

  // This effect runs once to check for headers passed from CloudFront
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Function to extract headers from meta tags (added by the server)
    const extractMetaHeaders = () => {
      // Headers may be set by CloudFront as meta tags
      const allMeta = document.querySelectorAll('meta');
      const headerMeta = Array.from(allMeta).filter(meta => 
        meta.name && meta.name.startsWith('x-')
      );
      
      if (headerMeta.length > 0) {
        console.log('SharedDealClientWrapper: Found header meta tags:', 
          headerMeta.map(m => `${m.name}=${m.content}`).join(', ')
        );
        
        // Extract shared deal ID if present
        const sharedDealIdMeta = headerMeta.find(m => m.name === 'x-shared-deal-id');
        if (sharedDealIdMeta && sharedDealIdMeta.content) {
          console.log('SharedDealClientWrapper: Found shared deal ID in headers:', sharedDealIdMeta.content);
          
          // Store the ID for component access
          window.localStorage.setItem('agentic_deals_viewing_shared_deal', sharedDealIdMeta.content);
          
          // If we're on the base path, update the URL
          if (pathname === '/shared-deal' && !searchParams.get('id')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('id', sharedDealIdMeta.content);
            
            console.log('SharedDealClientWrapper: Updating URL based on header to', newUrl.toString());
            
            // Update URL without causing a navigation
            window.history.replaceState({}, '', newUrl.toString());
            
            // Add a custom event that the page component can listen for
            const event = new CustomEvent('shared-deal-id-detected', { 
              detail: { id: sharedDealIdMeta.content } 
            });
            window.dispatchEvent(event);
          }
        }
      }
    };
    
    // Run once on mount
    extractMetaHeaders();
    
    // Also set up an event listener to handle ID detection across components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'agentic_deals_viewing_shared_deal' && e.newValue) {
        console.log('SharedDealClientWrapper: Detected shared deal ID change in storage:', e.newValue);
        
        // If we're on the base path, update the URL
        if (pathname === '/shared-deal' && !searchParams.get('id')) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('id', e.newValue);
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname, searchParams]);

  return <>{children}</>;
} 