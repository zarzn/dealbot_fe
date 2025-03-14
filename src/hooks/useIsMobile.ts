import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current view is mobile-sized
 * @param breakpoint The breakpoint width in pixels (default: 768)
 * @returns Boolean indicating if the screen is mobile-sized
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check on mount
    checkIfMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [breakpoint]);

  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < breakpoint);
  };

  return isMobile;
}

export default useIsMobile; 