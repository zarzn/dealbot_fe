'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';

export const metadata = {
  title: 'Verify Email | AI Deals System',
  description: 'Verifying your email address',
};

interface VerifyEmailPageProps {
  params: {
    token: string;
  };
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(params.token);
        toast.success('Email verified successfully! You can now sign in.');
        router.push('/auth/signin');
      } catch (error: any) {
        console.error('Email verification error:', error);
        toast.error(error.response?.data?.detail || 'Invalid or expired verification link');
        router.push('/auth/signin');
      }
    };

    verifyEmail();
  }, [params.token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-sm border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
            Verifying Email
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    </div>
  );
} 