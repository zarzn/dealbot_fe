/**
 * Client-side compatible documentation data
 * This file provides static documentation data for client components
 * without relying on Node.js fs module
 */

export interface DocPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  date?: string;
}

// Static list of documentation posts
const documentationPosts: DocPost[] = [
  {
    slug: "getting-started",
    title: "Getting Started with RebatOn",
    excerpt: "Welcome to RebatOn! Learn how to set up your account and start finding great deals.",
    date: "2023-09-01"
  },
  {
    slug: "searching-deals",
    title: "Searching for Deals",
    excerpt: "Learn how to use search features to find the best deals across multiple marketplaces.",
    date: "2023-09-02"
  },
  {
    slug: "deal-goals",
    title: "Setting Deal Goals",
    excerpt: "Learn how to set up deal goals to track products and get notified about price drops.",
    date: "2023-09-03"
  },
  {
    slug: "tracking-deals",
    title: "Tracking Deals",
    excerpt: "Learn how to track deals over time and monitor price changes for products you care about.",
    date: "2023-09-04"
  },
  {
    slug: "understanding-deal-analysis",
    title: "Understanding Deal Analysis",
    excerpt: "Learn how to interpret our deal analysis features to make informed purchasing decisions.",
    date: "2023-09-05"
  },
  {
    slug: "sharing-deals",
    title: "Sharing Deals",
    excerpt: "Learn how to share deals with friends and earn tokens through our referral system.",
    date: "2023-09-06"
  },
  {
    slug: "token-system",
    title: "Understanding the Token System",
    excerpt: "Learn how RebatOn tokens work and how to earn and use them to unlock premium features.",
    date: "2023-09-07"
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    excerpt: "Find solutions to common issues and learn how to get help when you need it.",
    date: "2023-09-08"
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    excerpt: "Answers to the most common questions about using RebatOn.",
    date: "2023-09-09"
  }
];

/**
 * Gets all documentation posts
 * @param fields Optional array of fields to include
 * @returns Array of documentation posts
 */
export function getAllClientPosts(fields: string[] = []): any[] {
  // If no fields specified, return all posts with all fields
  if (fields.length === 0) {
    return documentationPosts;
  }
  
  // Return only the requested fields
  return documentationPosts.map(post => {
    const filteredPost: Record<string, any> = {};
    
    fields.forEach(field => {
      if (field in post) {
        filteredPost[field] = post[field as keyof DocPost];
      }
    });
    
    return filteredPost;
  });
}

/**
 * Function to sort posts based on predefined order
 */
export function sortClientPosts(posts: any[]) {
  const order = [
    "getting-started",
    "searching-deals",
    "deal-goals",
    "tracking-deals",
    "understanding-deal-analysis",
    "sharing-deals",
    "token-system",
    "troubleshooting",
    "faq"
  ];
  
  return [...posts].sort((a, b) => {
    const indexA = order.indexOf(a.slug);
    const indexB = order.indexOf(b.slug);
    
    if (indexA >= 0 && indexB >= 0) {
      return indexA - indexB;
    }
    
    if (indexA >= 0) return -1;
    if (indexB >= 0) return 1;
    
    return 0;
  });
} 