"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function TroubleshootingPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Troubleshooting | RebatOn";
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
                <h1>Troubleshooting</h1>
                <p>Encountering issues with RebatOn? This guide provides solutions to common problems and steps to resolve them quickly.</p>
                
                <h2>Account Issues</h2>
                
                <h3>Can&apos;t Log In</h3>
                <p>If you&apos;re having trouble logging in:</p>
                <ol>
                  <li>Verify you&apos;re using the correct email address</li>
                  <li>Try resetting your password</li>
                  <li>Clear your browser cookies and cache</li>
                  <li>Try using a different browser</li>
                  <li>Check if your account has been locked due to suspicious activity</li>
                </ol>
                
                <h3>Email Verification Problems</h3>
                <p>If you haven&apos;t received a verification email:</p>
                <ul>
                  <li>Check your spam/junk folder</li>
                  <li>Wait up to 15 minutes for delivery</li>
                  <li>Request a new verification email from the login screen</li>
                  <li>Add noreply@rebaton.ai to your contacts/safe senders list</li>
                </ul>
                
                <h2>Deal Search Issues</h2>
                
                <h3>No Search Results</h3>
                <p>If your searches return no results:</p>
                <ul>
                  <li>Check your spelling</li>
                  <li>Use fewer keywords in your search</li>
                  <li>Broaden your search criteria</li>
                  <li>Remove filters that might be too restrictive</li>
                  <li>Try searching by category instead of specific terms</li>
                </ul>
                
                <h3>Deal Search Errors</h3>
                <p>If you encounter errors during search:</p>
                <ul>
                  <li>Verify you have sufficient tokens for search operations</li>
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Wait a few minutes and try again (API rate limits may apply)</li>
                </ul>
                
                <h2>Goal Tracking Issues</h2>
                
                <h3>Goals Not Updating</h3>
                <p>If your goals aren&apos;t showing new deals or updating properly:</p>
                <ul>
                  <li>Check that your goal is set to &quot;Active&quot; status</li>
                  <li>Verify you have sufficient tokens for goal tracking</li>
                  <li>Ensure your goal criteria aren&apos;t too restrictive</li>
                  <li>Try refreshing your goal manually from the dashboard</li>
                  <li>Wait 24 hours for the system to complete a full scan cycle</li>
                </ul>
                
                <h3>Incorrect Matches</h3>
                <p>If your goal is showing irrelevant matches:</p>
                <ul>
                  <li>Review and refine your goal criteria</li>
                  <li>Add more specific keywords or requirements</li>
                  <li>Set a narrower price range</li>
                  <li>Mark irrelevant deals as &quot;Not Relevant&quot; to improve future matching</li>
                </ul>
                
                <h2>Token Issues</h2>
                
                <h3>Missing Tokens</h3>
                <p>If your token balance seems incorrect:</p>
                <ol>
                  <li>Check your transaction history for recent expenditures</li>
                  <li>Verify auto-renewal settings for goals and alerts</li>
                  <li>Check if any tokens have expired</li>
                  <li>Log out and log back in to refresh your balance</li>
                  <li>Contact support if you believe there&apos;s an accounting error</li>
                </ol>
                
                <h3>Token Purchases Not Processing</h3>
                <p>If token purchases aren&apos;t completing:</p>
                <ul>
                  <li>Verify your payment method is valid and has sufficient funds</li>
                  <li>Check if your bank is blocking the transaction</li>
                  <li>Try a different payment method</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Wait 30 minutes and check your balance again</li>
                </ul>
                
                <h2>Notification Issues</h2>
                
                <h3>Not Receiving Notifications</h3>
                <p>If you&apos;re not getting notifications:</p>
                <ol>
                  <li>Check your notification settings in your profile</li>
                  <li>Verify your email address is correct</li>
                  <li>Add our domain to your safe senders list</li>
                  <li>Check browser permissions for web notifications</li>
                  <li>Make sure you haven&apos;t unsubscribed from notifications</li>
                </ol>
                
                <h3>Too Many Notifications</h3>
                <p>If you&apos;re receiving too many notifications:</p>
                <ul>
                  <li>Adjust your notification frequency in settings</li>
                  <li>Set higher thresholds for price alerts</li>
                  <li>Consolidate multiple goals with similar criteria</li>
                  <li>Turn off notifications for less important goals</li>
                </ul>
                
                <h2>Technical Issues</h2>
                
                <h3>Slow Performance</h3>
                <p>If the platform is running slowly:</p>
                <ul>
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Close unused browser tabs and applications</li>
                  <li>Try using a different browser</li>
                  <li>Disable browser extensions that might interfere</li>
                </ul>
                
                <h3>Page Loading Errors</h3>
                <p>If pages aren&apos;t loading correctly:</p>
                <ul>
                  <li>Refresh the page</li>
                  <li>Check if the site is down using a service like DownDetector</li>
                  <li>Clear your browser cache</li>
                  <li>Try accessing the site in incognito/private browsing mode</li>
                  <li>Try a different device or network</li>
                </ul>
                
                <h2>Contact Support</h2>
                <p>If you can&apos;t resolve your issue with the steps above, contact our support team:</p>
                <ul>
                  <li>Email: support@rebaton.ai</li>
                  <li>Live Chat: Available on the website during business hours</li>
                  <li>Help Center: <a href="/contact-support">Contact Support Page</a></li>
                </ul>
                
                <p>For critical issues, please include:</p>
                <ul>
                  <li>Your account email</li>
                  <li>Detailed description of the problem</li>
                  <li>Steps to reproduce the issue</li>
                  <li>Screenshots if applicable</li>
                  <li>Device and browser information</li>
                </ul>
                
                <h2>Next Steps</h2>
                <p>To learn more about RebatOn features, check out these guides:</p>
                <ul>
                  <li><a href="/how-to-use/faq">Frequently Asked Questions</a></li>
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