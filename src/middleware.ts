import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Function to check for authentication tokens in a request
function checkForAuthTokens(req: NextRequest): boolean {
  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  const hasAuthHeader = !!authHeader && authHeader.startsWith('Bearer ');
  
  // Check for JWT token cookies
  const hasNextAuthCookie = 
    req.cookies.has('next-auth.session-token') || 
    req.cookies.has('__Secure-next-auth.session-token');
  
  // Check for custom auth cookies
  const hasAppAuthCookie = req.cookies.has('app-access-token');
  const hasAltAuthCookie = req.cookies.has('has_access_token');
  
  console.log('Auth token check:', { 
    hasAuthHeader,
    hasNextAuthCookie,
    hasAppAuthCookie,
    hasAltAuthCookie,
    cookieCount: req.cookies.getAll().length
  });
  
  return hasAuthHeader || hasNextAuthCookie || hasAppAuthCookie || hasAltAuthCookie;
}

// Custom middleware to handle authentication
export function middleware(req: NextRequest) {
  console.log('Middleware executing for:', req.nextUrl.pathname);
  
  // Dashboard routes handling
  if (req.nextUrl.pathname === '/dashboard' || req.nextUrl.pathname.startsWith('/dashboard/')) {
    console.log('Handling dashboard route in middleware');
    
    // Check for authentication tokens
    if (checkForAuthTokens(req)) {
      console.log('Dashboard access granted: authentication tokens found');
      return NextResponse.next();
    }
    
    // If no tokens, redirect to sign-in
    console.log('No auth tokens found, redirecting to sign-in');
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  // Protected routes - authentication required
  if (req.nextUrl.pathname.match(/\/(goals|deals|profile|chat|settings|wallet|notifications)/)) {
    console.log('Protected route access check');
    
    // Check for authentication tokens
    if (checkForAuthTokens(req)) {
      console.log('Protected route access granted: authentication tokens found');
      return NextResponse.next();
    }
    
    // Redirect to sign-in page
    console.log('No auth tokens found, redirecting to sign-in');
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  // Auth routes - no need for special handling, Next.js routing will take care of these
  
  // All other routes allowed
  return NextResponse.next();
}

// Define which routes require authentication
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard',
    '/dashboard/:path*',
    '/goals/:path*',
    '/deals/:path*', 
    '/profile/:path*',
    '/chat/:path*',
    '/settings/:path*',
    '/wallet/:path*',
    '/notifications/:path*',
  ]
}; 