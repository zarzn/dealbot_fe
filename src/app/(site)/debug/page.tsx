'use client';

import { useSafeSession } from '@/lib/use-safe-session';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_CONFIG } from '@/services/api/config';

export default function DebugPage() {
  const session = useSafeSession();
  const status = session?.status || 'unauthenticated';
  const sessionData = session?.data;
  
  const router = useRouter();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to test session API
  const fetchSession = async () => {
    try {
      const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/auth/session`;
      console.log('Making session request to:', apiUrl);
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      setApiResponse(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching session:', error);
      setError(`Error fetching session: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  };

  // Function to test API test endpoint
  const fetchTestEndpoint = async () => {
    try {
      const apiUrl = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/test`;
      console.log('Making test request to:', apiUrl);
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error fetching test endpoint:', error);
      setError(`Error fetching test API: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Redirect to dashboard on authenticated session
  useEffect(() => {
    if (isClient && status === 'authenticated') {
      console.log('User is authenticated, can redirect to dashboard', sessionData);
    }
  }, [status, sessionData, router, isClient]);

  // Render nothing during SSG for safe static exports
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Authentication Debug Page</h1>
        
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p className="mb-2">Current status: <span className="font-medium">{status}</span></p>
          {status === 'authenticated' && sessionData && (
            <div>
              <p className="text-green-600 font-medium">✓ User is authenticated</p>
              <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-auto text-sm">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          )}
          {status === 'loading' && <p className="text-blue-600">Loading session...</p>}
          {status === 'unauthenticated' && <p className="text-red-600">User is not authenticated</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={fetchSession}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Session API
          </button>
          <button
            onClick={fetchTestEndpoint}
            className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test API Endpoint
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-red-300 bg-red-50 rounded text-red-800">
            <h3 className="font-semibold mb-2">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {apiResponse && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <pre className="p-4 bg-gray-800 text-white rounded overflow-auto text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link href="/auth/signin" className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
            Go to Sign In
          </Link>
          <Link href="/dashboard" className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Go to Dashboard
          </Link>
          <Link href="/" className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 