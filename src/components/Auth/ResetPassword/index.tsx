"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loader from "@/components/Common/Loader";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth';
import Link from "next/link";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordProps {
  token: string;
}

const ResetPassword = ({ token }: ResetPasswordProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authService.verifyMagicLink(token);
        setIsVerifying(false);
      } catch (error: any) {
        console.error('Token verification error:', error);
        toast.error(error.response?.data?.detail || 'Invalid or expired reset link');
        router.push('/auth/forgot-password');
      }
    };

    verifyToken();
  }, [token, router]);

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      await authService.resetPassword(token, data.password);
      toast.success('Password has been reset successfully');
      router.push('/auth/signin');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <section className="pb-17.5 pt-17.5 lg:pb-22.5 xl:pb-27.5">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="wow fadeInUp rounded-3xl bg-white/[0.05]">
          <div className="flex">
            <div className="hidden w-full lg:block lg:w-1/2">
              <div className="relative py-20 pl-17.5 pr-22">
                <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>

                <h2 className="mb-10 max-w-[292px] text-heading-4 font-bold text-white">
                  Create New Password
                </h2>
                <div className="relative aspect-[61/50] w-full max-w-[427px]">
                  <Image src="/images/signin/sigin.svg" alt="reset password" fill />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="flex h-full flex-col justify-center py-8 pl-8 pr-8 sm:py-20 sm:pl-21 sm:pr-20">
                <div>
                  <h2 className="mb-9 text-2xl font-bold text-white">
                    Reset Password
                  </h2>
                  <p className="mb-7.5 text-base text-white/60">
                    Please create a new password for your account
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="relative mb-4">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2">
                        <svg
                          width="16"
                          height="12"
                          viewBox="0 0 16 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.9998 0.399994H1.9998C1.1498 0.399994 0.424805 1.09999 0.424805 1.97499V10.075C0.424805 10.925 1.1248 11.65 1.9998 11.65H13.9998C14.8498 11.65 15.5748 10.95 15.5748 10.075V1.94999C15.5748 1.09999 14.8498 0.399994 13.9998 0.399994ZM13.9998 1.52499C14.0248 1.52499 14.0498 1.52499 14.0748 1.52499L7.9998 5.42499L1.9248 1.52499C1.9498 1.52499 1.9748 1.52499 1.9998 1.52499H13.9998ZM13.9998 10.475H1.9998C1.7498 10.475 1.5498 10.275 1.5498 10.025V2.62499L7.3998 6.37499C7.5748 6.49999 7.7748 6.54999 7.9748 6.54999C8.1748 6.54999 8.3748 6.49999 8.5498 6.37499L14.3998 2.62499V10.05C14.4498 10.3 14.2498 10.475 13.9998 10.475Z"
                            fill="#918EA0"
                          />
                        </svg>
                      </span>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full rounded-lg border border-white/[0.12] bg-transparent py-3.5 pl-14.5 pr-4 font-medium text-white outline-none focus:border-purple focus-visible:shadow-none"
                        {...register('password')}
                      />
                      {errors.password && (
                        <span className="mt-1 text-sm text-red-500">{errors.password.message}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2">
                        <svg
                          width="16"
                          height="12"
                          viewBox="0 0 16 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.9998 0.399994H1.9998C1.1498 0.399994 0.424805 1.09999 0.424805 1.97499V10.075C0.424805 10.925 1.1248 11.65 1.9998 11.65H13.9998C14.8498 11.65 15.5748 10.95 15.5748 10.075V1.94999C15.5748 1.09999 14.8498 0.399994 13.9998 0.399994ZM13.9998 1.52499C14.0248 1.52499 14.0498 1.52499 14.0748 1.52499L7.9998 5.42499L1.9248 1.52499C1.9498 1.52499 1.9748 1.52499 1.9998 1.52499H13.9998ZM13.9998 10.475H1.9998C1.7498 10.475 1.5498 10.275 1.5498 10.025V2.62499L7.3998 6.37499C7.5748 6.49999 7.7748 6.54999 7.9748 6.54999C8.1748 6.54999 8.3748 6.49999 8.5498 6.37499L14.3998 2.62499V10.05C14.4498 10.3 14.2498 10.475 13.9998 10.475Z"
                            fill="#918EA0"
                          />
                        </svg>
                      </span>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        className="w-full rounded-lg border border-white/[0.12] bg-transparent py-3.5 pl-14.5 pr-4 font-medium text-white outline-none focus:border-purple focus-visible:shadow-none"
                        {...register('confirmPassword')}
                      />
                      {errors.confirmPassword && (
                        <span className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="hero-button-gradient flex w-full items-center justify-center rounded-lg px-7 py-3 font-medium text-white duration-300 ease-in hover:opacity-80"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          Resetting Password <Loader />
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>

                    <p className="mt-5 text-center font-medium text-white">
                      Remember your password?{" "}
                      <Link href="/auth/signin" className="text-purple">
                        Sign in Here
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
