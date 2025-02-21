import Image from "next/image";
import Link from "next/link";

const AboutSection = () => {
  return (
    <section className="overflow-hidden">
      <div className="relative mx-auto max-w-[1170px] px-4 py-20 sm:px-8 lg:py-25 xl:px-0">
        <div className="about-divider-gradient absolute bottom-0 left-0 h-[1px] w-full"></div>

        <div className="flex flex-wrap justify-between gap-11 xl:flex-nowrap">
          <div className="wow fadeInLeft w-full max-w-[570px]">
            <span className="hero-subtitle-text mb-5 block font-semibold">
              About REBATON
            </span>

            <h2 className="mb-5 text-2xl font-extrabold text-white sm:text-4xl xl:text-heading-2">
              Revolutionizing Deal Finding with AI-Powered Intelligence
            </h2>
            <p className="mb-6 font-medium text-white/70">
              REBATON is an advanced AI-driven platform that transforms how you discover and track deals across e-commerce markets. Our system combines cutting-edge price prediction algorithms, real-time monitoring, and intelligent goal tracking to ensure you never miss the perfect moment to buy.
            </p>
            <p className="mb-9 font-medium text-white/70">
              Powered by sophisticated machine learning models and blockchain technology, we provide a unique token-based ecosystem that rewards smart shopping and community participation.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/goals/create"
                className="hero-button-gradient inline-flex rounded-lg px-7 py-3 font-medium text-white duration-300 ease-in hover:opacity-80"
              >
                Start Finding Deals
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-7 py-3 font-medium text-white hover:bg-white/5"
              >
                Join Community
              </Link>
            </div>
          </div>

          <div className="wow fadeInRight relative hidden aspect-[556/401] w-full xl:block">
            <Image src="/images/about/about.svg" alt="AI-powered deal monitoring dashboard" fill />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
