import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Attempt to clear auth cookies
  try {
    const cookieStore = cookies();
    // Log the cookies we're about to clear
    console.log("SIGNOUT API: Clearing cookies, current cookies:", 
      cookieStore.getAll().map(c => c.name));
    
    // Clear all possible NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Secure-next-auth.csrf-token',
      '__Host-next-auth.csrf-token'
    ];
    
    // Create response with cookie clearing headers
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully"
    });
    
    // Set cookie clearing headers for each cookie
    cookiesToClear.forEach(name => {
      // Expire and clear cookie value
      response.cookies.set({
        name,
        value: '',
        expires: new Date(0),
        path: '/'
      });
      console.log(`SIGNOUT API: Cleared cookie ${name}`);
    });
    
    return response;
  } catch (error) {
    console.error("SIGNOUT API: Error clearing cookies:", error);
    return NextResponse.json({
      success: true,
      message: "Attempted sign out, but encountered an error clearing cookies"
    });
  }
}

export async function POST(request: Request) {
  // Use the same implementation as GET
  return GET(request);
} 