"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Custom Progress component that doesn't rely on @radix-ui/react-progress
// This avoids the template literal syntax error in production builds
const CustomProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value = 0, ...props }, ref) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value || 0))
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  )
})

CustomProgress.displayName = "CustomProgress"

export { CustomProgress as Progress } 