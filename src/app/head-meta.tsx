'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Component to handle CloudFront function headers by adding them as meta tags
 * This should be included in the root layout to capture all routing scenarios
 */
export default function HeadMetaTags() {
  useEffect(() => {
    // Function to check headers from CloudFront on page load
    const checkHeadersOnLoad = () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Check for specific shared deal URL pattern
        if (window.location.pathname === '/shared-deal') {
          // Extract the ID from query parameters
          const urlParams = new URLSearchParams(window.location.search);
          const dealId = urlParams.get('id');
          
          if (dealId) {
            console.log('HeadMetaTags: Detected shared deal ID from URL:', dealId);
            
            // Add meta tags that the page components can read
            addMetaTag('x-shared-deal-id', dealId);
            addMetaTag('x-is-shared-deal', 'true');
            addMetaTag('x-content-type', 'shared-deal');
            
            // Also store in localStorage for cross-component access
            localStorage.setItem('agentic_deals_viewing_shared_deal', dealId);
            
            // Dispatch custom event to notify components
            const event = new CustomEvent('shared-deal-id-detected', { 
              detail: { id: dealId } 
            });
            window.dispatchEvent(event);
          }
        }
      } catch (err) {
        console.error('Error in header check:', err);
      }
    };
    
    // Run check on initial load and URL changes
    checkHeadersOnLoad();
    
    // Also monitor for navigation events
    const handleRouteChange = () => {
      setTimeout(checkHeadersOnLoad, 0);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  // Helper function to add meta tags
  const addMetaTag = (name: string, content: string) => {
    // Check if the tag already exists
    let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    
    if (!meta) {
      // Create a new tag if it doesn't exist
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = name;
      document.head.appendChild(meta);
    }
    
    // Set/update the content
    meta.setAttribute('content', content);
  };
  
  return (
    <>
      {/* Inline script to run before React loads to capture shared deal ID */}
      <Script id="shared-deal-detection" strategy="beforeInteractive">
        {`
          (function() {
            try {
              // Check for shared deal URL pattern
              if (window.location.pathname === '/shared-deal') {
                // Get shared deal ID from query parameters
                var urlParams = new URLSearchParams(window.location.search);
                var dealId = urlParams.get('id');
                
                if (dealId) {
                  console.log('Early detection: Found shared deal ID:', dealId);
                  // Set early detection flag
                  window.__SHARED_DEAL_ID = dealId;
                  // Also store in localStorage for components to access
                  localStorage.setItem('agentic_deals_viewing_shared_deal', dealId);
                  
                  // Add meta tags that React components can read
                  var addMeta = function(name, content) {
                    var meta = document.createElement('meta');
                    meta.name = name;
                    meta.content = content;
                    document.head.appendChild(meta);
                  };
                  
                  // Add various meta tags to help detection
                  addMeta('x-shared-deal-id', dealId);
                  addMeta('x-is-shared-deal', 'true');
                  addMeta('x-content-type', 'shared-deal');
                  addMeta('x-page-type', 'shared-deal');
                }
              }
            } catch(e) {
              console.error('Error in shared deal early detection script:', e);
            }
          })();
        `}
      </Script>
    </>
  );
} 