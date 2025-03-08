import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Get request details for debugging
  const url = request.url;
  const method = request.method;
  
  // Get headers safely
  let headersList: Record<string, string> = {};
  try {
    const headersList = Object.fromEntries(
      Array.from(headers().entries())
        .filter(([key]) => !key.toLowerCase().includes('cookie')) // Don't log cookies for security
    );
  } catch (e) {
    console.error("Error reading headers:", e);
  }
  
  // Get cookies safely
  let cookiesList: Record<string, string> = {};
  try {
    const cookieStore = cookies();
    // Just check if auth cookies exist, don't log their values
    cookiesList = {
      hasNextAuthSessionToken: cookieStore.has('next-auth.session-token') ? 'yes' : 'no',
      hasNextAuthCallbackUrl: cookieStore.has('next-auth.callback-url') ? 'yes' : 'no',
      hasNextAuthCsrfToken: cookieStore.has('next-auth.csrf-token') ? 'yes' : 'no',
      cookieCount: cookieStore.getAll().length.toString()
    };
  } catch (e) {
    console.error("Error reading cookies:", e);
  }

  return NextResponse.json({
    status: "success",
    message: "API routes are working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    request: {
      url,
      method
    },
    // Include basic header info to check auth header presence 
    headers: {
      hasAuthorization: !!headersList['authorization'] || !!headersList['Authorization'],
      count: Object.keys(headersList).length
    },
    cookies: cookiesList
  });
} 