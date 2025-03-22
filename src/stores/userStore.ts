import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  tokenBalance: number;
  isSubscribed: boolean;
  plan?: string;
  role: string;
  preferences?: Record<string, any>;
  hasUsedFreeAnalysis?: boolean;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  setTokenBalance: (balance: number) => void;
  decrementTokens: (amount: number) => void;
  incrementTokens: (amount: number) => void;
  setHasUsedFreeAnalysis: (value: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),
      
      updateUser: (userData) => set((state) => ({ 
        user: state.user ? { ...state.user, ...userData } : null 
      })),
      
      setTokenBalance: (balance) => set((state) => ({
        user: state.user ? { ...state.user, tokenBalance: balance } : null
      })),
      
      decrementTokens: (amount) => set((state) => ({
        user: state.user 
          ? { 
              ...state.user, 
              tokenBalance: Math.max(0, (state.user.tokenBalance || 0) - amount) 
            } 
          : null
      })),
      
      incrementTokens: (amount) => set((state) => ({
        user: state.user 
          ? { 
              ...state.user, 
              tokenBalance: (state.user.tokenBalance || 0) + amount 
            } 
          : null
      })),
      
      setHasUsedFreeAnalysis: (value) => set((state) => ({
        user: state.user 
          ? { 
              ...state.user, 
              hasUsedFreeAnalysis: value 
            } 
          : null
      })),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Hook for checking first analysis promo status
export const useFirstAnalysisPromo = () => {
  const user = useUserStore((state) => state.user);
  const setHasUsedFreeAnalysis = useUserStore((state) => state.setHasUsedFreeAnalysis);
  
  const isEligibleForFreeAnalysis = () => {
    return !user?.hasUsedFreeAnalysis;
  };
  
  const markFreeAnalysisUsed = () => {
    setHasUsedFreeAnalysis(true);
    // You could also call an API here to persist this on the server
  };
  
  return {
    isEligibleForFreeAnalysis,
    markFreeAnalysisUsed
  };
}; 