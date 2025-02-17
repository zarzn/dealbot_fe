"use client";
import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth';
import SocialSignup from '../SocialSignup';
import SwitchOptions from "../SwitchOptions";
import MagicLink from "../MagicLink";
import { Loader } from "@/components/ui/loader";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function SignUp() {
  const [isPassword, setIsPassword] = useState(true);
  const router = useRouter();
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await authService.register(data);
      setVerificationEmailSent(true);
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    }
  };

  if (verificationEmailSent) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center"
        >
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
        <p className="text-white/70 mb-4">
          We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
        </p>
        <p className="text-sm text-white/50">
          Didn&apos;t receive the email?{' '}
          <button
            onClick={() => setVerificationEmailSent(false)}
            className="text-purple hover:underline focus:outline-none"
          >
            Try again
          </button>
        </p>
      </motion.div>
    );
  }

  return (
    <section className="pb-17.5 pt-17.5 lg:pb-22.5 xl:pb-27.5">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="wow fadeInUp rounded-3xl bg-white/[0.05] backdrop-blur-lg shadow-2xl">
          <div className="flex">
            <div className="hidden w-full lg:block lg:w-1/2">
              <div className="relative py-20 pl-17.5 pr-22">
                <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>

                <h2 className="mb-10 max-w-[350px] text-4xl font-bold text-white leading-tight">
                  Join the AI Deals Revolution
                </h2>
                <p className="mb-10 max-w-[350px] text-lg text-white/70">
                  Create your account to start discovering personalized deals powered by AI.
                </p>
                <div className="relative aspect-[61/50] w-full max-w-[427px]">
                  <Image src="/images/signin/sigin.svg" alt="signup" fill className="object-contain" />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="py-8 pl-8 pr-8 sm:py-20 sm:pl-21 sm:pr-20">
                <div>
                  <h3 className="mb-5 text-2xl font-bold text-white">Create Account</h3>
                  <p className="mb-7.5 text-white/70">Sign up with your email or social accounts</p>

                  <SwitchOptions
                    isPassword={isPassword}
                    setIsPassword={setIsPassword}
                  />

                  {!isPassword ? (
                    <MagicLink />
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/90">Full Name</label>
                        <Input
                          {...register('name')}
                          type="text"
                          placeholder="John Doe"
                          error={errors.name?.message}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/90">Email Address</label>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="name@company.com"
                          error={errors.email?.message}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/90">Password</label>
                        <Input
                          {...register('password')}
                          type="password"
                          placeholder="••••••••"
                          error={errors.password?.message}
                        />
                        <p className="text-xs text-white/50">
                          Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/90">Referral Code (Optional)</label>
                        <Input
                          {...register('referralCode')}
                          type="text"
                          placeholder="Enter referral code"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="terms"
                            checked={watch('acceptTerms')}
                            onCheckedChange={(checked) => setValue('acceptTerms', checked === true)}
                          />
                          <label htmlFor="terms" className="text-sm text-white/70">
                            I agree to the{' '}
                            <Link href="/terms" className="text-purple hover:underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-purple hover:underline">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>
                        {errors.acceptTerms && (
                          <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="w-4 h-4 mr-2" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  )}

                  <div className="relative my-7.5 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.12]"></div>
                    </div>
                    <div className="relative z-10 bg-[#0F172A] px-4">
                      <span className="text-sm font-medium text-white/70">or continue with social</span>
                    </div>
                  </div>

                  <SocialSignup mode="signup" />

                  <p className="mt-7 text-center font-medium text-white">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-purple hover:underline">
                      Sign in Here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
