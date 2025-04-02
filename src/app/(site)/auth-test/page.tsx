'use client';

import { useSafeSession } from '@/lib/use-safe-session';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthTestPage() {
  // Use safe version of useSession
  const session = useSafeSession();
  const status = session?.status || 'unauthenticated';
  const sessionData = session?.data;
  
  const [localTokens, setLocalTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  }>({ accessToken: null, refreshToken: null });
  
  const [cookies, setCookies] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Mark that we're client-side
    setIsClient(true);
    
    // Check for tokens in localStorage
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    setLocalTokens({ accessToken, refreshToken });
    
    // This is a client-side only way to see cookies, not all cookies will be visible
    setCookies(document.cookie.split(';').map(c => c.trim()));
  }, []);
  
  // Render nothing during SSG for safe static exports
  if (!isClient) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Authentication Test Page</h1>
        
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p className="mb-2">Current status: <span className="font-medium">{status}</span></p>
          
          {status === 'authenticated' && sessionData && (
            <div>
              <p className="text-green-600 font-medium">✅ Session is active</p>
              <div className="mt-2 p-3 bg-gray-800 text-white rounded overflow-auto text-sm">
                <pre>{JSON.stringify(sessionData, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {status === 'loading' && (
            <p className="text-blue-600">⏳ Loading session...</p>
          )}
          
          {status === 'unauthenticated' && (
            <p className="text-red-600">❌ No session</p>
          )}
        </div>
        
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Local Storage Tokens</h2>
          
          {localTokens.accessToken ? (
            <div>
              <p className="text-green-600 font-medium mb-2">✅ Access token found in localStorage</p>
              <div className="mb-2 p-3 bg-gray-800 text-white rounded overflow-auto text-sm">
                <p>Token: {localTokens.accessToken.substring(0, 20)}...</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 mb-4">❌ No access token in localStorage</p>
          )}
          
          {localTokens.refreshToken ? (
            <div>
              <p className="text-green-600 font-medium mb-2">✅ Refresh token found in localStorage</p>
              <div className="p-3 bg-gray-800 text-white rounded overflow-auto text-sm">
                <p>Token: {localTokens.refreshToken.substring(0, 20)}...</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600">❌ No refresh token in localStorage</p>
          )}
        </div>
        
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Client-Visible Cookies</h2>
          {cookies.length > 0 ? (
            <ul className="list-disc pl-5">
              {cookies.map((cookie, i) => (
                <li key={i} className="mb-1">{cookie}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No cookies visible to client JavaScript</p>
          )}
          <p className="mt-4 text-sm text-gray-500">Note: HTTP-only cookies used for authentication won&apos;t be visible here</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Link href="/auth/signin" className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
            Go to Sign In
          </Link>
          <Link href="/auth/signout" className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700">
            Sign Out
          </Link>
          <Link href="/dashboard" className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            Try Dashboard
          </Link>
          <Link href="/" className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
} 