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

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (e.g. USD, EUR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date string or timestamp into a user-friendly format
 * @param dateString - The date string or timestamp to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string | number | Date): string {
  const date = new Date(dateString);
  
  // Return formatted date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Get a relative time string (e.g. "2 hours ago")
 * @param dateString - The date string or timestamp
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string | number | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (secondsAgo < 60) {
    return 'just now';
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) {
    return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  }
  
  return formatDate(date);
} 