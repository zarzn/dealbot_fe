import Breadcrumb from "@/components/Breadcrumb";
import Faq from "@/components/Faq";
import PricingGrids from "@/components/Pricing/PricingGrids";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | AI Agentic Deals System",
  description: "Pricing plans for AI Agentic Deals System",
  // other metadata
};

const PricingPage = () => {
  return (
    <>
      <Breadcrumb pageTitle="Pricing Page" />
      <section className="pb-20 pt-17.5 lg:pb-25 lg:pt-22.5 xl:pt-27.5">
        <PricingGrids />
      </section>

      <Faq />
    </>
  );
};

export default PricingPage;
