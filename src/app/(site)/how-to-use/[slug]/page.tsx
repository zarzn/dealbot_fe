import DocsContent from "@/components/Docs/DocsContent";
import DocsStyles from "@/components/Docs/DocsStyles";
import SidebarLink from "@/components/Docs/SidebarLink";
import { getAllPosts, getPostBySlug } from "@/libs/markdown";
import markdownToHtml from "@/libs/markdownToHtml";
import DocsClientWrapper from "./client-wrapper";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const post = getPostBySlug(params.slug, ["title", "author", "content"]);
  const siteName = process.env.SITE_NAME;
  const authorName = process.env.AUTHOR_NAME;

  if (post) {
    return {
      title: `${post.title || "How to Use"} | ${siteName}`,
      description: `${post.metadata?.slice(0, 136)}...`,
      author: authorName,

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No guide has been found",
    };
  }
}

// Function to sort posts in the correct order
const sortPosts = (posts: any[]) => {
  // Define the order of documentation pages
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
  
  // Create a copy of posts to sort
  return [...posts].sort((a, b) => {
    const indexA = order.indexOf(a.slug);
    const indexB = order.indexOf(b.slug);
    
    // If both posts are in the order array, sort by their position
    if (indexA >= 0 && indexB >= 0) {
      return indexA - indexB;
    }
    
    // If only one post is in the order array, prioritize it
    if (indexA >= 0) return -1;
    if (indexB >= 0) return 1;
    
    // If neither post is in the order array, maintain original order
    return 0;
  });
};

export default async function GuidePost(props: Props) {
  const params = await props.params;
  const allPosts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);
  const sortedPosts = sortPosts(allPosts);
  const post = getPostBySlug(params.slug, ["title", "author", "content"]);
  const content = await markdownToHtml(post.content || "");

  return (
    <DocsClientWrapper>
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
                <DocsContent content={content} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </DocsClientWrapper>
  );
} 