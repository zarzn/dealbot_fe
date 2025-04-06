"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function TrackingDealsPage() {
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  React.useEffect(() => {
    document.title = "Tracking Deals | RebatOn";
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
                <h1>Tracking Deals</h1>
                <p>RebatOn makes it easy to track deals over time and monitor price changes. This guide will walk you through the tracking features and how to make the most of them.</p>
                
                <h2>Saving Deals</h2>
                <p>To save a deal for tracking:</p>
                <ol>
                  <li>Find a deal you&apos;re interested in through search or your feed</li>
                  <li>Click the &quot;Save Deal&quot; button or bookmark icon</li>
                  <li>Optionally add a personal note about the deal</li>
                  <li>Select a category or create a new one to organize your saved deals</li>
                </ol>
                
                <h2>Accessing Your Tracked Deals</h2>
                <p>All your tracked deals are available in your dashboard:</p>
                <ol>
                  <li>Click on &quot;My Deals&quot; in the navigation menu</li>
                  <li>View your deals organized by categories</li>
                  <li>Use filters to sort and find specific tracked deals</li>
                </ol>
                
                <h2>Deal Status Indicators</h2>
                <p>RebatOn uses visual indicators to show deal status:</p>
                <ul>
                  <li><strong>Green:</strong> Price has decreased since you started tracking</li>
                  <li><strong>Red:</strong> Price has increased since you started tracking</li>
                  <li><strong>Yellow:</strong> Deal is about to expire or limited quantity remaining</li>
                  <li><strong>Gray:</strong> Deal is no longer available</li>
                </ul>
                
                <h2>Price History</h2>
                <p>For each tracked deal, you can view detailed price history:</p>
                <ol>
                  <li>Select a tracked deal from your dashboard</li>
                  <li>Click on &quot;Price History&quot; tab</li>
                  <li>View the interactive price chart showing historical price changes</li>
                  <li>Hover over points in the chart to see exact prices on specific dates</li>
                </ol>
                
                <h2>Setting Price Alerts</h2>
                <p>Get notified when a tracked deal reaches your desired price:</p>
                <ol>
                  <li>Open a tracked deal from your dashboard</li>
                  <li>Click &quot;Set Price Alert&quot;</li>
                  <li>Enter your target price</li>
                  <li>Choose your notification method (email, in-app, or both)</li>
                </ol>
                
                <h2>Managing Tracked Deals</h2>
                <p>Keep your tracked deals organized:</p>
                <ul>
                  <li><strong>Categorize:</strong> Group deals by product type, urgency, or any custom category</li>
                  <li><strong>Add notes:</strong> Attach personal notes to deals for reference</li>
                  <li><strong>Archive:</strong> Move deals you&apos;re no longer actively tracking to archive</li>
                  <li><strong>Delete:</strong> Remove deals completely from your tracking list</li>
                </ul>
                
                <h2>Deal Expiration</h2>
                <p>RebatOn helps you keep track of deal deadlines:</p>
                <ul>
                  <li>Deals with expiration dates show a countdown timer</li>
                  <li>You&apos;ll receive a notification before a tracked deal expires</li>
                  <li>Expired deals are automatically marked and can be filtered from your view</li>
                </ul>
                
                <h2>Next Steps</h2>
                <p>To learn more about making the most of tracked deals, check out these guides:</p>
                <ul>
                  <li><a href="/how-to-use/understanding-deal-analysis">Understanding Deal Analysis</a></li>
                  <li><a href="/how-to-use/sharing-deals">Sharing Deals</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}