"use client"

import * as React from "react"
// Instead of importing from @radix-ui/react-slider, create a simple slider component
// since the dependency might be missing

import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  className?: string;
  value?: number[];
  onValueChange?: (values: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    // Use the first value if we're given an array
    const displayValue = Array.isArray(value) ? value[0] : value;
    
    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div 
            className="absolute h-full bg-primary" 
            style={{ width: `${(displayValue || 0) / (Number(props.max) || 100) * 100}%` }}
          />
        </div>
        <input
          type="range"
          ref={ref}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
          value={displayValue}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider"

export { Slider } 