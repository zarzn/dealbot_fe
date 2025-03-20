import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic is crucial for NextAuth to work
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check for auth cookies to determine authentication state
    let hasNextAuthCookie = false;
    let hasCustomAuthCookie = false;
    let cookieCount = 0;
    
    try {
      const cookiesList = cookies();
      cookieCount = cookiesList.getAll().length;
      
      // Check for NextAuth cookies
      hasNextAuthCookie = 
        cookiesList.has('next-auth.session-token') || 
        cookiesList.has('__Secure-next-auth.session-token');
      
      // Check for our custom auth cookie
      hasCustomAuthCookie = 
        cookiesList.has('app-access-token') || 
        cookiesList.has('has_access_token');
      
      // Removed log to reduce console spam
    } catch (cookieError) {
      // Only log actual errors
      console.error("SESSION API ROUTE: Cookie error:", cookieError);
    }
    
    // If we have either a NextAuth session cookie or our custom auth cookie, return a session
    if (hasNextAuthCookie || hasCustomAuthCookie) {
      // Removed log to reduce console spam
      
      return NextResponse.json({
        user: {
          name: "Authenticated User",
          email: "user@example.com",
        },
        // No need to include accessToken in the response as it's already in localStorage
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Removed log to reduce console spam
    
    // Return an empty session that NextAuth client can work with
    return NextResponse.json({
      user: null,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    });
  } catch (error) {
    // Keep error logging for troubleshooting
    console.error("Error in session API route:", error);
    
    // Return an empty session on error to prevent infinite retries
    return NextResponse.json({ user: null });
  }
} 