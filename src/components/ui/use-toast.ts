import { toast as hotToast } from 'react-hot-toast';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  const toastFn = variant === 'destructive' ? hotToast.error : 
                  variant === 'success' ? hotToast.success : 
                  hotToast;

  toastFn(
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{title}</span>
      {description && <span className="text-sm text-gray-500">{description}</span>}
    </div>
  );
}; 