import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 
        className="animate-spin text-purple" 
        size={size} 
      />
    </div>
  );
};

export default LoadingSpinner; 