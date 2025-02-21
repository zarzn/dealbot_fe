import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden pt-35 md:pt-40 xl:pt-45"
    >
      {/* <!-- Hero Bg Shapes --> */}
      <div className="mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 -z-10 -mx-28 overflow-hidden">
          <div className="-u-z-10 hero-circle-gradient absolute -top-[128%] left-1/2 -z-1 h-[1282px] w-full max-w-[1282px] -translate-x-1/2 rounded-full sm:-top-[107%] xl:-top-[73%]"></div>
          <div className="-u-z-10 hero-circle-gradient absolute -top-[112%] left-1/2 -z-1 h-[1046px] w-full max-w-[1046px] -translate-x-1/2 rounded-full sm:-top-[93%] xl:-top-[62%]"></div>
          <div className="-u-z-10 absolute left-1/2 top-0 aspect-[1204/394] w-full max-w-[1204px] -translate-x-1/2">
            <Image
              src="/images/blur/blur-02.svg"
              alt="blur"
              fill
              className="max-w-none"
            />
          </div>
          <div className="-u-z-10 absolute left-1/2 top-0 h-full w-full -translate-x-1/2 bg-[url(/images/blur/blur-01.svg)] bg-cover bg-top bg-no-repeat"></div>
        </div>
      </div>

      {/* <!-- Hero Content --> */}
      <div className="relative z-1 mx-auto max-w-[900px] px-4 sm:px-8 xl:px-0">
        <div className="text-center">
          <span className="hero-subtitle-gradient hover:hero-subtitle-hover relative mb-5 inline-flex items-center gap-2 rounded-full px-4.5 py-2 text-sm font-medium">
            <Image
              src="/images/hero/icon-title.svg"
              alt="icon"
              width={16}
              height={16}
            />
            <span className="hero-subtitle-text">
              AI-Powered Deal Finding
            </span>
          </span>
          <h1 className="mb-6 text-3xl font-extrabold text-white sm:text-5xl xl:text-heading-1">
            Never Miss the Best Deals with AI-Driven Price Intelligence
          </h1>
          <p className="mx-auto mb-9 max-w-[600px] font-medium md:text-lg">
            Set your deal-finding goals and let our AI system monitor prices across markets, predict price trends, and notify you of the perfect moment to buy. Save time and money with intelligent deal tracking.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard/goals/create"
              className="hero-button-gradient inline-flex rounded-lg px-7 py-3 font-medium text-white duration-300 ease-in hover:opacity-80"
            >
              Create Your First Goal
            </Link>
            <Link
              href="/dashboard/deals"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-7 py-3 font-medium text-white hover:bg-white/5"
            >
              View Active Deals
            </Link>
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto mt-24 aspect-[1170/411] w-full max-w-[1170px]"
        data-wow-delay="0.1s"
      >
        <Image
          className="mx-auto"
          src="./images/hero/hero.svg"
          alt="AI-powered deal monitoring dashboard"
          fill
        />
      </div>
    </section>
  );
};

export default Hero;
