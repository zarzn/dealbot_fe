"use client"

import * as React from "react"
// Instead of importing from @radix-ui/react-slider, create a simple slider component
// since the dependency might be missing

import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-800">
        <div 
          className="absolute h-full bg-primary" 
          style={{ width: `${(Number(props.value) || 0) / (Number(props.max) || 100) * 100}%` }}
        />
      </div>
      <input
        type="range"
        ref={ref}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
        {...props}
      />
    </div>
  )
)

Slider.displayName = "Slider"

export { Slider } 