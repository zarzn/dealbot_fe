import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "src/markdown/docs");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  try {
    const realSlug = slug.replace(/\.mdx$/, "");
    const fullPath = join(postsDirectory, `${realSlug}.mdx`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      // Return a default object with minimal fields
      const defaultItems: any = {};
      fields.forEach((field) => {
        if (field === "slug") {
          defaultItems[field] = realSlug;
        }
        if (field === "content") {
          defaultItems[field] = "# Not Found\n\nThe requested documentation page could not be found.";
        }
        if (field === "title") {
          defaultItems[field] = "Not Found";
        }
        if (field === "author") {
          defaultItems[field] = "System";
        }
      });
      return defaultItems;
    }
    
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    type Items = {
      [key: string]: string;
    };

    const items: Items = {};

    // Ensure only the minimal needed data is exposed
    fields.forEach((field) => {
      if (field === "slug") {
        items[field] = realSlug;
      }
      if (field === "content") {
        items[field] = content;
      }

      if (typeof data[field] !== "undefined") {
        items[field] = data[field];
      }
    });

    return items;
  } catch (error) {
    console.error(`Error in getPostBySlug for slug "${slug}":`, error);
    // Return a default object with minimal fields
    const errorItems: any = {};
    fields.forEach((field) => {
      if (field === "slug") {
        errorItems[field] = slug;
      }
      if (field === "content") {
        errorItems[field] = "# Error\n\nAn error occurred while loading this documentation page.";
      }
      if (field === "title") {
        errorItems[field] = "Error";
      }
      if (field === "author") {
        errorItems[field] = "System";
      }
    });
    return errorItems;
  }
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
}
