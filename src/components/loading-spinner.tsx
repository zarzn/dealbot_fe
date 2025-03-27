import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  text = 'Loading...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Spinner size={size} className={className} />
      {text && <p className="mt-4 text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 