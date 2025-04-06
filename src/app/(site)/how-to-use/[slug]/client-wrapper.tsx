"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter, ReadonlyURLSearchParams } from 'next/navigation';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function DocsClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);

  // These docs slugs match the markdown files in /src/markdown/docs/
  const validSlugs = [
    'getting-started',
    'searching-deals',
    'deal-goals',
    'tracking-deals',
    'understanding-deal-analysis',
    'sharing-deals',
    'token-system',
    'troubleshooting',
    'faq'
  ];

  // Enable debug mode in development
  useEffect(() => {
    const isDev = process.env.NODE_ENV !== 'production';
    setIsDebugging(true); // Force debug logs even in production to diagnose issues
  }, []);

  // Main effect for detecting and handling doc slugs from URL, query params, and other sources
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Debug logs
    if (isDebugging) {
      console.log('------ HOW-TO-USE CLIENT WRAPPER DEBUGGING ------');
      console.log(`Current pathname: ${pathname}`);
      console.log(`Current URL: ${window.location.href}`);
      console.log(`Search params: ${Array.from(searchParams.entries()).map(([key, value]) => `${key}=${value}`).join(', ')}`);
      logAllMetaTags();
    }

    // CRITICAL: Check for the new doc_slug query parameter which is set by the CloudFront function
    // This is our most reliable source of the slug
    const docSlugParam = searchParams.get('doc_slug');
    
    if (docSlugParam) {
      if (isDebugging) console.log(`📌 Found doc_slug query parameter: ${docSlugParam}`);
      
      // Validate the slug
      if (validSlugs.includes(docSlugParam)) {
        if (isDebugging) console.log(`✅ Valid doc_slug from query parameter: ${docSlugParam}`);
        
        // Store it for future reference
        localStorage.setItem('lastDocSlug', docSlugParam);
        
        // Update the document title
        updateDocumentTitle(docSlugParam);
        
        // If the URL doesn't reflect the correct path, update it (maintaining the query parameter)
        updateUrlPath(docSlugParam);
        
        return; // We've handled the doc_slug, no need to continue
      } else {
        if (isDebugging) console.warn(`❌ Invalid doc_slug from query parameter: ${docSlugParam}`);
      }
    } else if (searchParams.get('doc_home') === 'true') {
      // We're on the home page
      if (isDebugging) console.log('📘 On documentation home page');
      
      // If the URL doesn't match, redirect
      if (pathname !== '/how-to-use') {
        if (isDebugging) console.log('🔄 Redirecting to /how-to-use');
        router.push('/how-to-use');
      }
      
      return; // We've handled the home page
    }
    
    // If we get here, we need to check other sources for the slug
    const slug = getDocSlug(pathname, searchParams, localStorage);
    
    if (slug) {
      if (validSlugs.includes(slug)) {
        if (isDebugging) console.log(`✅ Valid slug detected from alternative source: ${slug}`);
        
        // Store it for future reference
        localStorage.setItem('lastDocSlug', slug);
        
        // Update the document title
        updateDocumentTitle(slug);
        
        // If the URL doesn't reflect the correct path, update it
        updateUrlPath(slug);
      } else {
        if (isDebugging) console.warn(`❌ Invalid slug from alternative source: ${slug}`);
        redirectToDocsHome();
      }
    } else {
      if (isDebugging) console.warn('❓ No slug detected from any source');
      redirectToDocsHome();
    }
  }, [pathname, searchParams, router, hasNavigated, isDebugging]);

  // Helper function to update document title
  const updateDocumentTitle = (slug: string) => {
    const titleMap: Record<string, string> = {
      'getting-started': 'Getting Started',
      'searching-deals': 'Searching for Deals',
      'deal-goals': 'Creating Deal Goals',
      'tracking-deals': 'Tracking Deals',
      'understanding-deal-analysis': 'Understanding Deal Analysis',
      'sharing-deals': 'Sharing Deals',
      'token-system': 'Token System',
      'troubleshooting': 'Troubleshooting',
      'faq': 'Frequently Asked Questions'
    };
    
    document.title = `${titleMap[slug] || slug} | RebatOn`;
    if (isDebugging) console.log(`📝 Updated document title to: ${document.title}`);
  }
  
  // Helper function to update URL path
  const updateUrlPath = (slug: string) => {
    const expectedPath = `/how-to-use/${slug}`;
    
    if (pathname !== expectedPath && !hasNavigated) {
      if (isDebugging) console.log(`🔄 Updating URL to: ${expectedPath}`);
      
      // We'll preserve query parameters for debugging purposes
      const currentUrl = new URL(window.location.href);
      currentUrl.pathname = expectedPath;
      
      // Update URL without navigation
      window.history.pushState({}, '', currentUrl.toString());
      setHasNavigated(true);
      
      // Dispatch event for other components to listen for
      const event = new CustomEvent('doc-slug-detected', { detail: { slug } });
      document.dispatchEvent(event);
    }
  }
  
  // Helper function to redirect to docs home
  const redirectToDocsHome = () => {
    if (isDebugging) console.log('🏠 Redirecting to documentation home page');
    router.push('/how-to-use');
  }

  return <>{children}</>;
}

// Helper function to log all meta tags for debugging
const logAllMetaTags = () => {
  if (typeof document === 'undefined') return;
  
  const metaTags = document.getElementsByTagName('meta');
  console.log('Current meta tags:');
  for (let i = 0; i < metaTags.length; i++) {
    const name = metaTags[i].getAttribute('name');
    const content = metaTags[i].getAttribute('content');
    if (name) console.log(`- ${name}: ${content}`);
  }
};

// Helper to fix path issues
const fixPath = (currentPath: string) => {
  // Clean up the path to extract just the slug
  if (currentPath.startsWith('/how-to-use/')) {
    const parts = currentPath.split('/');
    // Get the last non-empty part
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] && parts[i] !== 'how-to-use') {
        return parts[i];
      }
    }
  }
  return null;
};

// Helper to get the documentation slug from multiple sources
const getDocSlug = (
  path: string, 
  params: ReadonlyURLSearchParams, 
  localStorage: Storage | null
): string | null => {
  // First priority: Check the specific doc_slug parameter
  const docSlugParam = params.get('doc_slug');
  if (docSlugParam) {
    console.log(`getDocSlug: Found doc_slug parameter: ${docSlugParam}`);
    return docSlugParam;
  }
  
  // Second priority: Get from the path
  let slug = null;
  if (path && path.startsWith('/how-to-use/')) {
    slug = fixPath(path);
    console.log(`getDocSlug: Extracted slug from path: ${slug}`);
    return slug;
  }
  
  // Third priority: Get from regular slug param
  slug = params.get('slug');
  if (slug) {
    console.log(`getDocSlug: Found slug parameter: ${slug}`);
    return slug;
  }
  
  // Last resort: Get from localStorage
  if (localStorage) {
    slug = localStorage.getItem('lastDocSlug');
    if (slug) {
      console.log(`getDocSlug: Retrieved slug from localStorage: ${slug}`);
      return slug;
    }
  }
  
  return null;
}; 