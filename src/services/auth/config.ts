import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import { JWT } from 'next-auth/jwt';
import { authService } from '../auth';

interface CustomUser {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

interface CustomSession {
  user: {
    email: string;
    name: string;
  };
  accessToken: string;
  expires: string;
}

interface CustomToken {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        try {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (response.access_token) {
            return {
              id: credentials.email,
              email: credentials.email,
              name: '', // Will be updated from profile
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
            };
          }

          throw new Error('Invalid response from server');
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      try {
        // Handle social login
        const response = await authService.socialLogin(
          account!.provider,
          account!.access_token!
        );

        if (response.access_token) {
          // Type assertion to CustomUser
          (user as CustomUser).accessToken = response.access_token;
          (user as CustomUser).refreshToken = response.refresh_token;
          return true;
        }

        return false;
      } catch (error) {
        console.error('Social sign in failed:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          accessToken: customUser.accessToken,
          refreshToken: customUser.refreshToken,
          email: customUser.email,
          name: customUser.name,
        };
      }

      // Handle token refresh if needed
      try {
        const refreshToken = token.refreshToken as string;
        const response = await authService.refreshToken(refreshToken);
        
        return {
          ...token,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        };
      } catch {
        return token;
      }
    },

    async session({ session, token }) {
      const customToken = token as unknown as CustomToken;
      return {
        ...session,
        accessToken: customToken.accessToken,
        user: {
          email: customToken.email,
          name: customToken.name,
        }
      } as CustomSession;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 