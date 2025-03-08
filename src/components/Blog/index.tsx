import { getPosts } from "@/sanity/sanity-utils";
import { Blog } from "@/types/blog";
import SectionTitle from "../Common/SectionTitle";
import SingleBlog from "./SingleBlog";
import { integrations } from "../../../integrations.config";

export default async function BlogSection() {
  if (!integrations.isSanityEnabled) {
    return null;
  }

  const posts = await getPosts();

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-25">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionTitle
          subTitle="Read Our Latest Blogs"
          title="Latest Blogs & News"
          paragraph="Stay informed about market trends, deal strategies, and AI-powered insights to maximize your savings and investment opportunities in today's fast-moving markets."
        />

        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((blog: Blog, index: number) => (
            <SingleBlog key={index} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
}
