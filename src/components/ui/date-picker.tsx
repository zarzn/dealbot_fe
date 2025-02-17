"use client"

import * as React from "react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface DatePickerProps {
  selected?: Date | null
  onSelect?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  placeholderText?: string
  className?: string
  error?: string
}

export function DatePicker({
  selected,
  onSelect,
  minDate,
  maxDate,
  placeholderText = "Pick a date",
  className,
  error,
}: DatePickerProps) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <ReactDatePicker
          selected={selected}
          onChange={onSelect}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText={placeholderText}
          className={cn(
            "flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500",
            className
          )}
          customInput={
            <div className="relative w-full">
              <input
                className={cn(
                  "flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  error && "border-red-500"
                )}
              />
              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            </div>
          }
          dateFormat="MMMM d, yyyy"
          showPopperArrow={false}
          popperClassName="date-picker-popper"
          popperPlacement="bottom-start"
          calendarClassName="bg-gray-900/90 border border-white/10 rounded-md shadow-lg p-2"
          dayClassName={(date) =>
            cn(
              "rounded-md hover:bg-white/10",
              date.toDateString() === selected?.toDateString() && "bg-purple text-white"
            )
          }
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 