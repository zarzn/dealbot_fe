'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@/types/api';
import { toast } from 'react-hot-toast';

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
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [session, status]);

  const updateUser = (newUser: User) => {
    setUser(newUser);
    toast.success('Profile updated successfully');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    updateUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
} 