'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';

interface VerifyMagicLinkPageProps {
  params: {
    token: string;
  };
}

export default function VerifyMagicLinkPage({ params }: VerifyMagicLinkPageProps) {
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await authService.verifyMagicLink(params.token);
        authService.setTokens(response);
        toast.success('Successfully signed in!');
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Magic link verification error:', error);
        toast.error(error.response?.data?.detail || 'Invalid or expired magic link');
        router.push('/auth/signin');
      }
    };

    verifyToken();
  }, [params.token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-sm border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
            Verifying Magic Link
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark">
            Please wait while we verify your magic link...
          </p>
        </div>
      </div>
    </div>
  );
} 