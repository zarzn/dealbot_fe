"use client";

import { useState, useEffect } from 'react';
import { useSafeSession } from '@/lib/use-safe-session';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  Tag as TagIcon, 
  Wallet, 
  Bell, 
  Settings, 
  Menu,
  X,
  Bookmark,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/page-transition';
import UserInfo from '@/components/Dashboard/UserInfo';
import NotificationCenter from '@/components/Notifications/NotificationCenter';
import { FORCE_LOGOUT_EVENT } from '@/lib/api-client';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';
import { toast } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Navigation items - match the backup file navigation
const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Deals', href: '/dashboard/deals', icon: TagIcon },
  { name: 'Tracked Deals', href: '/dashboard/tracked-deals', icon: Bookmark },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// NavItem component for sidebar - updated to match the backup styling
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

// Main Dashboard Layout component
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Use safe session hook instead of next-auth's useSession
  const session = useSafeSession();
  const { data, status } = session;
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check for valid tokens on mount
  useEffect(() => {
    if (!isClient) return;
    
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    // If no tokens but we're in authenticated state, redirect to login
    if (!accessToken && status !== 'loading') {
      router.push('/auth/signin');
    }
    
    // Set up event listener for forced logout
    const handleForceLogout = () => {
      console.log('Force logout event received in dashboard layout');
      // Clear tokens and reload to trigger auth redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Show a toast notification
      toast.error('Your session has expired. Please sign in again.', {
        duration: 5000, // Show for 5 seconds
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      router.push('/auth/signin');
    };
    
    window.addEventListener(FORCE_LOGOUT_EVENT, handleForceLogout);
    
    return () => {
      window.removeEventListener(FORCE_LOGOUT_EVENT, handleForceLogout);
    };
  }, [router, isClient, status]);
  
  // If component is not yet mounted on client, show a minimal loading state
  if (!isClient) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-[57px] border-b"></div>
        <div className="flex flex-1">
          <div className="w-[250px] border-r hidden lg:block"></div>
          <div className="flex-1"></div>
        </div>
      </div>
    );
  }
  
  // If still waiting for authentication or no valid tokens
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated and not loading, redirect to login
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }
  
  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Main sidebar for desktop */}
        <div 
          className={cn(
            "hidden md:flex flex-col w-45 transition-all duration-300 bg-black/20 border-r border-white/10 h-full fixed left-0 top-0 bottom-0 z-20 shadow-xl",
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
          {/* Mobile notification center removed to fix duplicate bell icon */}
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:pl-60">
          {/* Desktop top bar with notifications */}
          <div className="sticky top-0 z-30 hidden lg:flex justify-end items-center px-8 py-4">
            <NotificationCenter />
          </div>
          
          <main className="dashboard-content flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-[100px] lg:mt-[60px]">
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
