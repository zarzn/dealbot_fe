"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "avatar" | "title" | "text"
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const variants = {
    default: "h-4 w-full",
    card: "h-[200px] w-full rounded-xl",
    avatar: "h-10 w-10 rounded-full",
    title: "h-8 w-[200px]",
    text: "h-4 w-[300px]"
  }

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1
      }}
      className={cn(
        "animate-pulse rounded-md bg-white/5",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton } 