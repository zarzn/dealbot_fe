"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  TagIcon, 
  Wallet, 
  Bell, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/page-transition';
import { UserInfo } from '@/components/Dashboard/UserInfo';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Deals', href: '/dashboard/deals', icon: TagIcon },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
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
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!session) {
    return null; // Protected by middleware, but just in case
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className="fixed inset-y-0 left-0 w-72 bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm border-r border-white/10">
          <div className="flex items-center justify-between mb-8 mt-[100px]">
            <div className="text-xl font-semibold text-white/80">Dashboard</div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/5 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info - Mobile */}
          <UserInfo session={session} isMobile />
          
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

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/50 px-6 py-4 backdrop-blur-sm border-r border-white/10">
          <div className="flex h-16 shrink-0 items-center mt-[100px]">
            <div className="text-xl font-semibold text-white/80">Dashboard</div>
          </div>

          {/* User Info - Desktop */}
          <UserInfo session={session} />

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
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
                    />
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

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
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-[100px]">
          <Suspense fallback={<DashboardSkeleton />}>
            <PageTransition>
              {children}
            </PageTransition>
          </Suspense>
        </main>
      </div>
    </div>
  );
} 