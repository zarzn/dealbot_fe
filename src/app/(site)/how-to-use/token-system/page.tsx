"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function TokenSystemPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Token System | RebatOn";
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
                <h1>Understanding the Token System</h1>
                <p>RebatOn&apos;s token system powers the platform&apos;s economy and rewards users for their participation. This guide explains how tokens work and how you can earn and use them.</p>
                
                <h2>What Are RebatOn Tokens?</h2>
                <p>RebatOn tokens are digital assets that represent value within our platform. They serve multiple purposes:</p>
                <ul>
                  <li><strong>Currency:</strong> Use tokens to access premium features</li>
                  <li><strong>Rewards:</strong> Earn tokens for contributing to the community</li>
                  <li><strong>Incentives:</strong> Encourage quality deal sharing and participation</li>
                  <li><strong>Governance:</strong> Participate in platform decisions (for premium token holders)</li>
                </ul>
                
                <h2>Types of Tokens</h2>
                <p>RebatOn has two main types of tokens:</p>
                
                <h3>Standard Tokens</h3>
                <ul>
                  <li>Earned through regular platform activities</li>
                  <li>Used for basic platform features</li>
                  <li>Cannot be transferred off-platform</li>
                  <li>Expire after 90 days of inactivity</li>
                </ul>
                
                <h3>Premium Tokens</h3>
                <ul>
                  <li>Earned through exceptional contributions or purchased</li>
                  <li>Used for advanced features and priority access</li>
                  <li>Can be transferred between users</li>
                  <li>Do not expire</li>
                </ul>
                
                <h2>Ways to Earn Tokens</h2>
                <p>There are many ways to earn tokens on RebatOn:</p>
                
                <h3>Daily Activities</h3>
                <ul>
                  <li><strong>Daily Login:</strong> 5 tokens per day</li>
                  <li><strong>First Search:</strong> 2 tokens per day</li>
                  <li><strong>Platform Engagement:</strong> Up to 10 tokens per day based on time spent</li>
                </ul>
                
                <h3>Deal-Related Activities</h3>
                <ul>
                  <li><strong>Submitting Deals:</strong> 10-50 tokens depending on deal quality</li>
                  <li><strong>Deal Verification:</strong> 5 tokens for confirming deal validity</li>
                  <li><strong>Deal Comments:</strong> 2 tokens per substantive comment</li>
                  <li><strong>Deal Ratings:</strong> 1 token per rating</li>
                </ul>
                
                <h3>Social Activities</h3>
                <ul>
                  <li><strong>Sharing Deals:</strong> 5 tokens per share</li>
                  <li><strong>Referrals:</strong> 100 tokens per new user who joins</li>
                  <li><strong>Community Contributions:</strong> Tokens awarded for helpful forum posts</li>
                </ul>
                
                <h3>Achievement Bonuses</h3>
                <ul>
                  <li><strong>Streaks:</strong> Bonus tokens for consecutive days of activity</li>
                  <li><strong>Milestones:</strong> Rewards for reaching usage milestones</li>
                  <li><strong>Quality Contributions:</strong> Premium tokens for exceptionally valuable deals</li>
                </ul>
                
                <h2>Using Tokens</h2>
                <p>Tokens can be used for various purposes on RebatOn:</p>
                
                <h3>Feature Access</h3>
                <ul>
                  <li><strong>Deal Search:</strong> 1 token per search</li>
                  <li><strong>Advanced Filters:</strong> 2 tokens per use</li>
                  <li><strong>Deal Alerts:</strong> 5 tokens per alert set up</li>
                  <li><strong>Price History:</strong> 3 tokens to view extended history</li>
                </ul>
                
                <h3>Premium Services</h3>
                <ul>
                  <li><strong>AI Deal Analysis:</strong> 10 tokens per analysis</li>
                  <li><strong>Price Predictions:</strong> 15 tokens per prediction</li>
                  <li><strong>Market Reports:</strong> 25 tokens per report</li>
                  <li><strong>Deal Curation:</strong> 20 tokens for personalized deal lists</li>
                </ul>
                
                <h3>Community Features</h3>
                <ul>
                  <li><strong>Direct Messaging:</strong> 2 tokens per message</li>
                  <li><strong>Private Deal Sharing:</strong> 5 tokens per private share</li>
                  <li><strong>Custom Alerts:</strong> 10 tokens per custom alert configuration</li>
                </ul>
                
                <h2>Token Balance</h2>
                <p>To check your token balance:</p>
                <ol>
                  <li>Log in to your RebatOn account</li>
                  <li>Navigate to your user profile</li>
                  <li>Select the &quot;Tokens&quot; tab</li>
                  <li>View your current balance, transaction history, and earnings opportunities</li>
                </ol>
                
                <h2>Token Expiration</h2>
                <p>Standard tokens expire 90 days after they are earned if not used. To prevent token expiration:</p>
                <ul>
                  <li>Use tokens regularly for platform features</li>
                  <li>Upgrade standard tokens to premium tokens (conversion rate applies)</li>
                  <li>Maintain regular platform activity</li>
                </ul>
                
                <h2>Token Upgrades</h2>
                <p>You can upgrade standard tokens to premium tokens at a conversion rate of 10:1. This removes the expiration limitation and provides access to premium features.</p>
                
                <h2>Next Steps</h2>
                <p>To learn more about RebatOn features, check out these guides:</p>
                <ul>
                  <li><a href="/how-to-use/troubleshooting">Troubleshooting</a></li>
                  <li><a href="/how-to-use/faq">FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 