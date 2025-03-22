"use client"

import * as React from "react"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  className,
}: TooltipProps) {
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