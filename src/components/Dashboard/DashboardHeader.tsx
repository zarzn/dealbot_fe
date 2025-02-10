import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';

const DashboardHeader = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white/[0.02] border-b border-white/10 mt-[100px]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - User info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-purple flex items-center justify-center">
              {session?.user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{session?.user?.email}</div>
              <div className="text-sm text-white/70">Premium Member</div>
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-white/70 hover:text-white transition"
              >
                Overview
              </Link>
              <Link 
                href="/goals" 
                className="text-white/70 hover:text-white transition"
              >
                Goals
              </Link>
              <Link 
                href="/deals" 
                className="text-white/70 hover:text-white transition"
              >
                Deals
              </Link>
              <Link 
                href="/wallet" 
                className="text-white/70 hover:text-white transition"
              >
                Wallet
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button 
                className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 