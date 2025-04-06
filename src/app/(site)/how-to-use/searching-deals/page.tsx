"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function SearchingDealsPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Searching for Deals | RebatOn";
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
                <h1>Searching for Deals</h1>
                <p>RebatOn offers powerful search capabilities to help you find the best deals across multiple marketplaces. This guide will show you how to make the most of our search features.</p>
                
                <h2>Basic Search</h2>
                <p>To perform a basic search:</p>
                <ol>
                  <li>Enter a product name, brand, or description in the search bar</li>
                  <li>Press Enter or click the search icon</li>
                  <li>Browse through the results</li>
                </ol>
                
                <h2>Advanced Search Techniques</h2>
                <p>Make your searches more effective with these techniques:</p>
                <ul>
                  <li><strong>Quotation marks:</strong> Use &quot;exact phrase&quot; to search for an exact sequence of words</li>
                  <li><strong>Minus sign:</strong> Use -word to exclude results containing that word</li>
                  <li><strong>OR operator:</strong> Use term1 OR term2 to find results with either term</li>
                  <li><strong>Model numbers:</strong> Include specific model numbers for precise matches</li>
                </ul>
                
                <h2>Using Filters</h2>
                <p>Narrow down your search results with these filters:</p>
                <ul>
                  <li><strong>Price Range:</strong> Set minimum and maximum prices</li>
                  <li><strong>Retailer:</strong> Select specific stores to search</li>
                  <li><strong>Condition:</strong> Filter by new, used, or refurbished</li>
                  <li><strong>Rating:</strong> Filter by minimum customer rating</li>
                  <li><strong>Discount Percentage:</strong> Filter by minimum discount percentage</li>
                  <li><strong>Deal Type:</strong> Filter by flash sales, clearance, coupons, etc.</li>
                </ul>
                
                <h2>Sorting Results</h2>
                <p>Organize your search results by:</p>
                <ul>
                  <li><strong>Price (low to high):</strong> Find the cheapest options first</li>
                  <li><strong>Price (high to low):</strong> Find premium options first</li>
                  <li><strong>Discount percentage:</strong> Find the biggest savings first</li>
                  <li><strong>Popularity:</strong> Find what other users are viewing</li>
                  <li><strong>Rating:</strong> Find the highest-rated products first</li>
                  <li><strong>Newest:</strong> Find the most recently listed deals</li>
                </ul>
                
                <h2>Saving Searches</h2>
                <p>Save your favorite searches for quick access:</p>
                <ol>
                  <li>Perform your search with desired filters</li>
                  <li>Click the &quot;Save Search&quot; button</li>
                  <li>Give your saved search a name</li>
                  <li>Access your saved searches from your dashboard</li>
                </ol>
                
                <h2>Product Comparison</h2>
                <p>Compare similar products to make informed decisions:</p>
                <ol>
                  <li>Select products you want to compare by clicking the comparison checkbox</li>
                  <li>Click &quot;Compare Selected&quot; button when ready</li>
                  <li>View side-by-side comparison of features, prices, and ratings</li>
                </ol>
                
                <h2>Next Steps</h2>
                <p>Once you&apos;ve mastered searching, check out these related guides:</p>
                <ul>
                  <li><a href="/how-to-use/deal-goals">Setting Deal Goals</a></li>
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