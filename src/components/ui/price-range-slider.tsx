"use client"

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PriceRangeSliderProps {
  minValue: number;
  maxValue: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  onChange: (values: [number, number]) => void;
  formatPrefix?: string;
  formatSuffix?: string;
  showLabels?: boolean;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minValue,
  maxValue,
  min = 0,
  max = 1000,
  step = 10,
  disabled = false,
  className,
  onChange,
  formatPrefix = "$",
  formatSuffix = "",
  showLabels = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  
  // Ensure values are within bounds
  const safeMinValue = Math.max(min, Math.min(minValue, maxValue - step));
  const safeMaxValue = Math.min(max, Math.max(maxValue, minValue + step));
  
  // Calculate percentages for visual representation
  const minPercent = ((safeMinValue - min) / (max - min)) * 100;
  const maxPercent = ((safeMaxValue - min) / (max - min)) * 100;
  
  // Handle minimum thumb change
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinVal = Math.min(Number(e.target.value), safeMaxValue - step);
    onChange([newMinVal, safeMaxValue]);
  };
  
  // Handle maximum thumb change
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxVal = Math.max(Number(e.target.value), safeMinValue + step);
    onChange([safeMinValue, newMaxVal]);
  };

  // Update the range track visually
  useEffect(() => {
    if (rangeRef.current) {
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minPercent, maxPercent]);

  return (
    <div className="w-full space-y-2">
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span>{formatPrefix}{safeMinValue}{formatSuffix}</span>
          <span>{formatPrefix}{safeMaxValue}{formatSuffix}</span>
        </div>
      )}
      
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
        
        {/* Range slider with two thumbs */}
        <div className="absolute w-full" style={{ height: '20px' }}>
          {/* Minimum thumb input */}
          <input
            type="range"
            value={safeMinValue}
            min={min}
            max={max}
            step={step}
            onChange={handleMinChange}
            disabled={disabled}
            className="absolute w-full appearance-none bg-transparent price-slider-thumb-min"
            style={{ 
              zIndex: safeMinValue > (max - min) / 2 + min ? 5 : 3,
              height: '20px'
            }}
          />
          
          {/* Maximum thumb input */}
          <input
            type="range"
            value={safeMaxValue}
            min={min}
            max={max}
            step={step}
            onChange={handleMaxChange}
            disabled={disabled}
            className="absolute w-full appearance-none bg-transparent price-slider-thumb-max"
            style={{ 
              zIndex: safeMaxValue < (max - min) / 2 + min ? 5 : 4,
              height: '20px'
            }}
          />
        </div>
        
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
            z-index: 10; /* Ensure thumb is always on top */
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
            z-index: 10; /* Ensure thumb is always on top */
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

          /* Custom track appearance for Chrome and Safari */
          input[type="range"]::-webkit-slider-runnable-track {
            height: 1.5px;
            background: transparent;
            border-radius: 0;
          }

          /* Custom track appearance for Firefox */
          input[type="range"]::-moz-range-track {
            height: 1.5px;
            background: transparent;
            border-radius: 0;
          }

          /* Fix for Firefox to ensure thumb is visible */
          input[type="range"]::-moz-range-thumb {
            visibility: visible !important;
          }

          /* Fix for Webkit browsers to ensure thumb is visible */
          input[type="range"]::-webkit-slider-thumb {
            visibility: visible !important;
          }
        `}</style>
      </div>
    </div>
  );
};

PriceRangeSlider.displayName = "PriceRangeSlider";

export { PriceRangeSlider }; 