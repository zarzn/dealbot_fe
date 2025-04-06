"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function DealGoalsPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Setting Deal Goals | RebatOn";
  }, []);
  
  return (
    <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-1/4">
            <div className="sticky top-[74px] rounded-lg bg-white/5 p-4 transition-all">
              <ul className="space-y-2">
                {sortedPosts.map((post, key) => (
                  <SidebarLink post={post} key={key} />
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full px-4 lg:w-3/4">
            <div className="blog-details blog-details-docs rounded-lg bg-white/5 px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
              <DocsStyles />
              <div className="prose prose-invert max-w-none">
                <h1>Setting Deal Goals</h1>
                <p>Deal goals allow you to specify products you want to track and conditions for what you consider a good deal.</p>
                
                <h2>Creating a Deal Goal</h2>
                <p>To create a new deal goal:</p>
                <ol>
                  <li>Navigate to the Goals section in your dashboard</li>
                  <li>Click &quot;Create New Goal&quot;</li>
                  <li>Enter a product name or description</li>
                  <li>Set your target price and other parameters</li>
                  <li>Choose your notification preferences</li>
                  <li>Save your goal</li>
                </ol>
                
                <h2>Goal Parameters</h2>
                <p>Customize your goal with these parameters:</p>
                <ul>
                  <li><strong>Target price:</strong> The maximum price you&apos;re willing to pay</li>
                  <li><strong>Urgency:</strong> How quickly you need the product</li>
                  <li><strong>Quality preference:</strong> New, used, or refurbished</li>
                  <li><strong>Notification threshold:</strong> At what price point you want to be alerted</li>
                  <li><strong>Marketplaces:</strong> Which online stores to monitor</li>
                </ul>
                
                <h2>Managing Goals</h2>
                <p>You can edit, pause, or delete goals at any time. Active goals are continuously monitored, while paused goals remain in your dashboard but don&apos;t trigger searches or notifications.</p>
                
                <h2>Goal Performance</h2>
                <p>Each goal shows performance metrics:</p>
                <ul>
                  <li>Matched deals count</li>
                  <li>Best match found (lowest price)</li>
                  <li>Price trend for your target product</li>
                  <li>Expected time to reach your target price</li>
                </ul>
                
                <h2>Advanced Goal Features</h2>
                <p>RebatOn offers several advanced features for power users:</p>
                <ul>
                  <li><strong>Complex search criteria:</strong> Combine multiple keywords and conditions</li>
                  <li><strong>Competing product tracking:</strong> Monitor alternatives to your main target</li>
                  <li><strong>Price history analysis:</strong> Get insights on the best time to buy</li>
                  <li><strong>Goal sharing:</strong> Share your goals with friends for collaborative shopping</li>
                </ul>
                
                <h2>Deal Alerts</h2>
                <p>When a match is found for your goal, you&apos;ll receive notifications based on your preferences:</p>
                <ul>
                  <li>Email alerts</li>
                  <li>In-app notifications</li>
                  <li>Push notifications (if enabled)</li>
                </ul>
                
                <h2>Next Steps</h2>
                <p>Once you&apos;ve set up your first goal, check out these related guides:</p>
                <ul>
                  <li><a href="/how-to-use/tracking-deals">Tracking Deals</a></li>
                  <li><a href="/how-to-use/understanding-deal-analysis">Understanding Deal Analysis</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 