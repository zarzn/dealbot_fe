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