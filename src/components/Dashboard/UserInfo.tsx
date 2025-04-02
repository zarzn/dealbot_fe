"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSafeSession } from '@/lib/use-safe-session'
import { userService } from '@/services/users'
import { toast } from 'react-hot-toast'
import UserStatusBar from './UserStatusBar'
import { User, AlertCircle } from 'lucide-react'

interface UserInfoProps {
  isMobile?: boolean
}

const UserInfoSkeleton = () => (
  <div className="flex items-center gap-4">
    <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
      <div className="h-2 w-16 bg-white/10 rounded animate-pulse"></div>
    </div>
  </div>
)

const UserInfoError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center gap-4">
    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500/20 border border-red-500">
      <AlertCircle className="w-5 h-5 text-red-500" />
    </div>
    <div className="space-y-1">
      <p className="text-sm text-red-200">Error loading profile</p>
      <button 
        onClick={onRetry} 
        className="text-xs text-red-400 hover:text-red-300"
      >
        Retry
      </button>
    </div>
  </div>
)

export default function UserInfo({ isMobile = false }: UserInfoProps) {
  // Use safe session hook instead of next-auth's useSession
  const session = useSafeSession();
  const sessionStatus = session?.status || 'unauthenticated';
  const userData = session?.data?.user;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    email: string;
    displayName?: string;
  } | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const FETCH_COOLDOWN = 30000; // 30 seconds cooldown between fetches
  
  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const fetchUserData = useCallback(async (force = false) => {
    // Skip fetch if we're within cooldown period unless force=true or if not client-side
    if (!isClient) return;
    
    const now = Date.now();
    if (!force && now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('Skipping profile fetch due to cooldown');
      return;
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      const profile = await userService.getProfile(force)
      setUserProfile({
        email: profile.email,
        displayName: profile.name
      })
      
      // Update last fetch time
      setLastFetchTime(now);
    } catch (err) {
      console.error("Failed to fetch user profile:", err)
      setError("Could not load user data")
      
      // Fallback to session data if available
      if (userData?.email) {
        setUserProfile({
          email: userData.email
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [userData, lastFetchTime, isClient])
  
  // Fetch when session changes or component mounts (client-side only)
  useEffect(() => {
    if (isClient && sessionStatus === 'authenticated') {
      fetchUserData(false);
    }
  }, [sessionStatus, fetchUserData, isClient])
  
  // Get first letter of email for avatar
  const getInitial = (email: string) => {
    return email && email.length > 0 ? email[0].toUpperCase() : "U"
  }
  
  // Handle SSG - render nothing during static build
  if (!isClient) {
    return <UserInfoSkeleton />
  }
  
  if (isLoading && !userProfile) {
    return <UserInfoSkeleton />
  }
  
  if (error && !userProfile) {
    return <UserInfoError onRetry={() => fetchUserData(true)} />
  }
  
  const email = userProfile?.email || (userData?.email || "user@example.com")
  const displayName = userProfile?.displayName
  
  return (
    <Link href="/dashboard/settings">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 p-2 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-white/70">
          <User className="w-7 h-7" />
        </div>
        
        <div className="flex flex-col">
          <p className="text-sm font-medium">{displayName || email}</p>
          <UserStatusBar />
        </div>
        
        {!isMobile && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-1 text-white/40 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </Link>
  )
} 