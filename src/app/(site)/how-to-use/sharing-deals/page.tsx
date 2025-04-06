"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function SharingDealsPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Sharing Deals | RebatOn";
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
                <h1>Sharing Deals</h1>
                <p>RebatOn makes it easy to share great deals with friends, family, and the community. This guide will walk you through the sharing features and how to use them effectively.</p>
                
                <h2>Ways to Share Deals</h2>
                <p>There are several ways to share deals on RebatOn:</p>
                <ul>
                  <li><strong>Direct Link Sharing:</strong> Generate and share a unique link to any deal</li>
                  <li><strong>Social Media Sharing:</strong> Share directly to platforms like Twitter and Facebook</li>
                  <li><strong>Email Sharing:</strong> Send deals directly via email</li>
                  <li><strong>In-App Sharing:</strong> Share with other RebatOn users</li>
                </ul>
                
                <h2>Sharing a Deal</h2>
                <p>To share a deal you&apos;ve found:</p>
                <ol>
                  <li>Navigate to the deal you want to share</li>
                  <li>Click the &quot;Share&quot; button</li>
                  <li>Choose your preferred sharing method</li>
                  <li>Add a personal message (optional)</li>
                  <li>Confirm and share</li>
                </ol>
                
                <h2>Customizing Shared Content</h2>
                <p>When sharing a deal, you can customize what information is included:</p>
                <ul>
                  <li><strong>Include Price:</strong> Show or hide the current price</li>
                  <li><strong>Include Discount:</strong> Display the discount percentage</li>
                  <li><strong>Add Personal Note:</strong> Include your own comments about the deal</li>
                  <li><strong>Set Expiration:</strong> Choose how long your shared link remains active</li>
                </ul>
                
                <h2>Tracking Shared Deals</h2>
                <p>Keep track of the deals you&apos;ve shared:</p>
                <ol>
                  <li>Navigate to your dashboard</li>
                  <li>Click on the &quot;Shared&quot; tab</li>
                  <li>View statistics for each shared deal, including:</li>
                  <ul>
                    <li>Number of views</li>
                    <li>Number of clicks</li>
                    <li>Conversion rate (if applicable)</li>
                  </ul>
                </ol>
                
                <h2>Earning Tokens Through Sharing</h2>
                <p>RebatOn rewards you for sharing valuable deals with others:</p>
                <ul>
                  <li><strong>View Rewards:</strong> Earn tokens when others view your shared deals</li>
                  <li><strong>Engagement Rewards:</strong> Earn additional tokens when others interact with your shared deals</li>
                  <li><strong>Conversion Rewards:</strong> Earn premium tokens when shared deals lead to successful purchases</li>
                  <li><strong>Referral Bonuses:</strong> Earn tokens when you refer new users to RebatOn</li>
                </ul>
                
                <h2>Privacy Controls</h2>
                <p>Control who can see your shared deals:</p>
                <ul>
                  <li><strong>Public Sharing:</strong> Anyone with the link can access</li>
                  <li><strong>Private Sharing:</strong> Only specific recipients can access</li>
                  <li><strong>Password Protection:</strong> Add an additional layer of security</li>
                  <li><strong>Expiration Settings:</strong> Set deals to automatically expire after a certain time</li>
                </ul>
                
                <h2>Sharing Goals</h2>
                <p>In addition to sharing deals, you can share your deal goals:</p>
                <ol>
                  <li>Navigate to the goal you want to share</li>
                  <li>Click the &quot;Share Goal&quot; button</li>
                  <li>Choose your sharing method</li>
                  <li>Customize the sharing options</li>
                  <li>Confirm and share</li>
                </ol>
                
                <h2>Next Steps</h2>
                <p>To learn more about RebatOn features, check out these guides:</p>
                <ul>
                  <li><a href="/how-to-use/token-system">Understanding the Token System</a></li>
                  <li><a href="/how-to-use/troubleshooting">Troubleshooting</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 