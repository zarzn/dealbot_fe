import { getPosts } from "@/sanity/sanity-utils";
import { Blog } from "@/types/blog";
import SectionTitle from "@/components/Common/SectionTitle";
import SingleBlog from "@/components/Blog/SingleBlog";
import { integrations } from "../../../../integrations.config";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | AI Tool - Next.js Template for AI Tools",
  description: "This is Blog page for AI Tool",
  // other metadata
};

export default async function BlogPage() {
  if (!integrations.isSanityEnabled) {
    redirect('/');
  }

  const posts = await getPosts();

  return (
    <>
      <section className="pb-20 pt-40">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <SectionTitle
            subTitle="Our Blog"
            title="Latest Blogs & News"
            paragraph="Build SaaS AI applications using OpenAI and Next.js, this kit comes with pre-configured and pre-built examples."
          />

          <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((blog: Blog, index: number) => (
              <SingleBlog key={index} blog={blog} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
