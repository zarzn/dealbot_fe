"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  TagIcon, 
  Wallet, 
  Bell, 
  Settings, 
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/page-transition';
import UserInfo from '@/components/Dashboard/UserInfo';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';
import ClientLiveNotifications from '@/components/Notifications/ClientLiveNotifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Deals', href: '/dashboard/deals', icon: TagIcon },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Chat', href: '/websocket-chat', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const NavItem = ({ href, icon: Icon, name, isActive, onClick }: {
  href: string;
  icon: any;
  name: string;
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
        isActive 
          ? "text-white" 
          : "text-white/60 hover:text-white"
      )}
    >
      <motion.div
        className="absolute inset-0 rounded-md bg-white/10"
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.95,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="relative z-10 flex items-center gap-3"
        whileHover={{ x: 4 }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      >
        <Icon className="w-4 h-4" />
        <span>{name}</span>
      </motion.div>
    </Link>
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status: authStatus } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check for localStorage tokens
  const [hasLocalTokens, setHasLocalTokens] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to check tokens in localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    setHasLocalTokens(!!accessToken);
    setIsLoading(false);
    
    console.log("Dashboard authentication status:", {
      nextAuthStatus: authStatus,
      hasSession: !!session, 
      hasLocalTokens: !!accessToken
    });
    
    // If no authentication found at all, redirect to login
    if (authStatus === 'unauthenticated' && !accessToken) {
      console.log("No authentication detected, redirecting to login");
      router.push('/auth/signin');
    }
    
    // Listen for forced logout events (e.g., from token refresh failures)
    const handleForceLogout = () => {
      console.log("Force logout event detected, redirecting to login");
      router.push('/auth/signin');
    };
    
    window.addEventListener('force-logout', handleForceLogout);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('force-logout', handleForceLogout);
    };
    
  }, [authStatus, session, router]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Allow access if either NextAuth session or localStorage token is present
  const isAuthenticated = authStatus === 'authenticated' || hasLocalTokens;
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    router.push('/auth/signin');
    return null;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Main sidebar for desktop */}
        <div 
          className={cn(
            "hidden md:flex flex-col w-64 transition-all duration-300 bg-black/20 border-r border-white/10 h-full fixed left-0 top-0 bottom-0 z-20 shadow-xl",
          )}
        >
          <div className="flex flex-col flex-1 p-4">
            {/* User Info */}
            <div className="mb-6 pb-6 border-b border-white/10 mt-[100px]">
              <UserInfo />
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: navigation.indexOf(item) * 0.1,
                    }}
                  >
                    <NavItem
                      href={item.href}
                      icon={item.icon}
                      name={item.name}
                      isActive={isActive}
                      onClick={() => setSidebarOpen(false)}
                    />
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile menu content */}
        <motion.div 
          className={cn(
            "fixed inset-0 z-30 bg-background pt-16",
            sidebarOpen ? "block" : "hidden"
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          <div className="p-4">
            {/* Mobile User Info */}
            <div className="mb-6 pb-6 border-b border-white/10 mt-[100px]">
              <UserInfo isMobile />
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: navigation.indexOf(item) * 0.1,
                    }}
                  >
                    <NavItem
                      href={item.href}
                      icon={item.icon}
                      name={item.name}
                      isActive={isActive}
                      onClick={() => setSidebarOpen(false)}
                    />
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center justify-between gap-x-6 bg-gray-900/50 px-4 py-4 shadow-sm backdrop-blur-sm border-b border-white/10 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="text-xl font-semibold text-white/80">Dashboard</div>
          <div className="flex items-center">
            <ClientLiveNotifications />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:pl-72">
          {/* Desktop top bar with notifications */}
          <div className="sticky top-0 z-30 hidden lg:flex justify-end items-center px-8 py-4">
            <ClientLiveNotifications />
          </div>
          
          <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-[100px] lg:mt-[60px]">
            <Suspense fallback={<DashboardSkeleton />}>
              <PageTransition>
                {children}
              </PageTransition>
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
} 