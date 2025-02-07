import { useState, useCallback } from 'react';
import { apiRequest } from '@/services/api/client';
import { AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  execute: (config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  defaultConfig?: AxiosRequestConfig,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const execute = useCallback(
    async (config?: AxiosRequestConfig): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const mergedConfig = {
          ...defaultConfig,
          ...config,
        };

        const response = await apiRequest<T>(mergedConfig);
        const responseData = response.data as T;
        setData(responseData);

        if (options.onSuccess) {
          options.onSuccess(responseData);
        }

        if (options.showSuccessToast && options.successMessage) {
          toast.success(options.successMessage);
        }

        return responseData;
      } catch (err: any) {
        setError(err);

        if (options.onError) {
          options.onError(err);
        }

        if (options.showErrorToast) {
          toast.error(err.message || 'An error occurred');
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [defaultConfig, options]
  );

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Example usage:
/*
const { data, loading, error, execute } = useApi<User>({
  url: API_ENDPOINTS.USER_PROFILE,
  method: 'GET',
}, {
  showErrorToast: true,
  onSuccess: (data) => {
    console.log('User data:', data);
  }
});
*/ 