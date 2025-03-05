import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

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

// Determine if we're running on localhost
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

// HARDCODED PRODUCTION URLS
const PRODUCTION_APP_URL = 'https://d3irpl0o2ddv9y.cloudfront.net';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // If we're in a browser and not on localhost, use the current URL's origin
  if (isBrowser && !isLocalhost) {
    return window.location.origin;
  }
  
  // Use hardcoded production URL
  if (!isLocalhost) {
    return PRODUCTION_APP_URL;
  }
  
  // Default to localhost for development
  return "http://localhost:3000";
};

// Get the NEXTAUTH_URL from environment or compute it
const getNextAuthUrl = () => {
  // If we're not on localhost, use the production URL
  if (!isLocalhost) {
    return PRODUCTION_APP_URL;
  }
  
  // Otherwise compute it from APP_URL
  return getBaseUrl();
};

// Always log configuration to help with debugging
console.log('NextAuth Configuration:', {
  baseUrl: getBaseUrl(),
  nextAuthUrl: getNextAuthUrl(),
  isLocalhost,
  isBrowser,
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
      // Always use our determined base URL
      const effectiveBaseUrl = getBaseUrl();
      
      // Log redirect in development
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Redirect:', {
          url,
          baseUrl,
          effectiveBaseUrl
        });
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${effectiveBaseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      try {
        const urlOrigin = new URL(url).origin;
        if (urlOrigin === effectiveBaseUrl || urlOrigin === baseUrl) {
          return url;
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
      }
      
      return effectiveBaseUrl;
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
