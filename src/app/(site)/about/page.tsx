import AboutSection from "@/components/About/AboutSection";
import Team from "@/components/About/Team";
import Video from "@/components/About/Video";
import Breadcrumb from "@/components/Breadcrumb";
import CallToAction from "@/components/CallToAction";
import Clients from "@/components/Home/Clients";
import Features from "@/components/Home/Features";
import Reviews from "@/components/Home/Reviews";
import Newsletter from "@/components/Newsletter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Agentic Deals | AI-Powered Deal Finding Platform",
  description: "Learn how Agentic Deals' AI technology revolutionizes deal finding with price prediction, real-time monitoring, and intelligent goal tracking.",
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb 
        pageTitle="About Agentic Deals" 
        pagePath={[
          { label: "Home", path: "/" },
          { label: "About", path: "/about" }
        ]}
      />
      
      {/* Main About Section */}
      <AboutSection />

      {/* Core Features */}
      <Features />

      {/* Platform Demo */}
      <Video />

      {/* Our Team - Temporarily disabled */}
      {/* <Team /> */}

      {/* User Reviews */}
      <section className="relative z-20 overflow-hidden pb-20 bg-white/[0.02]">
        <Reviews />
      </section>

      {/* Integration Partners */}
      <section className="py-20">
        <Clients />
      </section>

      {/* Call to Action */}
      <CallToAction />

      {/* Newsletter - Temporarily disabled */}
      {/* <Newsletter /> */}
    </>
  );
};

export default AboutPage;
