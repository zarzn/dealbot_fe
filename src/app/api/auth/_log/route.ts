import { NextResponse } from "next/server";

// This is required to prevent the StaticGenBailoutError
export const dynamic = 'force-dynamic';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Only log in development mode
    if (isDevelopment) {
      console.log("[next-auth] Log from client:", data);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Always log errors, but in production they might be filtered by the hosting platform
    console.error("Error in NextAuth log handler:", error);
    
    // Even if JSON parsing fails, we should return a successful response
    // so that the client doesn't keep retrying
    return NextResponse.json(
      { success: true, message: "Logged error" },
      { status: 200 }
    );
  }
} 