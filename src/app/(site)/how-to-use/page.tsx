import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllPosts } from "@/libs/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use | RebatOn",
  description: "Comprehensive guides for the RebatOn platform - Learn how to use the platform, find deals, track your goals, and more.",
  // other metadata
};

// Function to sort posts in the correct order
const sortPosts = (posts: any[]) => {
  // Define the order of documentation pages
  const order = [
    "getting-started",
    "searching-deals",
    "deal-goals",
    "tracking-deals",
    "understanding-deal-analysis",
    "sharing-deals",
    "token-system",
    "troubleshooting",
    "faq"
  ];
  
  // Create a copy of posts to sort
  return [...posts].sort((a, b) => {
    const indexA = order.indexOf(a.slug);
    const indexB = order.indexOf(b.slug);
    
    // If both posts are in the order array, sort by their position
    if (indexA >= 0 && indexB >= 0) {
      return indexA - indexB;
    }
    
    // If only one post is in the order array, prioritize it
    if (indexA >= 0) return -1;
    if (indexB >= 0) return 1;
    
    // If neither post is in the order array, maintain original order
    return 0;
  });
};

export default function HowToUsePage() {
  const allPosts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);
  const posts = sortPosts(allPosts);
  
  return (
    <>
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-1/4">
              <div className="sticky top-[74px] rounded-lg bg-white/5 p-4 transition-all">
                <ul className="space-y-2">
                  {posts.map((post, key) => (
                    <SidebarLink post={post} key={key} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="w-full px-4 lg:w-3/4">
              <div className="blog-details rounded-lg bg-white/5 px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
                <h1>How to Use RebatOn</h1>

                <p className="font-medium mb-6">
                  Welcome to our comprehensive user guides for the RebatOn platform. 
                  These guides will help you understand how to use the platform, 
                  find the best deals, set goals, and make the most of our AI-powered features.
                </p>
                
                <h2 className="text-xl font-bold mb-4">Essential Guides</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                    <p>Learn the basics of the RebatOn platform, including account setup and core features.</p>
                    <a href="/how-to-use/getting-started" className="text-primary hover:underline mt-2 inline-block">Read Guide →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Searching for Deals</h3>
                    <p>Discover how to find the best deals using our powerful AI search features.</p>
                    <a href="/how-to-use/searching-deals" className="text-primary hover:underline mt-2 inline-block">View Guide →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Deal Goals</h3>
                    <p>Learn how to create personalized deal goals and let our AI find products for you.</p>
                    <a href="/how-to-use/deal-goals" className="text-primary hover:underline mt-2 inline-block">View Guide →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Tracking Deals</h3>
                    <p>Learn how to track deals you&apos;re interested in and set up personalized notifications.</p>
                    <a href="/how-to-use/tracking-deals" className="text-primary hover:underline mt-2 inline-block">View Guide →</a>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-4">Advanced Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Understanding Deal Analysis</h3>
                    <p>Learn how to interpret our AI&apos;s deal analysis to make smarter purchase decisions.</p>
                    <a href="/how-to-use/understanding-deal-analysis" className="text-primary hover:underline mt-2 inline-block">View Guide →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Sharing Deals</h3>
                    <p>Discover how to share deals with friends and track engagement with your shared content.</p>
                    <a href="/how-to-use/sharing-deals" className="text-primary hover:underline mt-2 inline-block">View Guide →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Token System</h3>
                    <p>Learn how our token economy works and how to manage your tokens for premium features.</p>
                    <a href="/how-to-use/token-system" className="text-primary hover:underline mt-2 inline-block">View Guide →</a>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-4">Help & Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Troubleshooting</h3>
                    <p>Solutions for common issues you might encounter while using the platform.</p>
                    <a href="/how-to-use/troubleshooting" className="text-primary hover:underline mt-2 inline-block">View Troubleshooting →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">FAQ</h3>
                    <p>Answers to frequently asked questions about accounts, deals, tokens, and more.</p>
                    <a href="/how-to-use/faq" className="text-primary hover:underline mt-2 inline-block">View FAQs →</a>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-4">Need Additional Help?</h2>
                <p className="font-medium">
                  If you can&apos;t find what you&apos;re looking for in our guides, please contact our support team at{" "}
                  <a href="mailto:support@rebaton.ai" className="text-primary hover:underline">
                    support@rebaton.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
