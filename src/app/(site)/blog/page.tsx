"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import { mockBlogPosts } from '@/data/mockBlogPosts';
import type { BlogPost } from '@/data/mockBlogPosts';
import SectionTitle from "@/components/Common/SectionTitle";

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags from all posts
  const allTags = Array.from(new Set(mockBlogPosts.flatMap(post => post.tags)));

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? mockBlogPosts.filter(post => post.tags.includes(selectedTag))
    : mockBlogPosts;

  return (
    <section className="pb-20 pt-40">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionTitle
          subTitle="Latest Updates"
          title="Deal Finding Insights & News"
          paragraph="Stay updated with the latest insights on AI-powered deal finding, smart shopping strategies, and market trends."
        />

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              !selectedTag
                ? 'bg-purple text-white'
                : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                selectedTag === tag
                  ? 'bg-purple text-white'
                  : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block bg-white/[0.05] rounded-xl overflow-hidden hover:bg-white/[0.1] transition group"
              >
                {/* Image */}
                <div className="aspect-video relative">
                  <Image
                    src={post.mainImage}
                    alt={post.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/[0.05] rounded text-xs text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-purple transition">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4">
                    {post.metadata.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
