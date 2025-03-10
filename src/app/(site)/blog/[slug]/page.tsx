import SingleBlog from "@/components/Blog/SingleBlog";
import Breadcrumb from "@/components/Breadcrumb";
import { getPost, getPosts, imageBuilder } from "@/sanity/sanity-utils";
import { Blog } from "@/types/blog";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { slug } = params;
  const post = await getPost(slug);
  const siteURL = process.env.SITE_URL;
  const siteName = process.env.SITE_NAME;
  const authorName = process.env.AUTHOR_NAME;

  if (!post) {
    return {
      title: "Not Found",
      description: "No blog article has been found",
    };
  }

  return {
    title: `${post.title || "Single Post Page"} | ${siteName || ""}`,
    description: post.metadata ? `${post.metadata.slice(0, 136)}...` : "",
    author: authorName || "",

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

    openGraph: {
      title: `${post.title || ""} | ${siteName || ""}`,
      description: post.metadata || "",
      url: `${siteURL || ""}${post.slug?.current ? `/blog/${post.slug.current}` : ""}`,
      siteName: siteName || "",
      images: post.mainImage ? [
        {
          url: post.mainImage ? imageBuilder(post.mainImage).url() : '',
          width: 1800,
          height: 1600,
          alt: post.title,
        },
      ] : [],
      locale: "en_US",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: `${post.title || ""} | ${siteName || ""}`,
      description: post.metadata ? `${post.metadata.slice(0, 136)}...` : "",
      creator: `@${authorName || ""}`,
      site: `@${siteName || ""}`,
      images: post.mainImage ? [imageBuilder(post.mainImage).url()] : [],
      url: `${siteURL || ""}${post.slug?.current ? `/blog/${post.slug.current}` : ""}`,
    },
  };
}

export default async function BlogDetails(props: Props) {
  const params = await props.params;
  const { slug } = params;
  const post = await getPost(slug);
  const posts = await getPosts();

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Post not found</h1>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageTitle="Blog Details" />

      <section className="pb-17.5 pt-20 lg:pb-22.5 lg:pt-25 xl:pb-27.5">
        <div className="relative mx-auto mb-10 aspect-[97/44] w-full max-w-[1170px] overflow-hidden rounded-2xl px-4 sm:px-8 md:rounded-3xl xl:px-0">
          {post.mainImage && (
            <Image
              src={imageBuilder(post.mainImage).url()}
              alt={post.title || ""}
              fill
            />
          )}
        </div>

        <div className="mx-auto w-full max-w-[1170px]">
          <div className="mx-auto max-w-[870px]">
            <div className="mb-7.5 flex flex-wrap items-center justify-between gap-5">
              <div className="flex flex-wrap items-center gap-2.5">
                {post?.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="cursor-pointer rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-[3px] text-xs font-medium duration-300 ease-out hover:border-white/25 hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4.5">
                <div className="flex cursor-pointer flex-wrap items-center gap-2 duration-300 ease-in hover:text-white">
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 8.75C7.65625 8.75 5.78125 6.90625 5.78125 4.65625C5.78125 2.40625 7.65625 0.5625 10 0.5625C12.3438 0.5625 14.2188 2.40625 14.2188 4.65625C14.2188 6.90625 12.3438 8.75 10 8.75ZM10 1.96875C8.4375 1.96875 7.1875 3.1875 7.1875 4.65625C7.1875 6.125 8.4375 7.34375 10 7.34375C11.5625 7.34375 12.8125 6.125 12.8125 4.65625C12.8125 3.1875 11.5625 1.96875 10 1.96875Z"
                      fill=""
                    />
                    <path
                      d="M16.5938 19.4688C16.2188 19.4688 15.875 19.1562 15.875 18.75V17.8438C15.875 14.5938 13.25 11.9688 10 11.9688C6.75 11.9688 4.125 14.5938 4.125 17.8438V18.75C4.125 19.125 3.8125 19.4688 3.40625 19.4688C3 19.4688 2.6875 19.1562 2.6875 18.75V17.8438C2.6875 13.8125 5.96875 10.5625 9.96875 10.5625C13.9688 10.5625 17.25 13.8437 17.25 17.8438V18.75C17.2813 19.125 16.9688 19.4688 16.5938 19.4688Z"
                      fill=""
                    />
                  </svg>

                  <Link href={`/blog/author/${post?.author?.slug?.current}`} className="text-sm font-medium">
                    {post?.author?.name}
                  </Link>
                </div>
                <div className="flex cursor-pointer flex-wrap items-center gap-2 duration-300 ease-in hover:text-white">
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.5 3.3125H15.875V2.625C15.875 2.25 15.5625 1.90625 15.1562 1.90625C14.75 1.90625 14.4375 2.21875 14.4375 2.625V3.3125H5.53125V2.625C5.53125 2.25 5.21875 1.90625 4.8125 1.90625C4.40625 1.90625 4.09375 2.21875 4.09375 2.625V3.3125H2.5C1.4375 3.3125 0.53125 4.1875 0.53125 5.28125V16.1563C0.53125 17.2188 1.40625 18.125 2.5 18.125H17.5C18.5625 18.125 19.4687 17.25 19.4687 16.1563V5.25C19.4687 4.1875 18.5625 3.3125 17.5 3.3125ZM1.96875 9.125H4.625V12.2188H1.96875V9.125ZM6.03125 9.125H9.3125V12.2188H6.03125V9.125ZM9.3125 13.625V16.6875H6.03125V13.625H9.3125ZM10.7187 13.625H14V16.6875H10.7187V13.625ZM10.7187 12.2188V9.125H14V12.2188H10.7187ZM15.375 9.125H18.0312V12.2188H15.375V9.125ZM2.5 4.71875H4.125V5.375C4.125 5.75 4.4375 6.09375 4.84375 6.09375C5.25 6.09375 5.5625 5.78125 5.5625 5.375V4.71875H14.5V5.375C14.5 5.75 14.8125 6.09375 15.2187 6.09375C15.625 6.09375 15.9375 5.78125 15.9375 5.375V4.71875H17.5C17.8125 4.71875 18.0625 4.96875 18.0625 5.28125V7.71875H1.96875V5.28125C1.96875 4.96875 2.1875 4.71875 2.5 4.71875ZM1.96875 16.125V13.5938H4.625V16.6563H2.5C2.1875 16.6875 1.96875 16.4375 1.96875 16.125ZM17.5 16.6875H15.375V13.625H18.0312V16.1563C18.0625 16.4375 17.8125 16.6875 17.5 16.6875Z"
                      fill=""
                    />
                  </svg>

                  <span className="text-sm font-medium">
                    {new Date(post?.publishedAt!)
                      .toDateString()
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="mb-7.5 text-[34px] font-semibold leading-[45px] text-white">
              {post?.title}
            </h1>

            <div className="blog-details mb-12">
              <PortableText value={post?.body || []} />
            </div>

            <div className="flex items-center gap-4">
              <p className="font-medium">Share This Post:</p>
              <div className="flex items-center gap-5">
                <a
                  aria-label="social icon"
                  href="#"
                  className="duration-300 ease-in hover:text-white"
                >
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 21.9506C18.0533 21.4489 22 17.1853 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 16.8379 5.43552 20.8734 10 21.8V16H7V13H10V9.79586C10 7.47449 11.9695 5.64064 14.285 5.80603L17 5.99996V8.99996H15C13.8954 8.99996 13 9.89539 13 11V13H17L16 16H13V21.9506Z"
                      fill=""
                    />
                  </svg>
                </a>

                <a
                  aria-label="social icon"
                  href="#"
                  className="duration-300 ease-in hover:text-white"
                >
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.6125 21.5249C16.4625 21.5249 21.2625 14.2123 21.2625 7.87485C21.2625 7.72485 21.2625 7.46235 21.225 7.23735C22.1625 6.56235 22.9875 5.69985 23.625 4.76235C22.725 5.17485 21.825 5.39985 20.8875 5.51235C21.9 4.91235 22.65 3.97485 22.9875 2.84985C22.05 3.37485 21.075 3.78735 19.9125 4.01235C19.0125 3.07485 17.8125 2.47485 16.425 2.47485C13.7625 2.47485 11.5875 4.64985 11.5875 7.31235C11.5875 7.68735 11.625 8.06235 11.7 8.43735C7.8375 8.17485 4.3125 6.26235 1.9125 3.37485C1.5 4.12485 1.275 4.91235 1.275 5.77485C1.275 7.46235 2.1375 8.88735 3.45 9.74985C2.6625 9.71235 1.9125 9.48735 1.275 9.14985C1.275 9.18735 1.275 9.18735 1.275 9.18735C1.275 11.4748 2.925 13.4624 5.1 13.9124C4.6875 14.0249 4.2375 14.0623 3.9 14.0623C3.6 14.0623 3.2625 14.0248 3 13.9499C3.6375 15.8624 5.4 17.2499 7.5 17.2874C5.85 18.5624 3.7875 19.3498 1.575 19.3498C1.125 19.4249 0.75 19.3498 0.375 19.3123C2.4 20.7374 4.9125 21.5249 7.6125 21.5249Z"
                      fill="#"
                    />
                  </svg>
                </a>

                <a
                  aria-label="social icon"
                  href="#"
                  className="duration-300 ease-in hover:text-white"
                >
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_141_17422)">
                      <path
                        d="M21.9381 0.375H2.10059C1.16309 0.375 0.413086 1.125 0.413086 2.0625V21.9375C0.413086 22.8375 1.16309 23.625 2.10059 23.625H21.8631C22.8006 23.625 23.5506 22.875 23.5506 21.9375V2.025C23.6256 1.125 22.8756 0.375 21.9381 0.375ZM7.2756 20.1375H3.8631V9.075H7.2756V20.1375ZM5.5506 7.5375C4.4256 7.5375 3.56309 6.6375 3.56309 5.55C3.56309 4.4625 4.4631 3.5625 5.5506 3.5625C6.6381 3.5625 7.5381 4.4625 7.5381 5.55C7.5381 6.6375 6.7131 7.5375 5.5506 7.5375ZM20.2131 20.1375H16.8006V14.775C16.8006 13.5 16.7631 11.8125 15.0006 11.8125C13.2006 11.8125 12.9381 13.2375 12.9381 14.6625V20.1375H9.5256V9.075H12.8631V10.6125H12.9006C13.3881 9.7125 14.4756 8.8125 16.1631 8.8125C19.6506 8.8125 20.2881 11.0625 20.2881 14.1375V20.1375H20.2131Z"
                        fill=""
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_141_17422">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <h2 className="mb-10 mt-25 max-w-[579px] text-[34px] font-semibold leading-[45px] text-white">
            Related Articles
          </h2>

          <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.length > 0 &&
              posts
                .slice(0, 3)
                .map((blog: Blog) => <SingleBlog key={blog._id} blog={blog} />)}
          </div>
        </div>
      </section>
    </>
  );
}
