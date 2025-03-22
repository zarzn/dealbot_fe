import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate discount percentage between original and current price
 * @param original Original price
 * @param current Current price
 * @returns Discount percentage rounded to nearest integer
 */
export function calculateDiscount(original: number | undefined, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Extract a standardized rating value from various formats
 * @param rating Rating value which could be in different formats
 * @returns Standardized rating on a 0-5 scale
 */
export function extractRating(rating: any): number {
  if (!rating) return 0;
  
  // If it's already a number, normalize it
  if (typeof rating === 'number') {
    // Check if it's on a 0-100 scale
    if (rating > 5) {
      return Math.min(5, rating / 20); // Convert 0-100 to 0-5
    }
    return Math.min(5, rating); // Ensure it's max 5
  }
  
  // If it's a string, try to parse it
  if (typeof rating === 'string') {
    // Try to extract a number from the string
    const match = rating.match(/(\d+(\.\d+)?)/);
    if (match) {
      const value = parseFloat(match[0]);
      
      // Check if it's percentage
      if (rating.includes('%')) {
        return value / 20; // Convert percentage to 0-5 scale
      }
      
      // Check if it's on a different scale (assuming 10 is max if > 5)
      if (value > 5) {
        return value / 2; // Convert 0-10 to 0-5
      }
      
      return value;
    }
  }
  
  return 0; // Default fallback
} 