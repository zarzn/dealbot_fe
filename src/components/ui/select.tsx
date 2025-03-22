"use client"

import * as React from "react"
import { FiChevronDown } from "react-icons/fi"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, value, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(event.target.value)
      }
    }

    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            className
          )}
          ref={ref}
          onChange={handleChange}
          value={value}
          {...props}
        >
          {children}
        </select>
        <FiChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
      </div>
    )
  }
)

Select.displayName = "Select"

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        className={cn("relative flex cursor-default select-none py-1.5 pl-8 pr-2", className)}
        ref={ref}
        {...props}
      >
        {children}
      </option>
    )
  }
)

SelectItem.displayName = "SelectItem"

export { Select, SelectItem } 