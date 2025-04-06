"use client";

export default function DocsStyles() {
  return (
    <style jsx global>{`
      .blog-details-docs h1 {
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        font-weight: 700;
      }
      .blog-details-docs h2 {
        font-size: 1.75rem;
        margin-top: 2.5rem;
        margin-bottom: 1.25rem;
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.5rem;
      }
      .blog-details-docs h3 {
        font-size: 1.5rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      .blog-details-docs p {
        margin-bottom: 1.25rem;
        line-height: 1.7;
      }
      .blog-details-docs ul, .blog-details-docs ol {
        margin-bottom: 1.5rem;
        margin-left: 1.25rem;
      }
      .blog-details-docs li {
        margin-bottom: 0.5rem;
        line-height: 1.7;
      }
      .blog-details-docs pre {
        margin-bottom: 1.5rem;
      }
      .blog-details-docs blockquote {
        border-left: 4px solid rgba(255, 255, 255, 0.2);
        padding-left: 1rem;
        margin-left: 0;
        margin-bottom: 1.5rem;
        font-style: italic;
      }
      .blog-details-docs hr {
        margin: 2rem 0;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .blog-details-docs a {
        color: #3b82f6;
        text-decoration: none;
      }
      .blog-details-docs a:hover {
        text-decoration: underline;
      }
      .blog-details-docs img {
        border-radius: 0.5rem;
        margin: 1.5rem 0;
      }
      .blog-details-docs table {
        width: 100%;
        margin-bottom: 1.5rem;
        border-collapse: collapse;
      }
      .blog-details-docs th, .blog-details-docs td {
        padding: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .blog-details-docs th {
        background-color: rgba(255, 255, 255, 0.05);
      }
    `}</style>
  );
} 