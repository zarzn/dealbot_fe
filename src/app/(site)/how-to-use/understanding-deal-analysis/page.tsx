"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function UnderstandingDealAnalysisPage() {
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  React.useEffect(() => {
    document.title = "Understanding Deal Analysis | RebatOn";
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
                <h1>Understanding Deal Analysis</h1>
                <p>RebatOn provides sophisticated analysis tools to help you evaluate deals and make informed purchasing decisions. This guide explains how to interpret our deal analysis features.</p>
                
                <h2>Deal Score</h2>
                <p>Each deal on RebatOn is assigned a score from 1-100:</p>
                <ul>
                  <li><strong>90-100:</strong> Exceptional deal - rarely available pricing</li>
                  <li><strong>80-89:</strong> Great deal - significantly better than typical offers</li>
                  <li><strong>70-79:</strong> Good deal - better than average market price</li>
                  <li><strong>60-69:</strong> Fair deal - slightly below average market price</li>
                  <li><strong>Below 60:</strong> Average to poor deal - not recommended unless urgent</li>
                </ul>
                
                <h2>Price History Analysis</h2>
                <p>The price history chart shows how a product&apos;s price has changed over time:</p>
                <ul>
                  <li><strong>Historical Lows:</strong> Marked with green dots on the chart</li>
                  <li><strong>Historical Highs:</strong> Marked with red dots on the chart</li>
                  <li><strong>Current Price:</strong> Highlighted with a blue dot</li>
                  <li><strong>Average Price:</strong> Shown as a horizontal dotted line</li>
                </ul>
                
                <h2>Price Prediction</h2>
                <p>RebatOn uses AI to predict future price movements:</p>
                <ul>
                  <li><strong>Price Forecast:</strong> Projected price over the next 30 days</li>
                  <li><strong>Buy Now Confidence:</strong> Rating of whether to purchase now or wait</li>
                  <li><strong>Expected Discount:</strong> Projected maximum discount in the coming month</li>
                  <li><strong>Price Pattern Recognition:</strong> Identification of seasonal or cyclical pricing patterns</li>
                </ul>
                
                <h2>Market Comparison</h2>
                <p>See how a deal compares across different retailers:</p>
                <ul>
                  <li><strong>Price Comparison Table:</strong> Current prices from multiple retailers</li>
                  <li><strong>Total Cost Analysis:</strong> Includes shipping, tax, and any memberships required</li>
                  <li><strong>Price Match Opportunities:</strong> Retailers with price match guarantees</li>
                  <li><strong>Coupon Compatibility:</strong> Available coupons that can be applied to the deal</li>
                </ul>
                
                <h2>Product Value Assessment</h2>
                <p>Evaluate the overall value of a product:</p>
                <ul>
                  <li><strong>Price per Feature:</strong> Cost breakdown by key features</li>
                  <li><strong>Durability Rating:</strong> Expected lifespan of the product</li>
                  <li><strong>Cost of Ownership:</strong> Long-term costs (supplies, maintenance, etc.)</li>
                  <li><strong>Alternative Options:</strong> Similar products with different price-feature balances</li>
                </ul>
                
                <h2>Deal Timeline</h2>
                <p>Understanding the timing aspects of a deal:</p>
                <ul>
                  <li><strong>Deal Start:</strong> When the deal first appeared</li>
                  <li><strong>Expected End:</strong> Predicted end date based on similar deals</li>
                  <li><strong>Stock Level:</strong> Estimated remaining inventory</li>
                  <li><strong>Purchase Window:</strong> Recommended timeframe to make a decision</li>
                </ul>
                
                <h2>Understanding Confidence Ratings</h2>
                <p>RebatOn provides confidence ratings for its analyses:</p>
                <ul>
                  <li><strong>High Confidence:</strong> Based on extensive data and clear patterns</li>
                  <li><strong>Medium Confidence:</strong> Based on moderate data with some predictable patterns</li>
                  <li><strong>Low Confidence:</strong> Limited data or unpredictable product category</li>
                </ul>
                
                <h2>Next Steps</h2>
                <p>To continue learning about RebatOn&apos;s features, check out these guides:</p>
                <ul>
                  <li><a href="/how-to-use/sharing-deals">Sharing Deals</a></li>
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