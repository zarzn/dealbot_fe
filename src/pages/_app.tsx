import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../app/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // Add event listener for storage changes to support dynamic routes and monitor routing events
  useEffect(() => {
    const processQueryParams = () => {
      if (typeof window === 'undefined') return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      if (redirectPath) {
        console.log(`_app.tsx detected redirect parameter: ${redirectPath}`);
      }
    };
    
    // Process on initial load
    processQueryParams();
    
    // Setup storage event listener for cross-tab communication
    const handleStorageChange = (event: StorageEvent) => {
      // Only handle specific storage keys related to route handling
      if (event.key && 
          ['agentic_deals_dynamic_route', 'agentic_deals_route_params', 'agentic_deals_route_timestamp', 'agentic_deals_route_history'].includes(event.key)) {
        console.log(`Storage changed: ${event.key}=${event.newValue}`);
      }
    };

    // Track navigation events to help with debugging
    const handleRouteChange = () => {
      console.log(`Route changed to: ${window.location.pathname}${window.location.search}`);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Meta tags for dynamic routing */}
        <meta name="dynamic-routes-enabled" content="true" />
        <meta name="spa-routing" content="enabled" />
      </Head>
      
      <Component {...pageProps} />
    </>
  )
}
