"use client"

import { motion } from "framer-motion"
import { Session } from "next-auth"

interface UserInfoProps {
  session: Session | null
  isMobile?: boolean
}

export function UserInfo({ session, isMobile }: UserInfoProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className="mb-6 pb-6 border-b border-white/10"
    >
      <motion.div 
        className="flex items-center gap-3 p-3 -mx-3 rounded-lg transition-colors hover:bg-white/[0.02]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div 
          className="h-10 w-10 rounded-full bg-purple/20 text-purple flex items-center justify-center text-sm font-medium overflow-hidden"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {session?.user?.email?.[0].toUpperCase()}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="font-medium text-sm"
            whileHover={{ color: "#8b5cf6" }}
            transition={{ duration: 0.2 }}
          >
            {session?.user?.email}
          </motion.div>
          <motion.div 
            className="text-xs text-white/50"
            whileHover={{ color: "rgba(255,255,255,0.7)" }}
            transition={{ duration: 0.2 }}
          >
            Premium Member
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 