import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { NextRequest } from 'next/server';

// This is required to prevent the StaticGenBailoutError
export const dynamic = 'force-dynamic';

// Define proper types for NextAuth
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string | undefined;
    provider: string | undefined;
    error: string | undefined;
  }

  interface User {
    id: string;
    email: string;
    accessToken: string | undefined;
    provider: string | undefined;
  }
}

// Define proper types for JWT
declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string | undefined;
    provider: string | undefined;
    error: string | undefined;
  }
}

// Determine if we're running in a browser
const isBrowser = typeof window !== 'undefined';

// Determine if we're running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// In development, always treat as localhost
const isLocalhost = isDevelopment || (isBrowser && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
));

// HARDCODED PRODUCTION URLS
const PRODUCTION_APP_URL = 'https://d3irpl0o2ddv9y.cloudfront.net';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // If we're in development mode, use localhost
  if (isDevelopment || isLocalhost) {
    return "http://localhost:3000";
  }
  
  // If we're in a browser and not on localhost, use the current URL's origin
  if (isBrowser) {
    return window.location.origin;
  }
  
  // Use hardcoded production URL
  return PRODUCTION_APP_URL;
};

// Get the NEXTAUTH_URL from environment or compute it
const getNextAuthUrl = () => {
  return getBaseUrl();
};

// Always log configuration to help with debugging
console.log('NextAuth Configuration:', {
  baseUrl: getBaseUrl(),
  nextAuthUrl: getNextAuthUrl(),
  isLocalhost,
  isBrowser,
  isDevelopment,
  hostname: isBrowser ? window.location.hostname : 'not in browser',
  NODE_ENV: process.env.NODE_ENV
});

// Define NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        accessToken: { label: "Access Token", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.accessToken) {
          return {
            id: credentials.email || "user-id",
            email: credentials.email || "user@example.com",
            accessToken: credentials.accessToken,
            provider: 'credentials',
          };
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/signup"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'credentials' && user?.accessToken) {
        token.accessToken = user.accessToken;
        token.provider = 'credentials';
      } else if (account?.access_token) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        provider: token.provider,
      };
    },
    async redirect({ url, baseUrl }) {
      try {
        // Always use our determined base URL
        const effectiveBaseUrl = getBaseUrl();
        
        console.log('NextAuth Redirect:', {
          url,
          baseUrl,
          effectiveBaseUrl,
          environment: process.env.NODE_ENV
        });
        
        // Skip NextAuth redirection entirely when using credentials provider
        // This allows our custom redirect logic in SignIn component to take over
        if (url.includes('/api/auth/signin/credentials') || 
            url.includes('/api/auth/callback/credentials')) {
          console.log('Using custom redirect logic for credentials provider');
          return `${effectiveBaseUrl}/dashboard`;
        }
        
        // If URL starts with base URL, allow it (internal redirect)
        if (url.startsWith(effectiveBaseUrl)) {
          return url;
        }
        
        // If URL is a relative path, append it to the base URL
        if (url.startsWith('/')) {
          // Special case for dashboard redirect
          if (url === '/dashboard' || url.startsWith('/auth/signin')) {
            console.log('Redirecting to dashboard after sign-in');
            return `${effectiveBaseUrl}/dashboard`;
          }
          
          // Special case for sign out - redirect to home
          if (url === '/signout' || url.startsWith('/auth/signout')) {
            console.log('Redirecting to home after sign-out');
            return effectiveBaseUrl;
          }
          
          return `${effectiveBaseUrl}${url}`;
        }
        
        // For any other URL, validate it's safe
        try {
          const urlObj = new URL(url);
          const baseUrlObj = new URL(effectiveBaseUrl);
          
          // If it's the same origin, allow it
          if (urlObj.origin === baseUrlObj.origin) {
            return url;
          }
        } catch (error) {
          console.error('Error parsing URL:', error);
        }
        
        // Default to dashboard for most cases, home for sign-out
        if (url.includes('signout')) {
          return effectiveBaseUrl;
        }
        
        console.log('Default redirect to dashboard');
        return `${effectiveBaseUrl}/dashboard`;
      } catch (error) {
        console.error("Redirect callback error:", error);
        // On error, redirect to dashboard (safer than error page)
        return `${getBaseUrl()}/dashboard`;
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: "Z2zvLfLkb5sPU0wjjXIaZ+AajgRDGUjj48DAFktdL78=", // Hardcoded secret from .env.production
  // Ensure cookies work with CloudFront
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost,
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
