import SectionTitle from "../Common/SectionTitle";
import SinglePricing from "./SInglePricing";

const pricingData = [
  {
    id: "price_1NQk5TLtGdPVhGLecVfQ7mn0",
    unit_amount: 100 * 100,
    nickname: "Small",
    title: "Basic",
    features: [
      "10 Deal Searches per Day",
      "Basic Price Tracking",
      "Email Notifications",
      "Community Support",
      "Basic Analytics"
    ]
  },
  {
    id: "price_1NQk55LtGdPVhGLefU8AHqHr",
    unit_amount: 200 * 100,
    nickname: "Medium",
    title: "Pro",
    features: [
      "Unlimited Deal Searches",
      "Advanced Price Prediction",
      "Real-time Notifications",
      "Priority Support",
      "Advanced Analytics",
      "Custom Deal Alerts",
      "Market Trend Analysis"
    ]
  },
  {
    id: "price_1NQk4eLtGdPVhGLeZsZDsCNz",
    unit_amount: 300 * 100,
    nickname: "Large",
    title: "Enterprise",
    features: [
      "Everything in Pro",
      "AI-Powered Deal Scoring",
      "Dedicated Account Manager",
      "Custom API Access",
      "White-label Solution",
      "Advanced Integrations",
      "Custom Analytics Dashboard"
    ]
  }
];

const PricingGrids = () => {
  return (
    <section className="relative z-10 overflow-hidden py-20 lg:py-25">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionTitle
          subTitle="Get access"
          title="Our Pricing Plan"
          paragraph="Choose the perfect plan for your deal discovery and management needs. Our tiered options provide flexible solutions for individuals, teams, and enterprises seeking AI-powered deal intelligence."
        />
        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
          {pricingData.map((price, key) => (
            <SinglePricing key={key} price={price} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingGrids;
