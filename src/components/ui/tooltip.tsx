"use client"

import * as React from "react"
import { ReactNode } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

// Export the Radix UI Tooltip components
const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Re-export these components
export {
  TooltipProvider,
  TooltipRoot as Tooltip,
  TooltipTrigger,
  TooltipContent
}

// Keep the custom tooltip function with a different name
interface CustomTooltipProps {
  content: ReactNode
  children: ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
}

export function CustomTooltip({
  content,
  children,
  side = "top",
  align = "center",
  className,
}: CustomTooltipProps) {
  const [show, setShow] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const childRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect()
      let x = rect.left + rect.width / 2
      let y = rect.top
      
      if (side === "bottom") {
        y = rect.bottom
      } else if (side === "left") {
        x = rect.left
        y = rect.top + rect.height / 2
      } else if (side === "right") {
        x = rect.right
        y = rect.top + rect.height / 2
      }
      
      setPosition({ x, y })
      setShow(true)
    }
  }

  const handleMouseLeave = () => {
    setShow(false)
  }

  React.useEffect(() => {
    const handleScroll = () => {
      if (show) setShow(false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [show])

  return (
    <div className="relative inline-block">
      <div
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {show && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs bg-slate-900 text-white rounded shadow",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
            transform: side === "top" 
              ? "translate(-50%, -100%)" 
              : side === "bottom" 
              ? "translate(-50%, 8px)" 
              : side === "left" 
              ? "translate(-100%, -50%)" 
              : "translate(8px, -50%)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
} 