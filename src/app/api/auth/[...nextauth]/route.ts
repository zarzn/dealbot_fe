// This is a custom implementation that bypasses NextAuth's built-in API routes
// to avoid the cookies() requestAsyncStorage error
export const dynamic = 'force-dynamic';

// Remove the edge runtime specification that's causing the crypto module error
// export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

// Simple server-side logging for critical events only
function serverLog(message: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[NEXTAUTH] ${message}`);
  }
}

// Create a compatibility layer for NextAuth
const auth = authOptions;

// Sign in handler
async function handleSignIn(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const { email, password, callbackUrl } = body;
    
    console.log('[CUSTOM AUTH] Sign in request:', { email, hasCallbackUrl: !!callbackUrl });
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Make the API request to our backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create a custom session cookie without using NextAuth
    const sessionData = {
      user: {
        email: data.user?.email || email,
        name: data.user?.name || email.split('@')[0],
        id: data.user?.id || 'user-id',
        image: data.user?.image,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      accessToken: data.access_token,
    };
    
    // Set our custom session data in a cookie
    const cookieStr = `custom_auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
    
    // Return success with the session data and set cookie
    const redirectUrl = callbackUrl || '/dashboard';
    return NextResponse.json(
      { 
        ok: true,
        url: redirectUrl,
        user: sessionData.user 
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': cookieStr,
          'Location': redirectUrl
        }
      }
    );
  } catch (error) {
    console.error('[CUSTOM AUTH] Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error during sign in' },
      { status: 500 }
    );
  }
}

// Session handler - returns current session data
async function handleSession(req: NextRequest) {
  try {
    // Check if we have a session cookie
    const cookieStr = req.cookies.get('custom_auth_session')?.value;
    
    if (!cookieStr) {
      return NextResponse.json({ user: null });
    }
    
    // Parse the session data
    const sessionData = JSON.parse(decodeURIComponent(cookieStr));
    
    // Check if session has expired
    if (new Date(sessionData.expires) < new Date()) {
      // Clear the cookie if expired
      return NextResponse.json(
        { user: null },
        { 
          headers: {
            'Set-Cookie': 'custom_auth_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
          }
        }
      );
    }
    
    // Return the session data
    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('[CUSTOM AUTH] Session error:', error);
    return NextResponse.json({ user: null });
  }
}

// Signout handler - clears the session cookie
async function handleSignOut(req: NextRequest) {
  try {
    const cookieStr = 'custom_auth_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
    const body = await req.json().catch(() => ({}));
    const callbackUrl = body?.callbackUrl || '/auth/signin';
    
    return NextResponse.json(
      { success: true, url: callbackUrl },
      { 
        headers: {
          'Set-Cookie': cookieStr
        }
      }
    );
  } catch (error) {
    console.error('[CUSTOM AUTH] Sign out error:', error);
    return NextResponse.json(
      { success: true, url: '/auth/signin' },
      { 
        headers: {
          'Set-Cookie': 'custom_auth_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        }
      }
    );
  }
}

// Main handler for all auth routes
export async function GET(req: NextRequest, { params }: { params: { nextauth: string[] }}) {
  const path = params.nextauth[0] || '';
  
  // Redirect all session requests to our custom session API
  if (path === 'session') {
    return handleSession(req);
  }
  
  // For any other GET requests, return an error
  return NextResponse.json(
    { error: `Unsupported GET operation: ${path}` },
    { status: 400 }
  );
}

export async function POST(req: NextRequest, { params }: { params: { nextauth: string[] }}) {
  const path = params.nextauth[0] || '';
  
  // Handle different auth operations
  if (path === 'signin' || path === 'callback') {
    const provider = params.nextauth[1] || '';
    
    // Currently only supporting credentials
    if (provider === 'credentials') {
      return handleSignIn(req);
    }
    
    return NextResponse.json(
      { error: `Unsupported provider: ${provider}` },
      { status: 400 }
    );
  } 
  else if (path === 'signout') {
    return handleSignOut(req);
  }
  else if (path === 'session') {
    return handleSession(req);
  }
  
  // For any other POST requests, return an error
  return NextResponse.json(
    { error: `Unsupported POST operation: ${path}` },
    { status: 400 }
  );
}
