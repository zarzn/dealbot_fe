// Stub implementation for signout API route
// This file exists to satisfy Next.js routing requirements in static export mode
// Actual signout is handled client-side

import { NextResponse } from 'next/server';

// For static export compatibility
export function GET() {
  return new NextResponse(
    JSON.stringify({ 
      success: true,
      message: "Signed out successfully",
      note: "API routes are not available in static export mode" 
    }),
    { 
      status: 200, 
      headers: { 'content-type': 'application/json' } 
    }
  );
}

export function POST() {
  // Use same implementation as GET
  return GET();
} 