"use client";

import React from 'react';
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllClientPosts, sortClientPosts } from "@/libs/client-docs";

export default function FAQPage() {
  // Get all posts for the sidebar using client-compatible function
  const allPosts = getAllClientPosts(["title", "date", "excerpt", "slug"]);
  const sortedPosts = sortClientPosts(allPosts);

  // Use effect to set document title
  React.useEffect(() => {
    document.title = "Frequently Asked Questions | RebatOn";
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
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to the most common questions about RebatOn. If you don&apos;t find what you&apos;re looking for, please contact our support team.</p>
                
                <h2>General Questions</h2>
                
                <h3>What is RebatOn?</h3>
                <p>RebatOn is an AI-powered deal aggregator and monitoring system that helps you find the best deals across multiple markets. It uses artificial intelligence to analyze deals, track prices, and alert you when products match your specific goals.</p>
                
                <h3>How does RebatOn work?</h3>
                <p>RebatOn works by combining AI algorithms with real-time market data to:</p>
                <ol>
                  <li>Search for deals across multiple marketplaces</li>
                  <li>Analyze deal quality and determine if the deal is actually good</li>
                  <li>Match deals to your specific goals and preferences</li>
                  <li>Monitor price changes and notify you of significant discounts</li>
                  <li>Provide insights and recommendations on purchase timing</li>
                </ol>
                
                <h3>Is RebatOn free to use?</h3>
                <p>RebatOn offers both free and premium features. Basic functionality is available for free, while advanced features like AI analysis, unlimited goals, and priority alerts require tokens, which can be earned through platform activity or purchased.</p>
                
                <h2>Account Questions</h2>
                
                <h3>How do I create an account?</h3>
                <p>To create a RebatOn account:</p>
                <ol>
                  <li>Visit the RebatOn website at rebaton.ai</li>
                  <li>Click &quot;Sign Up&quot; in the top-right corner</li>
                  <li>Enter your email address</li>
                  <li>Create a secure password</li>
                  <li>Verify your email address through the confirmation link</li>
                  <li>Complete your profile information</li>
                </ol>
                
                <h3>How do I reset my password?</h3>
                <p>To reset your password:</p>
                <ol>
                  <li>Go to the login page</li>
                  <li>Click &quot;Forgot Password?&quot;</li>
                  <li>Enter your email address</li>
                  <li>Check your email for a password reset link</li>
                  <li>Create and confirm your new password</li>
                </ol>
                
                <h3>Can I use social media to sign up?</h3>
                <p>Yes, RebatOn supports sign-up and login with Google and Facebook accounts. This provides a faster registration process and eliminates the need to remember another password.</p>
                
                <h2>Deal Questions</h2>
                
                <h3>How does RebatOn find deals?</h3>
                <p>RebatOn sources deals through multiple channels:</p>
                <ul>
                  <li>Direct API integrations with major marketplaces</li>
                  <li>Partnerships with deal aggregators and affiliate networks</li>
                  <li>User-submitted deals (verified by our team)</li>
                  <li>AI-powered web monitoring of popular deal sources</li>
                  <li>Price tracking across multiple retailers</li>
                </ul>
                
                <h3>How accurate are the deal prices?</h3>
                <p>RebatOn strives for maximum accuracy with real-time price updates. However, prices can change rapidly, especially during high-demand events like Black Friday. We recommend always confirming the final price at checkout.</p>
                
                <h3>How often are deals updated?</h3>
                <p>Deal information is updated continuously throughout the day. High-priority deals are refreshed more frequently, typically every 30 minutes to 2 hours, depending on the marketplace and product category.</p>
                
                <h2>Goal Questions</h2>
                
                <h3>What is a deal goal?</h3>
                <p>A deal goal is your specific criteria for finding a product. Goals can include:</p>
                <ul>
                  <li>Product type or exact item</li>
                  <li>Price range</li>
                  <li>Discount percentage</li>
                  <li>Preferred retailers</li>
                  <li>Must-have features</li>
                  <li>Quality or rating requirements</li>
                </ul>
                <p>Once set, RebatOn continuously searches for deals matching these criteria.</p>
                
                <h3>How many goals can I create?</h3>
                <p>Free users can create up to 3 active goals simultaneously. Premium users can create unlimited goals based on their token balance, with each active goal consuming a small number of tokens per day for monitoring.</p>
                
                <h3>How do I edit or delete a goal?</h3>
                <p>To edit or delete a goal:</p>
                <ol>
                  <li>Navigate to your Dashboard</li>
                  <li>Select the &quot;Goals&quot; tab</li>
                  <li>Find the goal you want to modify</li>
                  <li>Click the &quot;Edit&quot; or &quot;Delete&quot; button</li>
                  <li>Confirm your changes</li>
                </ol>
                
                <h2>Token Questions</h2>
                
                <h3>What are tokens used for?</h3>
                <p>Tokens are the platform&apos;s digital currency and are used for:</p>
                <ul>
                  <li>Creating and maintaining active goals</li>
                  <li>Running AI analysis on specific deals</li>
                  <li>Accessing premium features and detailed reports</li>
                  <li>Setting up advanced notifications</li>
                  <li>Accessing historical price data and predictions</li>
                </ul>
                
                <h3>How do I earn tokens?</h3>
                <p>You can earn tokens through various activities:</p>
                <ul>
                  <li>Daily logins (5 tokens)</li>
                  <li>Submitting verified deals (10-50 tokens)</li>
                  <li>Sharing deals with others (5 tokens per share)</li>
                  <li>Referring new users (100 tokens per referral)</li>
                  <li>Completing profile information (one-time 20 tokens)</li>
                  <li>Regular platform engagement</li>
                </ul>
                
                <h3>Can I purchase tokens?</h3>
                <p>Yes, tokens can be purchased directly through your account dashboard. We offer various packages, with discounts for larger purchases. Payment is secured through industry-standard encryption.</p>
                
                <h2>Notification Questions</h2>
                
                <h3>How do I set up notifications?</h3>
                <p>To set up notifications:</p>
                <ol>
                  <li>Go to your account settings</li>
                  <li>Select the &quot;Notifications&quot; tab</li>
                  <li>Choose your preferred notification methods (email, mobile, browser)</li>
                  <li>Set notification frequency and preferences</li>
                  <li>For deal-specific notifications, set these when creating or editing a goal</li>
                </ol>
                
                <h3>Why am I not receiving notifications?</h3>
                <p>If you&apos;re not receiving notifications, check:</p>
                <ul>
                  <li>Your notification settings are enabled</li>
                  <li>Your email address is correct</li>
                  <li>Notification emails aren&apos;t in your spam folder</li>
                  <li>Browser notifications are allowed if using web notifications</li>
                  <li>You have sufficient tokens for premium notifications</li>
                </ul>
                
                <h2>Technical Questions</h2>
                
                <h3>Which browsers are supported?</h3>
                <p>RebatOn supports all modern browsers, including:</p>
                <ul>
                  <li>Google Chrome (recommended)</li>
                  <li>Mozilla Firefox</li>
                  <li>Microsoft Edge</li>
                  <li>Safari</li>
                  <li>Opera</li>
                </ul>
                <p>For optimal performance, we recommend keeping your browser updated to the latest version.</p>
                
                <h3>Is there a mobile app?</h3>
                <p>Yes, RebatOn offers mobile apps for both iOS and Android devices. You can download them from the Apple App Store or Google Play Store. The mobile apps provide all core functionality with a streamlined interface optimized for smaller screens.</p>
                
                <h3>How is my data protected?</h3>
                <p>RebatOn takes data security seriously:</p>
                <ul>
                  <li>All connections are secured with SSL/TLS encryption</li>
                  <li>Personal data is stored in compliance with GDPR and privacy regulations</li>
                  <li>We never sell your personal information to third parties</li>
                  <li>Password authentication uses industry-standard hashing algorithms</li>
                  <li>Regular security audits and updates ensure platform protection</li>
                </ul>
                
                <h2>Support Questions</h2>
                
                <h3>How do I contact customer support?</h3>
                <p>You can reach our customer support team through multiple channels:</p>
                <ul>
                  <li>Email: support@rebaton.ai</li>
                  <li>Live Chat: Available on our website during business hours</li>
                  <li>Help Center: <a href="/contact-support">Contact Support Page</a></li>
                  <li>Social Media: Direct messages on our official accounts</li>
                </ul>
                
                <h3>What are your support hours?</h3>
                <p>Our customer support team is available Monday through Friday, 9 AM to 8 PM Eastern Time. Weekend support is available for priority issues. Email support is monitored 24/7 with responses typically provided within 24 hours.</p>
                
                <h2>Next Steps</h2>
                <p>To learn more about RebatOn features, check out these guides:</p>
                <ul>
                  <li><a href="/how-to-use/getting-started">Getting Started</a></li>
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