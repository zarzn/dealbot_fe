/**
 * Auth Cookie Management Utility
 * 
 * This utility helps bridge the gap between localStorage tokens and server-side middleware
 * by setting and managing special cookies that middleware can read.
 */

/**
 * Set the auth token cookie to help middleware detect authentication
 */
export function setAuthCookie(): void {
  if (typeof document === 'undefined') return; // Only run in browser
  
  // Get access token from localStorage
  const accessToken = localStorage.getItem('access_token');
  
  if (accessToken) {
    // Set a cookie that middleware can read to detect authentication
    // Use a secure, HTTP-only cookie with proper path and SameSite settings
    document.cookie = `app-access-token=true; path=/; max-age=86400; SameSite=Lax`;
    
    // Add a secondary cookie for NextAuth compatibility
    // This helps with detection in the session API route
    document.cookie = `has_access_token=true; path=/; max-age=86400; SameSite=Lax`;
    
    console.log('Auth cookies set for middleware and NextAuth detection');
  } else {
    // Clear the cookies if no token found
    document.cookie = `app-access-token=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `has_access_token=; path=/; max-age=0; SameSite=Lax`;
    console.log('Auth cookies cleared due to missing token');
  }
}

/**
 * Clear all auth cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return; // Only run in browser
  
  // Clear app cookies
  document.cookie = `app-access-token=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `has_access_token=; path=/; max-age=0; SameSite=Lax`;
  
  // Also try to clear NextAuth cookies
  const domainPart = window.location.hostname === 'localhost' ? '' : '; domain=' + window.location.hostname;
  
  document.cookie = `next-auth.session-token=; path=/; max-age=0; SameSite=Lax${domainPart}`;
  document.cookie = `__Secure-next-auth.session-token=; path=/; max-age=0; SameSite=Lax; secure${domainPart}`;
  document.cookie = `__Host-next-auth.csrf-token=; path=/; max-age=0; SameSite=Lax; secure${domainPart}`;
  document.cookie = `next-auth.csrf-token=; path=/; max-age=0; SameSite=Lax${domainPart}`;
  document.cookie = `next-auth.callback-url=; path=/; max-age=0; SameSite=Lax${domainPart}`;
  
  console.log('All auth cookies cleared');
}

/**
 * Check if auth cookie is set
 */
export function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false; // Only run in browser
  
  return document.cookie.includes('app-access-token=true') || 
         document.cookie.includes('has_access_token=true');
} 