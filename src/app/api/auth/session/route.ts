// Stub implementation for session API route
// This file exists to satisfy Next.js routing requirements in static export mode
// Actual session management is handled client-side

import { NextResponse } from 'next/server';

// For static export compatibility
export function GET() {
  return new NextResponse(
    JSON.stringify({ 
      user: null,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      error: "API routes are not available in static export mode" 
    }),
    { 
      status: 200, 
      headers: { 'content-type': 'application/json' } 
    }
  );
} 