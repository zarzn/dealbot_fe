'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  updateUser: () => {},
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Use our custom auth context instead of next-auth session
  const { user, isLoading, isAuthenticated, updateUser: authUpdateUser } = useAuth();

  // Update user function with toast notification
  const updateUser = (newUser: User) => {
    authUpdateUser(newUser);
    toast.success('Profile updated successfully');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    updateUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
} 