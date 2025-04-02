"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { User } from '@/types/api';
import { FORCE_LOGOUT_EVENT } from '@/lib/api-client';
import { userService, UserProfile } from '@/services/users';

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

// Helper function to transform UserProfile to User
const transformProfileToUser = (profile: UserProfile): User => {
  return {
    id: profile.id,
    email: profile.email,
    token_balance: profile.token_balance,
    referral_code: '', // Set default or fetch from API if needed
    is_active: true, // Assume active since they're logged in
    created_at: profile.created_at,
    updated_at: profile.created_at, // Use created_at as fallback
    // Add any other required fields from User type with sensible defaults
  };
};

// Hook for accessing the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize user state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for a valid token
        const token = authService.getStoredToken();
        
        if (token) {
          // Get user profile from the API
          // This would need to be implemented in your user service
          const userProfile = JSON.parse(localStorage.getItem('user_data') || 'null');
          
          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear potentially invalid data
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Listen for force logout events
    const handleForceLogout = () => {
      console.log('Force logout event received');
      setUser(null);
      authService.clearTokens();
    };
    
    window.addEventListener(FORCE_LOGOUT_EVENT, handleForceLogout);
    
    return () => {
      window.removeEventListener(FORCE_LOGOUT_EVENT, handleForceLogout);
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Call the login function from our auth service
      await authService.login({ email, password });
      
      // After successful login, fetch the user profile
      try {
        const userProfile = await userService.getProfile();
        // Transform UserProfile to User type
        const userData = transformProfileToUser(userProfile);
        setUser(userData);
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(userData));
      } catch (profileError) {
        console.error('Failed to fetch user profile after login:', profileError);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state
      setUser(null);
      throw error;
    }
  };
  
  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update local storage
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
