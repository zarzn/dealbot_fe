'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        toast.error('Verification token is missing');
        router.push('/auth/signin');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setIsSuccess(true);
        toast.success('Email verified successfully!');
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        toast.error(error.message || 'Failed to verify email');
        router.push('/auth/signin');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader size="lg" />
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2">Email Verified!</h2>
          <p className="text-muted-foreground mb-4">
            Your email has been successfully verified. Redirecting to signin...
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
} 