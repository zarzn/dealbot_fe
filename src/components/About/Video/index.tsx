"use client";
import FsLightbox from "fslightbox-react";
import Image from "next/image";
import { useState } from "react";

const Video = () => {
  const [toggler, setToggler] = useState(false);

  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="text-center mb-12">
          <span className="hero-subtitle-gradient relative mb-4 inline-flex items-center gap-2 rounded-full px-4.5 py-2 text-sm font-medium">
            <Image src="/images/hero/icon-title.svg" alt="icon" width={16} height={16} />
            <span className="hero-subtitle-text">See It in Action</span>
          </span>
          <h2 className="mb-4.5 text-2xl font-extrabold text-white sm:text-4xl xl:text-heading-2">
            Experience AI-Powered Deal Finding
          </h2>
          <p className="mx-auto max-w-[600px] text-white/70">
            Watch how our intelligent system monitors prices, predicts trends, and helps you achieve your shopping goals with unprecedented accuracy.
          </p>
        </div>

        <div className="relative z-999 aspect-[39/20] rounded-3xl">
          <button
            aria-label="Watch platform demo"
            onClick={() => setToggler(!toggler)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#60A5FA] to-[#2563EB] shadow-video hover:from-[#3B82F6] hover:to-[#1D4ED8] transition-colors"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.1688 16.8077L7.26999 27.1727C5.73764 28.0601 3.75 27.0394 3.75 25.3651V4.63517C3.75 2.96091 5.73764 1.94018 7.26997 2.82754L25.1688 13.1925C26.6104 14.0274 26.6104 15.9729 25.1688 16.8077Z"
                fill="white"
              />
            </svg>
          </button>
          <span className="absolute left-1/2 top-1/2 z-1 block h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] backdrop-blur-[5px]"></span>

          <Image 
            src="/images/video/platform-demo.png" 
            fill 
            alt="AI-powered deal finding platform demo" 
            className="object-cover rounded-3xl"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="wow fadeInUp p-6 bg-white/[0.05] rounded-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Smart Goal Setting</h3>
            <p className="text-white/70">Define your shopping goals with flexible constraints and let our AI find the perfect deals.</p>
          </div>
          <div className="wow fadeInUp p-6 bg-white/[0.05] rounded-xl backdrop-blur-sm" data-wow-delay="0.1s">
            <h3 className="text-lg font-semibold mb-2">Price Prediction</h3>
            <p className="text-white/70">Advanced algorithms analyze trends and predict the best time to make your purchase.</p>
          </div>
          <div className="wow fadeInUp p-6 bg-white/[0.05] rounded-xl backdrop-blur-sm" data-wow-delay="0.2s">
            <h3 className="text-lg font-semibold mb-2">Token Rewards</h3>
            <p className="text-white/70">Earn tokens for successful deals and community contributions in our reward ecosystem.</p>
          </div>
        </div>
      </div>

      <FsLightbox
        toggler={toggler}
        sources={["https://www.youtube.com/watch?v=platform-demo"]}
      />
    </section>
  );
};

export default Video;
