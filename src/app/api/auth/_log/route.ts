import { NextResponse } from "next/server";

// This is required to prevent the StaticGenBailoutError
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("[next-auth] Log from client:", data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in NextAuth log handler:", error);
    
    // Even if JSON parsing fails, we should return a successful response
    // so that the client doesn't keep retrying
    return NextResponse.json(
      { success: true, message: "Logged error" },
      { status: 200 }
    );
  }
} 