"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function GettingStartedPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Getting Started | RebatOn";
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
                <h1>Getting Started with RebatOn</h1>
                <p>Welcome to RebatOn! This guide will walk you through the basics of setting up your account and starting to use our platform to find great deals.</p>
                
                <h2>Creating Your Account</h2>
                <p>To begin using RebatOn:</p>
                <ol>
                  <li>Visit the RebatOn homepage and click &quot;Sign Up&quot;</li>
                  <li>Enter your email address and create a password</li>
                  <li>Verify your email address through the confirmation link</li>
                  <li>Complete your profile with your preferences</li>
                </ol>
                
                <h2>Setting Up Your Profile</h2>
                <p>Your profile helps RebatOn customize your experience:</p>
                <ul>
                  <li><strong>Shopping Preferences:</strong> Categories of products you&apos;re interested in</li>
                  <li><strong>Price Alerts:</strong> How you want to be notified about deals</li>
                  <li><strong>Favorite Stores:</strong> Select retailers you prefer</li>
                  <li><strong>Deal Preferences:</strong> How aggressive you want your deal searches to be</li>
                </ul>
                
                <h2>Understanding Your Dashboard</h2>
                <p>Your dashboard is your command center for finding and tracking deals:</p>
                <ul>
                  <li><strong>Search Bar:</strong> Find specific products</li>
                  <li><strong>Deal Feed:</strong> Personalized deal recommendations</li>
                  <li><strong>Goals Section:</strong> Products you&apos;re tracking</li>
                  <li><strong>Saved Deals:</strong> Deals you&apos;ve bookmarked</li>
                  <li><strong>Token Balance:</strong> Your available RebatOn tokens</li>
                </ul>
                
                <h2>Using the Search Feature</h2>
                <p>The search feature is a powerful tool to find specific deals:</p>
                <ol>
                  <li>Enter a product name or description in the search bar</li>
                  <li>Use filters to narrow down results</li>
                  <li>Sort results by price, rating, or relevance</li>
                  <li>Save interesting deals to your dashboard</li>
                </ol>
                
                <h2>Setting Your First Deal Goal</h2>
                <p>Deal goals help you track products until they reach your desired price:</p>
                <ol>
                  <li>Click &quot;Create Goal&quot; in your dashboard</li>
                  <li>Enter the product information</li>
                  <li>Set your target price</li>
                  <li>Choose notification preferences</li>
                </ol>
                
                <h2>Next Steps</h2>
                <p>Now that you&apos;re set up, explore these guides to make the most of RebatOn:</p>
                <ul>
                  <li><a href="/how-to-use/searching-deals">Searching for Deals</a></li>
                  <li><a href="/how-to-use/deal-goals">Setting Deal Goals</a></li>
                  <li><a href="/how-to-use/token-system">Understanding the Token System</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 