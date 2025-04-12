# Frontend Architecture Documentation

## Overview

The AI Agentic Deals System frontend is built using a modern React-based architecture with Next.js as the foundational framework. This document outlines the architectural design, component structure, state management approach, and integration patterns used throughout the frontend.

## Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with SSR, routing, and API capabilities | 14.x |
| React | UI library for component-based development | 18.x |
| TypeScript | Type-safe JavaScript superset | 5.x |
| Tailwind CSS | Utility-first CSS framework | 3.x |
| Zustand | Lightweight state management | 4.x |
| React Query | Data fetching, caching, and state management for async data | 5.x |
| Axios | HTTP client for API requests | 1.x |

## Architecture Principles

The frontend architecture follows these core principles:

1. **Component-Based Design**: Modular components with clear responsibilities
2. **Type Safety**: Comprehensive TypeScript types across the application
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Responsive Design**: Mobile-first approach for all user interfaces
5. **Performance Optimization**: Code splitting, lazy loading, and optimization
6. **Accessibility**: WCAG compliance throughout the application
7. **Testability**: Components designed for easy unit and integration testing

## Directory Structure

```
frontend/
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React components
│   │   ├── common/         # Shared components (buttons, inputs, etc.)
│   │   ├── deals/          # Deal-specific components
│   │   ├── layout/         # Layout components (headers, footers, etc.)
│   │   ├── goals/          # Goal-related components
│   │   ├── auth/           # Authentication components
│   │   └── token/          # Token system components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and functions
│   ├── providers/          # React context providers
│   ├── services/           # API services and data fetching
│   ├── stores/             # State management stores
│   ├── styles/             # Global styles and Tailwind configuration
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── middleware.ts       # Next.js middleware for auth, etc.
├── public/                 # Static assets
└── docs/                   # Frontend documentation
```

## Component Architecture

The component architecture follows a hierarchical structure with clear separation of concerns:

### Component Types

1. **Page Components**: Top-level components that represent complete pages
2. **Layout Components**: Structural components that define page layouts
3. **Feature Components**: Components specific to business features (deals, goals, etc.)
4. **Common Components**: Reusable UI components shared across features
5. **Composite Components**: Components that combine multiple smaller components

### Component Design Pattern

Components follow a standardized pattern:

```tsx
// DealCard.tsx
import { useState } from 'react';
import type { Deal } from '@/types/deals';
import { formatCurrency } from '@/utils/formatters';
import { useDealActions } from '@/hooks/useDealActions';
import { Card, Badge, Button } from '@/components/common';

interface DealCardProps {
  deal: Deal;
  isSaved?: boolean;
  onSave?: (dealId: string) => void;
  className?: string;
}

export const DealCard = ({
  deal,
  isSaved = false,
  onSave,
  className = '',
}: DealCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { saveDeal, shareLink } = useDealActions();

  const handleSave = () => {
    saveDeal(deal.id);
    if (onSave) onSave(deal.id);
  };

  return (
    <Card className={`deal-card ${className}`}>
      {/* Card content */}
    </Card>
  );
};
```

## State Management

The application uses a hybrid state management approach:

### Local Component State

- Used for UI state specific to a single component
- Implemented with React's `useState` and `useReducer` hooks
- Examples: form inputs, toggles, expanded/collapsed states

### Global Application State

- Implemented using Zustand for global state management
- Separate stores for different domains (user, deals, goals, tokens)
- Persistent state stored in localStorage where appropriate

Example Zustand store:

```typescript
// stores/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserPreferences } from '@/types/user';

interface UserState {
  user: User | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setPreferences: (preferences: UserPreferences) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: {
        theme: 'system',
        notifications: true,
        dealAlerts: true,
      },
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setPreferences: (preferences) => set({ preferences }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
```

### Server State

- Managed with React Query for all API-related data
- Provides caching, loading states, and error handling
- Optimistic updates for improved user experience

Example React Query usage:

```typescript
// hooks/useDeals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/dealsService';
import type { Deal, DealSearchParams } from '@/types/deals';

export const useDeals = (searchParams: DealSearchParams) => {
  return useQuery({
    queryKey: ['deals', searchParams],
    queryFn: () => dealsService.searchDeals(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSaveDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dealId: string) => dealsService.saveDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedDeals'] });
    },
  });
};
```

## Routing and Navigation

The application uses Next.js App Router for page routing:

### Route Structure

```
src/app/
├── layout.tsx              # Root layout
├── page.tsx                # Homepage
├── deals/
│   ├── layout.tsx          # Deals layout
│   ├── page.tsx            # All deals page
│   └── [id]/
│       └── page.tsx        # Single deal page
├── goals/
│   ├── layout.tsx          # Goals layout
│   ├── page.tsx            # Goals list page
│   └── [id]/
│       └── page.tsx        # Single goal page
├── auth/
│   ├── login/
│   │   └── page.tsx        # Login page
│   └── register/
│       └── page.tsx        # Registration page
└── profile/
    ├── layout.tsx          # Profile layout
    └── page.tsx            # User profile page
```

### Navigation

Navigation is implemented using Next.js's built-in `Link` component and the `useRouter` hook:

```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Navigation = () => {
  const router = useRouter();
  
  const handleLogout = () => {
    // Logout logic
    router.push('/auth/login');
  };
  
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/deals">Deals</Link>
      <Link href="/goals">Goals</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};
```

## Authentication Flow

Authentication is implemented using JWT tokens with secure storage and refresh mechanisms:

### Auth Process

1. **Login/Registration**: User provides credentials
2. **Token Acquisition**: Backend provides access and refresh tokens
3. **Token Storage**: Tokens stored in HTTP-only cookies
4. **Request Authentication**: Tokens attached to API requests
5. **Token Refresh**: Automatic refresh when access token expires
6. **Logout**: Tokens revoked and removed from storage

### Auth Guards

Protected routes use middleware and client-side guards:

```typescript
// middleware.ts (for route protection)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Protected paths that require authentication
  const protectedPaths = ['/profile', '/goals', '/deals/saved'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !authToken) {
    // Redirect to login if accessing protected route without auth
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/goals/:path*',
    '/deals/saved/:path*',
  ],
};
```

## API Integration

### API Client

A centralized API client handles all backend communication:

```typescript
// services/apiClient.ts
import axios from 'axios';
import { refreshToken } from './authService';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Response interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is due to expired token and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        await refreshToken();
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Pattern

Each API domain has a dedicated service:

```typescript
// services/dealsService.ts
import apiClient from './apiClient';
import type { Deal, DealSearchParams, DealDetails } from '@/types/deals';

export const dealsService = {
  async searchDeals(params: DealSearchParams): Promise<Deal[]> {
    const { data } = await apiClient.get('/api/deals', { params });
    return data.deals;
  },
  
  async getDealById(id: string): Promise<DealDetails> {
    const { data } = await apiClient.get(`/api/deals/${id}`);
    return data;
  },
  
  async saveDeal(id: string): Promise<void> {
    await apiClient.post(`/api/deals/${id}/save`);
  },
  
  async getSavedDeals(): Promise<Deal[]> {
    const { data } = await apiClient.get('/api/deals/saved');
    return data.deals;
  }
};
```

## Styling System

The application uses a combination of Tailwind CSS and custom components:

### Design System

A comprehensive design system includes:

1. **Color System**: Brand colors, semantic colors, and variants
2. **Typography**: Font families, sizes, weights, and line heights
3. **Spacing**: Consistent spacing scale
4. **Components**: Styled UI components with consistent behavior
5. **Animations**: Standard animations and transitions

### Tailwind Implementation

Tailwind is configured with custom theme extensions:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae3ff',
          // ... other shades
          600: '#0072c6',
          700: '#005ea3',
          800: '#004c82',
          900: '#003a61',
        },
        // ... other color definitions
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // ... other theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Component Library

Custom UI components are built on top of Tailwind:

```tsx
// components/common/Button.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    tertiary: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
```

## AI Integration

The frontend integrates with the AI components through specialized services and components:

### Conversation Interface

A chat-like interface for interacting with the AI:

```tsx
// components/ai/ConversationInterface.tsx
import { useState } from 'react';
import { useConversation } from '@/hooks/useConversation';
import { Button, TextField, ChatBubble } from '@/components/common';

export const ConversationInterface = () => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isLoading } = useConversation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.content}
            sender={msg.role}
            timestamp={msg.timestamp}
          />
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about deals..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            isLoading={isLoading}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
```

### AI Service Integration

Services for interacting with AI backend endpoints:

```typescript
// services/aiService.ts
import apiClient from './apiClient';
import type { 
  ConversationMessage, 
  DealAnalysisRequest, 
  DealAnalysisResult,
  GoalRecommendation
} from '@/types/ai';

export const aiService = {
  async sendMessage(conversationId: string | null, message: string): Promise<ConversationMessage[]> {
    const { data } = await apiClient.post('/api/conversation', {
      conversation_id: conversationId,
      message
    });
    return data.messages;
  },
  
  async analyzeDeal(request: DealAnalysisRequest): Promise<DealAnalysisResult> {
    const { data } = await apiClient.post('/api/ai/analyze-deal', request);
    return data;
  },
  
  async generateGoalRecommendations(userId: string): Promise<GoalRecommendation[]> {
    const { data } = await apiClient.get(`/api/ai/goal-recommendations?userId=${userId}`);
    return data.recommendations;
  }
};
```

## Token System Integration

Components and services for the token system:

### Token Balance Display

```tsx
// components/token/TokenBalance.tsx
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { Skeleton, Tooltip } from '@/components/common';
import { CoinIcon } from '@/components/icons';

interface TokenBalanceProps {
  showBuyButton?: boolean;
  className?: string;
}

export const TokenBalance = ({ 
  showBuyButton = false,
  className = ''
}: TokenBalanceProps) => {
  const { balance, isLoading, refetch } = useTokenBalance();
  
  if (isLoading) {
    return <Skeleton className="w-20 h-8" />;
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <Tooltip content="Your current token balance">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
          <CoinIcon className="text-yellow-500 mr-1.5" />
          <span className="font-medium">{balance}</span>
        </div>
      </Tooltip>
      
      {showBuyButton && (
        <button 
          className="ml-2 text-sm text-primary-600 hover:text-primary-700"
          onClick={() => window.location.href = '/tokens/buy'}
        >
          Buy more
        </button>
      )}
    </div>
  );
};
```

### Token Service

```typescript
// services/tokenService.ts
import apiClient from './apiClient';
import type { 
  TokenBalance, 
  TokenTransaction, 
  TokenPackage,
  TokenPurchaseRequest
} from '@/types/token';

export const tokenService = {
  async getBalance(): Promise<TokenBalance> {
    const { data } = await apiClient.get('/api/tokens/balance');
    return data;
  },
  
  async getTransactions(limit: number = 10): Promise<TokenTransaction[]> {
    const { data } = await apiClient.get(`/api/tokens/transactions?limit=${limit}`);
    return data.transactions;
  },
  
  async getPackages(): Promise<TokenPackage[]> {
    const { data } = await apiClient.get('/api/tokens/packages');
    return data.packages;
  },
  
  async purchaseTokens(request: TokenPurchaseRequest): Promise<{ transactionId: string }> {
    const { data } = await apiClient.post('/api/tokens/purchase', request);
    return data;
  },
  
  async redeemCode(code: string): Promise<{ amount: number }> {
    const { data } = await apiClient.post('/api/tokens/redeem', { code });
    return data;
  }
};
```

## Performance Optimization

The frontend implements several performance optimization techniques:

### Code Splitting

- Next.js automatic code splitting for pages
- Dynamic imports for large components

```typescript
// Lazy-loaded component example
import dynamic from 'next/dynamic';

const DealAnalysisChart = dynamic(
  () => import('@/components/deals/DealAnalysisChart'),
  { 
    loading: () => <p>Loading chart...</p>,
    ssr: false // Disable server-side rendering if component uses browser APIs
  }
);
```

### Image Optimization

- Next.js Image component for automatic optimization
- Responsive images with appropriate sizes

```tsx
import Image from 'next/image';

export const DealImage = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={400}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
      className="rounded-lg object-cover"
    />
  );
};
```

### Memoization

- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable function references

```tsx
// Memoized component example
import { memo, useMemo } from 'react';
import type { Deal } from '@/types/deals';

interface DealListProps {
  deals: Deal[];
  sortField: keyof Deal;
  sortDirection: 'asc' | 'desc';
}

export const DealList = memo(({ 
  deals, 
  sortField, 
  sortDirection 
}: DealListProps) => {
  // Memoize sorted deals to prevent unnecessary re-sorts
  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }, [deals, sortField, sortDirection]);
  
  return (
    <div className="deal-list">
      {sortedDeals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
});
```

## Testing Strategy

The frontend implements a comprehensive testing approach:

### Testing Levels

1. **Unit Tests**: Individual component and function testing
2. **Integration Tests**: Testing interactions between components
3. **E2E Tests**: End-to-end user flow testing

### Testing Stack

- **Jest**: Test runner and assertions
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **MSW**: API mocking

### Component Test Example

```tsx
// components/common/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });
  
  it('applies variant classes correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-gray-200');
    expect(button).not.toHaveClass('bg-primary-600');
  });
  
  it('shows loading state when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Accessibility

The frontend implements accessibility best practices:

### Accessibility Features

1. **Semantic HTML**: Proper use of HTML elements
2. **ARIA attributes**: Where necessary to enhance accessibility
3. **Keyboard navigation**: Full keyboard support
4. **Focus management**: Proper focus handling
5. **Color contrast**: WCAG AA compliant color choices
6. **Screen reader support**: Informative labels and descriptions

### Accessibility Hook Example

```typescript
// hooks/useA11y.ts
import { useRef, useEffect } from 'react';

interface UseA11yDialogOptions {
  onClose: () => void;
}

export function useA11yDialog({ onClose }: UseA11yDialogOptions) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Store the element that had focus before dialog opened
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Focus the first focusable element in the dialog
    const focusableElements = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements?.length) {
      (focusableElements[0] as HTMLElement).focus();
    }
    
    // Handle ESC key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when dialog closes
      previousFocusRef.current?.focus();
    };
  }, [onClose]);
  
  return dialogRef;
}
```

## Deployment Pipeline

### Build and Deployment Process

1. **Code Push**: Changes pushed to repository
2. **CI Checks**: Tests, linting, and type checking
3. **Build Process**: Next.js static optimization
4. **Deployment**: Deployment to AWS platform
5. **CDN Distribution**: Content distributed via CloudFront
6. **Monitoring**: Post-deployment monitoring

### Next.js Build Configuration

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.agentic-deals.com', 'cdn.partner-sites.com'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
  },
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

## Integration with Backend

### Backend Communication

The frontend communicates with the backend through:

1. **REST API**: Primary communication method
2. **WebSockets**: Real-time updates and notifications
3. **Server Actions**: Next.js server actions for form handling

### API Type Safety

TypeScript interfaces ensure type safety between frontend and backend:

```typescript
// types/api.ts
export interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// types/deals.ts
export interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  merchant: string;
  url: string;
  image_url: string;
  rating: number;
  review_count: number;
  availability: string;
  features: string[];
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

// Usage in service
async function searchDeals(params: DealSearchParams): Promise<APIResponse<Deal[]>> {
  const { data } = await apiClient.get<APIResponse<Deal[]>>('/api/deals', { params });
  return data;
}
```

## Future Enhancements

Planned enhancements for the frontend architecture:

1. **Micro-Frontend Architecture**: Exploring module federation for larger scale
2. **Server Components**: Further adoption of React Server Components
3. **Edge Functions**: Moving API functionality to edge for improved performance
4. **PWA Features**: Progressive Web App capabilities for offline access
5. **Streaming Responses**: Implementing streaming for AI-generated content
6. **Islands Architecture**: Component-level hydration for performance
7. **Advanced Analytics**: Enhanced user behavior tracking and analytics

## References

1. [Next.js Documentation](https://nextjs.org/docs)
2. [React Documentation](https://reactjs.org/docs/getting-started.html)
3. [TypeScript Documentation](https://www.typescriptlang.org/docs/)
4. [Tailwind CSS Documentation](https://tailwindcss.com/docs)
5. [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
6. [Performance Optimization Guide](https://web.dev/fast/)
7. [Backend API Documentation](../backend/docs/api/reference.md)
8. [AI System Documentation](../backend/docs/ai/processing_pipeline.md) 