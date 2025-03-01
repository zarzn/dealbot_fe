"use client";
import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const CheckEmail: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <section className="pb-17.5 pt-17.5 lg:pb-22.5 xl:pb-27.5">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="wow fadeInUp rounded-3xl bg-white/[0.05]">
            <div className="flex">
              <div className="hidden w-full lg:block lg:w-1/2">
                <div className="relative py-20 pl-17.5 pr-22">
                  <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>

                  <h2 className="mb-10 max-w-[292px] text-heading-4 font-bold text-white">
                    Check Your Email
                  </h2>
                  <div className="relative aspect-[61/50] w-full max-w-[427px]">
                    <Image src="/images/signin/sigin.svg" alt="check email" fill />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="py-8 pl-8 pr-8 sm:py-20 sm:pl-21 sm:pr-20">
                  <div className="text-center">
                    <div className="mb-10">
                      <h3 className="mb-3 text-2xl font-bold text-white">
                        Check Your Email
                      </h3>
                      <p className="text-lg text-white/60">
                        We&apos;ve sent you an email with a link to verify your account or sign in.
                      </p>
                    </div>

                    <div className="mb-10">
                      <p className="text-base text-white/60">
                        If you don&apos;t see the email in your inbox, please check your spam folder.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => router.push('/auth/signin')}
                        className="hero-button-gradient flex w-full items-center justify-center rounded-lg px-7 py-3 font-medium text-white duration-300 ease-in hover:opacity-80"
                      >
                        Back to Sign In
                      </button>

                      <Link
                        href="/auth/signup"
                        className="text-sm font-medium text-purple hover:underline"
                      >
                        Create a new account instead
                      </Link>
                    </div>
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

export default CheckEmail; 