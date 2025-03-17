"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { Button } from "./button"

// Simplified date picker that doesn't rely on react-datepicker
interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  placeholderText?: string
}

export function DatePicker({
  selected,
  onSelect,
  minDate,
  maxDate,
  placeholderText = "Select date...",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const dateInputRef = React.useRef<HTMLInputElement>(null)

  // Format date as YYYY-MM-DD for the input
  React.useEffect(() => {
    if (selected) {
      const year = selected.getFullYear()
      const month = String(selected.getMonth() + 1).padStart(2, '0')
      const day = String(selected.getDate()).padStart(2, '0')
      setInputValue(`${year}-${month}-${day}`)
    } else {
      setInputValue('')
    }
  }, [selected])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    
    try {
      // Try to parse the date
      const dateValue = new Date(e.target.value)
      if (!isNaN(dateValue.getTime())) {
        // Check if date is within min/max constraints
        if (minDate && dateValue < minDate) return
        if (maxDate && dateValue > maxDate) return
        
        onSelect?.(dateValue)
      }
    } catch (err) {
      // Invalid date, do nothing
    }
  }

  return (
    <div className="relative">
      <div className="flex">
        <input
          ref={dateInputRef}
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholderText}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          type="button"
          variant="outline"
          className="ml-2"
          onClick={() => {
            dateInputRef.current?.showPicker()
          }}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 