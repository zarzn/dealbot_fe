"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth";
import SocialSignup from "../SocialSignup/index";
import MagicLink from "../MagicLink";
import SwitchOptions from "../SwitchOptions";
import Loader from "@/components/Common/Loader";
import { signIn } from "next-auth/react";
import { setAuthCookie } from "@/lib/authCookies";

const SignIn: React.FC = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isPassword, setIsPassword] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for session expired reason
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') {
      toast.error('Your session has expired. Please sign in again.', {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!data.email || !data.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // First use our backend API to get tokens
      const response = await authService.login({ email: data.email, password: data.password });
      
      console.log("Login successful, got tokens:", { 
        accessToken: response.access_token ? "present" : "missing",
        refreshToken: response.refresh_token ? "present" : "missing" 
      });
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // IMPORTANT: Set the auth cookie for middleware detection
      // This must happen before any redirect
      setAuthCookie();
      
      toast.success('Successfully signed in!');
      
      // Wait a bit longer to ensure cookies are set
      // This is critical to prevent the redirect to error page
      setTimeout(async () => {
        try {
          // Use redirect: false to prevent NextAuth from handling redirection
          // But still initialize the session for components that rely on it
          await signIn('credentials', {
            redirect: false,
            email: data.email,
            accessToken: response.access_token,
          });
          
          // Manually redirect to dashboard after ensuring auth is set up
          console.log("Auth completed, redirecting to dashboard");
          window.location.href = '/dashboard';
        } catch (nextAuthError) {
          console.error("NextAuth error (non-critical):", nextAuthError);
          // Still redirect to dashboard since we have our own token system
          console.log("Redirecting to dashboard despite NextAuth error");
          window.location.href = '/dashboard';
        }
      }, 800); // Longer delay to ensure cookies are properly set
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="pb-17.5 pt-17.5 lg:pb-22.5 xl:pb-27.5">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="wow fadeInUp rounded-3xl bg-white/[0.05] backdrop-blur-lg shadow-2xl">
            <div className="flex">
              <div className="hidden w-full lg:block lg:w-1/2">
                <div className="relative py-20 pl-17.5 pr-22">
                  <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>

                  <h2 className="mb-10 max-w-[350px] text-4xl font-bold text-white leading-tight">
                    Welcome Back to AI Deals
                  </h2>
                  <p className="mb-10 max-w-[350px] text-lg text-white/70">
                    Sign in to access your personalized deal recommendations and tracking.
                  </p>
                  <div className="relative aspect-[61/50] w-full max-w-[427px]">
                    <Image src="/images/signin/sigin.svg" alt="signin" fill className="object-contain" />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="py-8 pl-8 pr-8 sm:py-20 sm:pl-21 sm:pr-20">
                  <div>
                    <h3 className="mb-5 text-2xl font-bold text-white">Sign In</h3>
                    <p className="mb-7.5 text-white/70">Sign in with your email or social accounts</p>

                    <SwitchOptions
                      isPassword={isPassword}
                      setIsPassword={setIsPassword}
                    />

                    {!isPassword ? (
                      <MagicLink />
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white/90">Email Address</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 4.375C17.5 3.685 16.94 3.125 16.25 3.125H3.75C3.06 3.125 2.5 3.685 2.5 4.375V15.625C2.5 16.315 3.06 16.875 3.75 16.875H16.25C16.94 16.875 17.5 16.315 17.5 15.625V4.375ZM16.25 4.375L10 8.75L3.75 4.375H16.25ZM16.25 15.625H3.75V5.625L10 10L16.25 5.625V15.625Z" fill="#94A3B8"/>
                              </svg>
                            </span>
                            <input
                              type="email"
                              placeholder="name@company.com"
                              value={data.email}
                              onChange={(e) => setData({ ...data, email: e.target.value.toLowerCase() })}
                              className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] py-4 pl-12 pr-4 font-medium text-white outline-none focus:border-purple focus-visible:shadow-none placeholder:text-white/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white/90">Password</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.625 7.5H4.375C3.685 7.5 3.125 8.06 3.125 8.75V16.25C3.125 16.94 3.685 17.5 4.375 17.5H15.625C16.315 17.5 16.875 16.94 16.875 16.25V8.75C16.875 8.06 16.315 7.5 15.625 7.5Z" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6.25 7.5V4.375C6.25 3.505 6.595 2.67098 7.20901 2.05698C7.82301 1.44298 8.657 1.09798 9.527 1.09798C10.397 1.09798 11.231 1.44298 11.845 2.05698C12.459 2.67098 12.804 3.505 12.804 4.375" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={data.password}
                              onChange={(e) => setData({ ...data, password: e.target.value })}
                              className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] py-4 pl-12 pr-4 font-medium text-white outline-none focus:border-purple focus-visible:shadow-none placeholder:text-white/50"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex cursor-pointer select-none items-center text-sm font-medium text-white/90">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id="remember"
                                className="sr-only"
                                onChange={() => setRemember(!remember)}
                              />
                              <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded-md border ${
                                remember ? "border-purple bg-purple" : "border-white/[0.12]"
                              }`}>
                                <span className={`opacity-${remember ? "100" : "0"}`}>
                                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                    <path d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z" fill="#FFF" stroke="#FFF" strokeWidth="0.4"></path>
                                  </svg>
                                </span>
                              </div>
                            </div>
                            Remember me
                          </label>
                          <Link href="/auth/forgot-password" className="text-sm font-medium text-purple hover:underline">
                            Forgot Password?
                          </Link>
                        </div>

                        <button
                          type="submit"
                          className="hero-button-gradient relative flex w-full items-center justify-center rounded-xl px-7 py-4 font-medium text-white transition duration-300 ease-in-out hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="absolute left-4">
                                <Loader className="h-5 w-5" />
                              </span>
                              Signing in...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </button>
                      </form>
                    )}


                    <SocialSignup mode="signin" />

                    <p className="mt-7 text-center font-medium text-white">
                      Don&apos;t have an account?{" "}
                      <Link href="/auth/signup" className="text-purple hover:underline">
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignIn;
