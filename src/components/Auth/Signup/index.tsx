"use client";
import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';
import SocialSignup from '../SocialSignup/index';
import SwitchOptions from "../SwitchOptions";
import MagicLink from "../MagicLink";
import Loader from "@/components/Common/Loader";

const SignUp: React.FC = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPassword, setIsPassword] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!data.email || !data.password || !data.name) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({ 
        email: data.email, 
        password: data.password, 
        name: data.name 
      });
      toast.success('Successfully registered! You can now sign in.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    } finally {
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
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white/90">Full Name</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 10C12.7625 10 15 7.7625 15 5C15 2.2375 12.7625 0 10 0C7.2375 0 5 2.2375 5 5C5 7.7625 7.2375 10 10 10ZM10 1.5C11.9375 1.5 13.5 3.0625 13.5 5C13.5 6.9375 11.9375 8.5 10 8.5C8.0625 8.5 6.5 6.9375 6.5 5C6.5 3.0625 8.0625 1.5 10 1.5Z" fill="#94A3B8"/>
                                <path d="M10 11.25C5.5 11.25 1.875 14.875 1.875 19.375C1.875 19.7188 2.15625 20 2.5 20C2.84375 20 3.125 19.7188 3.125 19.375C3.125 15.5625 6.1875 12.5 10 12.5C13.8125 12.5 16.875 15.5625 16.875 19.375C16.875 19.7188 17.1562 20 17.5 20C17.8438 20 18.125 19.7188 18.125 19.375C18.125 14.875 14.5 11.25 10 11.25Z" fill="#94A3B8"/>
                              </svg>
                            </span>
                            <input
                              type="text"
                              placeholder="John Doe"
                              value={data.name}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] py-4 pl-12 pr-4 font-medium text-white outline-none focus:border-purple focus-visible:shadow-none placeholder:text-white/50"
                            />
                          </div>
                        </div>

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
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  email: e.target.value.toLowerCase(),
                                })
                              }
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
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  password: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] py-4 pl-12 pr-4 font-medium text-white outline-none focus:border-purple focus-visible:shadow-none placeholder:text-white/50"
                            />
                          </div>
                          <p className="text-xs text-white/50">
                            Must be at least 8 characters long
                          </p>
                        </div>

                        <button
                          type="submit"
                          className="hero-button-gradient relative flex w-full items-center justify-center rounded-xl border-2 border-purple bg-gradient-to-r from-purple/80 to-purple px-7 py-4 font-medium text-white shadow-lg transition duration-300 ease-in-out hover:from-purple hover:to-purple/80 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="absolute left-4">
                                <Loader className="h-5 w-5" />
                              </span>
                              <span>Creating account...</span>
                            </>
                          ) : (
                            <span>Create Account</span>
                          )}
                        </button>
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
    </>
  );
};

export default SignUp;
