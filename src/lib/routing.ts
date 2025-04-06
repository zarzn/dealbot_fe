// Routing helper for static export
import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Mapping of routes that need special handling when accessed directly.
 * This helps when static HTML files are served instead of proper Next.js routes.
 */
export const ROUTE_MAPPINGS = {
  // Documentation pages
  '/how-to-use/getting-started': { type: 'docs', slug: 'getting-started' },
  '/how-to-use/searching-deals': { type: 'docs', slug: 'searching-deals' },
  '/how-to-use/deal-goals': { type: 'docs', slug: 'deal-goals' },
  '/how-to-use/tracking-deals': { type: 'docs', slug: 'tracking-deals' },
  '/how-to-use/understanding-deal-analysis': { type: 'docs', slug: 'understanding-deal-analysis' },
  '/how-to-use/sharing-deals': { type: 'docs', slug: 'sharing-deals' },
  '/how-to-use/token-system': { type: 'docs', slug: 'token-system' },
  '/how-to-use/troubleshooting': { type: 'docs', slug: 'troubleshooting' },
  '/how-to-use/faq': { type: 'docs', slug: 'faq' },
  
  // Shared content pages
  '/shared-deal': { type: 'shared-deal' },
};

/**
 * Hook to fix static export routing by handling URL parameters
 * and direct access to non-static routes.
 */
export function useStaticRoutingFix() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip if not in browser or no pathname
    if (typeof window === 'undefined' || !pathname) return;

    // If we're at root but should be at another path based on query params
    if (pathname === '/' && searchParams.has('__path')) {
      const redirectPath = searchParams.get('__path');
      if (redirectPath) {
        // Create a new URL without the __path parameter
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('__path');
        
        const paramString = newSearchParams.toString();
        const newPath = redirectPath + (paramString ? `?${paramString}` : '');
        
        // Redirect to the correct path
        router.replace(newPath);
        return;
      }
    }

    // Handle direct access to documentation pages
    const routeConfig = ROUTE_MAPPINGS[pathname];
    if (routeConfig) {
      console.log(`Detected direct access to special route: ${pathname}`);
      
      // Set a marker in localStorage to indicate we're handling this route
      window.localStorage.setItem('agentic_deals_handling_route', pathname);
      
      // If it's a docs page, make sure we're using the correct slug
      if (routeConfig.type === 'docs' && routeConfig.slug) {
        const docsPath = `/how-to-use/${routeConfig.slug}`;
        if (pathname !== docsPath) {
          router.replace(docsPath);
        }
      }
    }

    // Special handling for shared-deal with query parameters
    if (pathname === '/shared-deal' && searchParams.has('id')) {
      const id = searchParams.get('id');
      console.log(`Detected shared deal with ID: ${id}`);
      
      // Set a marker to trigger proper component loading
      window.localStorage.setItem('agentic_deals_viewing_shared_deal', id || '');
    }
  }, [pathname, router, searchParams]);

  return null;
}

/**
 * Helper to extract parameters from a URL
 */
export function getQueryParams() {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Parse path-based ID from URL if needed
 * This helps when a URL like /shared-deal/ABC123 gets rewritten 
 * but the client-side code needs to extract the ID
 */
export function extractIdFromPath(path: string | null) {
  if (!path) return null;
  
  // Special case for shared-deal
  if (path.startsWith('/shared-deal/')) {
    return path.split('/')[2];
  }
  
  // Try to extract UUID from path
  const uuidMatch = path.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (uuidMatch) {
    return uuidMatch[0];
  }
  
  return null;
} 