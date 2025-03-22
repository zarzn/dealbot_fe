"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string;
  /**
   * Whether to show the shimmer animation effect
   * @default true
   */
  shimmer?: boolean;
}

/**
 * Skeleton component for representing loading state
 * Use this component as a placeholder while content is loading
 */
export function Skeleton({
  className,
  shimmer = true,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-5 w-full rounded-md bg-gray-200 dark:bg-gray-700",
        shimmer && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonText component for loading text content
 * Use this to create text line placeholders
 */
export function SkeletonText({
  lines = 1,
  lastLineWidth = "100%",
  className,
  shimmer = true,
}: {
  lines?: number;
  lastLineWidth?: string | number;
  className?: string;
  shimmer?: boolean;
}) {
  const linesArray = Array.from({ length: lines });
  
  return (
    <div className={cn("space-y-2", className)}>
      {linesArray.map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            index === lines - 1 && typeof lastLineWidth === 'string' 
              ? { width: lastLineWidth }
              : index === lines - 1 
                ? { width: `${lastLineWidth}%` }
                : undefined
          )}
          shimmer={shimmer}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard component for loading card content
 * Use this to create a card placeholder
 */
export function SkeletonCard({
  className,
  shimmer = true,
}: SkeletonProps) {
  return (
    <div 
      className={cn(
        "rounded-md border border-gray-200 p-4 shadow-sm dark:border-gray-700",
        className
      )}
    >
      <Skeleton 
        className="h-20 mb-4" 
        shimmer={shimmer} 
      />
      <SkeletonText 
        lines={3} 
        lastLineWidth={70} 
        shimmer={shimmer} 
      />
    </div>
  );
}

/**
 * SkeletonAvatar component for loading avatar content
 * Use this to create circular avatar placeholders
 */
export function SkeletonAvatar({
  size = "md",
  shimmer = true,
  className,
}: SkeletonProps & {
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };
  
  return (
    <Skeleton
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className
      )}
      shimmer={shimmer}
    />
  );
} 