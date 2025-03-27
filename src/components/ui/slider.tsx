"use client"

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: number[] | readonly number[];
  defaultValue?: number[] | readonly number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (values: number[]) => void;
  range?: boolean; // Explicitly indicate if this is a range slider
}

const Slider: React.FC<SliderProps> = ({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled,
  range, // Range is now determined by value length if not explicitly set
  ...props
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  
  // Determine if it's a range slider by checking value/defaultValue length or explicit range prop
  const isRangeSlider = React.useMemo(() => {
    if (range !== undefined) return range;
    if (value && Array.isArray(value)) return value.length > 1;
    if (defaultValue && Array.isArray(defaultValue)) return defaultValue.length > 1;
    return false;
  }, [range, value, defaultValue]);
  
  // Handle initialization of values
  const initialValues = value || defaultValue || (isRangeSlider ? [min, max] : [min]);
  const [values, setValues] = React.useState<number[]>(
    Array.isArray(initialValues) 
      ? initialValues.map(v => Math.max(min, Math.min(max, v)))
      : [Math.max(min, Math.min(max, initialValues as unknown as number))]
  );
  
  // Ensure we have exactly two values for range slider
  React.useEffect(() => {
    if (isRangeSlider && values.length === 1) {
      setValues([values[0], max]);
    }
  }, [isRangeSlider, values, max, min]);
  
  // Update internal state when external value changes
  React.useEffect(() => {
    if (value) {
      const newValues = Array.isArray(value) 
        ? value.map(v => Math.max(min, Math.min(max, v)))
        : [Math.max(min, Math.min(max, value as unknown as number))];
      
      setValues(newValues);
    }
  }, [value, min, max]);
  
  // Calculate percentages for visual representation
  const minVal = values[0] || min;
  const maxVal = isRangeSlider ? (values[1] || max) : max;
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;
  
  // Handle single value change (for single-point slider)
  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValues([newValue]);
    
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };
  
  // Handle minimum thumb change (for range slider)
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinVal = Math.min(Number(e.target.value), maxVal - step);
    const newValues = [newMinVal, maxVal];
    
    setValues(newValues);
    
    if (onValueChange) {
      onValueChange(newValues);
    }
  };
  
  // Handle maximum thumb change (for range slider)
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxVal = Math.max(Number(e.target.value), minVal + step);
    const newValues = [minVal, newMaxVal];
    
    setValues(newValues);
    
    if (onValueChange) {
      onValueChange(newValues);
    }
  };

  // Update the range track visually
  useEffect(() => {
    if (rangeRef.current) {
      if (isRangeSlider) {
        // For range slider, set left and width
        rangeRef.current.style.left = `${minPercent}%`;
        rangeRef.current.style.width = `${maxPercent - minPercent}%`;
      } else {
        // For single point slider, set width from 0 to the value
        rangeRef.current.style.left = '0%';
        rangeRef.current.style.width = `${minPercent}%`;
      }
    }
  }, [minPercent, maxPercent, isRangeSlider]);

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      {/* Track and colored range */}
      <div 
        ref={trackRef}
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10"
      >
        <div
          ref={rangeRef}
          className="absolute h-full bg-purple"
        />
      </div>
      
      {/* Rendering based on whether it's a range slider or not */}
      {isRangeSlider ? (
        // Range slider with two thumbs
        <div className="absolute w-full" style={{ height: '20px' }}>
          {/* Minimum thumb input */}
          <input
            type="range"
            value={minVal}
            min={min}
            max={max}
            step={step}
            onChange={handleMinChange}
            disabled={disabled}
            className="absolute w-full appearance-none bg-transparent slider-thumb-min"
            style={{ 
              zIndex: 3,
              height: '20px',
              // Make only the left half of the track active for the min thumb
              clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
            }}
            {...props}
          />
          
          {/* Maximum thumb input */}
          <input
            type="range"
            value={maxVal}
            min={min}
            max={max}
            step={step}
            onChange={handleMaxChange}
            disabled={disabled}
            className="absolute w-full appearance-none bg-transparent slider-thumb-max"
            style={{ 
              zIndex: 4,
              height: '20px',
              // Make only the right half of the track active for the max thumb
              clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
            }}
            {...props}
          />
        </div>
      ) : (
        // Single point slider with one thumb
        <input
          type="range"
          value={minVal}
          min={min}
          max={max}
          step={step}
          onChange={handleSingleChange}
          disabled={disabled}
          className="absolute w-full h-5 appearance-none bg-transparent slider-thumb"
          style={{ zIndex: 3 }}
          {...props}
        />
      )}
      
      {/* Custom styling for thumbs */}
      <style jsx>{`
        /* Hide default browser styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        /* Remove default focus styles */
        input[type="range"]:focus {
          outline: none;
        }
        
        /* Custom thumb styling for Webkit (Chrome, Safari, etc.) */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: border-color 0.2s ease;
          position: relative;
        }
        
        /* Custom thumb styling for Firefox */
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: border-color 0.2s ease;
          position: relative;
        }
        
        /* Hover state */
        input[type="range"]:hover::-webkit-slider-thumb {
          border-color: rgb(139, 92, 246);
          background-color: #222222;
        }
        
        input[type="range"]:hover::-moz-range-thumb {
          border-color: rgb(139, 92, 246);
          background-color: #222222;
        }
        
        /* Disabled state */
        input[type="range"]:disabled::-webkit-slider-thumb {
          background-color: rgba(26, 26, 26, 0.5);
          border-color: rgba(255, 255, 255, 0.1);
          cursor: not-allowed;
        }
        
        input[type="range"]:disabled::-moz-range-thumb {
          background-color: rgba(26, 26, 26, 0.5);
          border-color: rgba(255, 255, 255, 0.1);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

Slider.displayName = "Slider";

export { Slider }; 