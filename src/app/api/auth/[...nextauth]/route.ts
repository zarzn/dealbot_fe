// Stub implementation for NextAuth API route
// This file exists to satisfy Next.js routing requirements in static export mode
// Actual authentication is handled client-side

import { NextResponse } from 'next/server';

// For static export compatibility
export function GET() {
  return new NextResponse(
    JSON.stringify({ 
      error: "API routes are not available in static export mode" 
    }),
    { 
      status: 200, 
      headers: { 'content-type': 'application/json' } 
    }
  );
}

export function POST() {
  return new NextResponse(
    JSON.stringify({ 
      error: "API routes are not available in static export mode" 
    }),
    { 
      status: 200, 
      headers: { 'content-type': 'application/json' } 
    }
  );
}
