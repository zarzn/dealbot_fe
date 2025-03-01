import ImageUrlBuilder from "@sanity/image-url";
import { QueryParams, createClient, groq } from "next-sanity";
import clientConfig from "./config/client-config";
import { Blog } from "@/types/blog";
import {
  postQuery,
  postQueryBySlug,
  postQueryByTag,
  postQueryByAuthor,
} from "@/sanity/sanity-query";
import { integrations } from "../../integrations.config";

// Only create client if Sanity is enabled and config exists
const client = integrations.isSanityEnabled && clientConfig && 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "your-actual-project-id" ? 
  createClient(clientConfig) : null;

export async function sanityFetch<QueryResponse>({
  query,
  qParams,
  tags,
}: {
  query: string;
  qParams: QueryParams;
  tags: string[];
}): Promise<QueryResponse> {
  if (!integrations.isSanityEnabled || !client || !clientConfig) {
    console.log('Sanity is disabled or not configured. Skipping API call.');
    return [] as unknown as QueryResponse;
  }

  try {
    return await client.fetch<QueryResponse>(query, qParams, {
      cache: "force-cache",
      next: { tags },
    });
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return [] as unknown as QueryResponse;
  }
}

export async function getPosts(): Promise<Blog[]> {
  if (!integrations.isSanityEnabled || !client || !clientConfig) {
    return [];
  }

  try {
    const data = await sanityFetch<Blog[]>({
      query: postQuery,
      qParams: {},
      tags: ["post", "author"],
    });
    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPost(slug: string): Promise<Blog | null> {
  if (!integrations.isSanityEnabled || !client || !clientConfig) {
    return null;
  }

  try {
    const data = await sanityFetch<Blog>({
      query: postQueryBySlug,
      qParams: { slug },
      tags: ["post", "author"],
    });
    return data || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getPostsByTag(tag: string): Promise<Blog[]> {
  if (!integrations.isSanityEnabled || !client || !clientConfig) {
    return [];
  }

  try {
    const data = await sanityFetch<Blog[]>({
      query: postQueryByTag,
      qParams: { slug: tag },
      tags: ["post", "author"],
    });
    return data || [];
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

export async function getPostsByAuthor(author: string): Promise<Blog[]> {
  if (!integrations.isSanityEnabled || !client || !clientConfig) {
    return [];
  }

  try {
    const data = await sanityFetch<Blog[]>({
      query: postQueryByAuthor,
      qParams: { slug: author },
      tags: ["post", "author"],
    });
    return data || [];
  } catch (error) {
    console.error('Error fetching posts by author:', error);
    return [];
  }
}

export function imageBuilder(source: any) {
  if (!integrations.isSanityEnabled || !client || !clientConfig) {
    return null;
  }
  try {
    return ImageUrlBuilder(clientConfig).image(source);
  } catch (error) {
    console.error('Error building image:', error);
    return null;
  }
}
