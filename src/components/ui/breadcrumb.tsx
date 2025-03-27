import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: React.ReactNode;
}

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrent?: boolean;
}

interface BreadcrumbLinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4 opacity-50" />, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      />
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrent, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm",
          isCurrent && "text-foreground font-medium pointer-events-none",
          className
        )}
        aria-current={isCurrent ? "page" : undefined}
        {...props}
      />
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbLink = ({ children, href, className }: BreadcrumbLinkProps) => {
  if (!href) {
    return (
      <span className={cn("text-foreground/60 font-medium", className)}>
        {children}
      </span>
    );
  }
  
  return (
    <>
      <Link
        href={href}
        className={cn(
          "text-foreground/60 hover:text-foreground/90 transition-colors",
          className
        )}
      >
        {children}
      </Link>
      <BreadcrumbSeparator />
    </>
  );
};
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbSeparator = () => {
  return <ChevronRight className="h-4 w-4 opacity-50" />;
};
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"; 