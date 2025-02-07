import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

interface CustomUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface CustomSession {
  user: {
    email: string;
  };
  accessToken: string;
  expires: string;
}

interface CustomToken {
  accessToken: string;
  refreshToken: string;
  email: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        console.log('=== Starting authorization process ===');
        console.log('Current environment:', {
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NODE_ENV: process.env.NODE_ENV
        });

        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password });
          throw new Error('Please enter your email and password');
        }

        try {
          console.log('Preparing form data for login request');
          const formData = new URLSearchParams();
          formData.append('username', credentials.email);
          formData.append('password', credentials.password);

          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const loginUrl = `${baseUrl}/api/v1/users/login`;
          
          // First test connectivity with a simple GET request
          console.log('Testing backend connectivity...');
          try {
            console.log('Sending health check request to:', `${baseUrl}/api/v1/health`);
            const healthCheck = await fetch(`${baseUrl}/api/v1/health`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              },
              mode: 'cors',
              credentials: 'include'
            });
            console.log('Health check response:', {
              ok: healthCheck.ok,
              status: healthCheck.status,
              statusText: healthCheck.statusText,
              headers: Object.fromEntries(healthCheck.headers.entries())
            });

            const healthData = await healthCheck.json();
            console.log('Health check data:', healthData);
          } catch (healthError: any) {
            console.error('Health check failed:', {
              name: healthError.name,
              message: healthError.message,
              cause: healthError.cause,
              stack: healthError.stack
            });
          }
          
          console.log('Making login request to:', loginUrl);
          console.log('Form data:', {
            username: credentials.email,
            passwordLength: credentials.password?.length
          });

          try {
            console.log('=== Starting fetch request ===');
            const response = await fetch(loginUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              body: formData.toString(),
              mode: 'cors',
              credentials: 'include'
            });

            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            console.log('Response received:', {
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
              type: response.type,
              url: response.url
            });
          
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Login failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
              });
              
              try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.detail || 'Invalid credentials');
              } catch (e) {
                throw new Error(errorText || 'Invalid credentials');
              }
            }

            console.log('Parsing response body');
            const data = await response.json();
            console.log('Response data received:', {
              hasAccessToken: !!data.access_token,
              hasRefreshToken: !!data.refresh_token,
              tokenType: data.token_type
            });
            
            if (data.access_token) {
              console.log('Creating user object with tokens');
              const user = {
                id: credentials.email,
                email: credentials.email,
                accessToken: data.access_token,
                refreshToken: data.refresh_token
              };
              console.log('Returning user object:', { ...user, accessToken: '[REDACTED]', refreshToken: '[REDACTED]' });
              return user;
            }

            console.error('No access token in response:', data);
            throw new Error('Invalid response from server');
          } catch (fetchError: any) {
            console.error('Fetch operation failed:', {
              name: fetchError.name,
              message: fetchError.message,
              type: fetchError.type,
              code: fetchError.code,
              cause: fetchError.cause
            });
            throw new Error(fetchError.message || 'Failed to connect to authentication server');
          }
        } catch (error: any) {
          console.error('Login process failed:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
          });
          throw new Error(error.message || 'Failed to connect to authentication server. Please check if the server is running and accessible.');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('=== JWT Callback ===');
      console.log('Input token:', { ...token, sub: token.sub });
      console.log('Input user:', user ? { 
        ...user, 
        accessToken: user.accessToken ? '[REDACTED]' : undefined,
        refreshToken: user.refreshToken ? '[REDACTED]' : undefined
      } : 'No user');

      if (user) {
        const customUser = user as CustomUser;
        const newToken = {
          ...token,
          accessToken: customUser.accessToken,
          refreshToken: customUser.refreshToken,
          email: customUser.email,
        };
        console.log('Returning new token:', { 
          ...newToken,
          accessToken: '[REDACTED]',
          refreshToken: '[REDACTED]'
        });
        return newToken;
      }
      console.log('Returning existing token');
      return token;
    },
    async session({ session, token }) {
      console.log('=== Session Callback ===');
      console.log('Input session:', { ...session, expires: session.expires });
      console.log('Input token:', { 
        ...token,
        accessToken: '[REDACTED]',
        refreshToken: '[REDACTED]'
      });

      const customToken = token as unknown as CustomToken;
      const newSession = {
        ...session,
        accessToken: customToken.accessToken,
        user: {
          email: customToken.email,
        }
      } as CustomSession;

      console.log('Returning new session:', {
        ...newSession,
        accessToken: '[REDACTED]'
      });
      return newSession;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}; 