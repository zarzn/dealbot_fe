import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllPosts } from "@/libs/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | AI Agentic Deals System",
  description: "Comprehensive documentation for the AI Agentic Deals System - Learn how to use the platform, API references, troubleshooting guides, and FAQs.",
  // other metadata
};

export default function DocsPage() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);
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
                <h1>AI Agentic Deals System Documentation</h1>

                <p className="font-medium mb-6">
                  Welcome to the comprehensive documentation for the AI Agentic Deals System. 
                  This documentation will help you understand how to use the platform, 
                  integrate with our APIs, troubleshoot common issues, and find answers to frequently asked questions.
                </p>
                
                <h2 className="text-xl font-bold mb-4">Documentation Sections</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                    <p>Learn the basics of the AI Agentic Deals System, including account setup, navigation, and core features.</p>
                    <a href="/docs/getting-started" className="text-primary hover:underline mt-2 inline-block">Read Guide →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">API Reference</h3>
                    <p>Comprehensive documentation for our REST and WebSocket APIs, including authentication, endpoints, and examples.</p>
                    <a href="/docs/api-reference" className="text-primary hover:underline mt-2 inline-block">View API Docs →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Troubleshooting</h3>
                    <p>Solutions for common issues you might encounter while using the AI Agentic Deals System.</p>
                    <a href="/docs/troubleshooting" className="text-primary hover:underline mt-2 inline-block">View Troubleshooting →</a>
                  </div>
                  
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">FAQ</h3>
                    <p>Answers to frequently asked questions about accounts, deals, tokens, and technical aspects.</p>
                    <a href="/docs/faq" className="text-primary hover:underline mt-2 inline-block">View FAQs →</a>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-4">Need Additional Help?</h2>
                <p className="font-medium">
                  If you can&apos;t find what you&apos;re looking for in our documentation, please contact our support team at{" "}
                  <a href="mailto:support@aiagentic.deals" className="text-primary hover:underline">
                    support@aiagentic.deals
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
