import { toast } from 'sonner';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

interface ToastProps {
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
}

export const useToast = () => {
  const success = (title: string, description?: string) => {
    toast.success(description ? `${title}: ${description}` : title);
  };
  
  const error = (title: string, description?: string) => {
    toast.error(description ? `${title}: ${description}` : title);
  };
  
  const warning = (title: string, description?: string) => {
    toast(description ? `${title}: ${description}` : title, {
      icon: '⚠️',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    });
  };
  
  const info = (title: string, description?: string) => {
    toast(description ? `${title}: ${description}` : title, {
      icon: 'ℹ️',
      className: 'bg-blue-50 border-blue-200 text-blue-800',
    });
  };
  
  return {
    success,
    error,
    warning,
    info,
  };
};

// Ensure both default and named exports are available for backward compatibility
export default useToast; 