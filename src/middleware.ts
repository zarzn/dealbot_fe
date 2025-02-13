import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function will be called for protected routes only
export default withAuth(
  function middleware(req: NextRequest) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
      verifyRequest: '/auth/verify-request',
      newUser: '/auth/signup'
    },
  }
);

// Define which routes require authentication
export const config = {
  matcher: [
    // Protected routes that require authentication
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