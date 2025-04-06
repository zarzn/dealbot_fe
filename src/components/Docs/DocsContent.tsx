"use client";
import Prism from "prismjs";
import { useEffect, useRef } from "react";
import React from 'react';

interface DocsContentProps {
  content: string;
}

const DocsContent: React.FC<DocsContentProps> = ({ content }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const rootRef = useRef(null);
  useEffect(() => {
    // @ts-ignore
    const allPres = rootRef?.current.querySelectorAll("pre");

    for (const pre of allPres) {
      const code = pre.firstElementChild;

      if (!code || !/code/i.test(code.tagName)) {
        continue;
      }

      pre.appendChild(createCopyButton(code));
    }

    return;
  });

  // Add a debug section at the bottom if the content appears to be empty or error
  const hasValidContent = content && 
    content.length > 50 && 
    !content.includes('Not Found') && 
    !content.includes('Error occurred');
  
  return (
    <div className="docs-content">
      {/* Main content div */}
      <div ref={rootRef}>
        <div
          className="blog-details"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      {/* Debug info (only shown when content appears to be invalid) */}
      {!hasValidContent && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded p-4 mt-8">
          <h3 className="text-amber-400 text-lg font-medium mb-2">Content Debug Information</h3>
          <p className="text-amber-200/80 text-sm">
            The documentation content appears to be incomplete or not found. This could be due to:
          </p>
          <ul className="list-disc list-inside text-amber-200/80 text-sm mt-2 space-y-1">
            <li>The slug in the URL not matching any documentation file</li>
            <li>Issues with the client-side routing system</li>
            <li>Cache issues with static file generation</li>
          </ul>
          <div className="mt-4 border-t border-amber-500/30 pt-3">
            <p className="text-amber-200/80 text-xs font-mono">
              Content length: {content?.length || 0} characters
            </p>
            <p className="text-amber-200/80 text-xs font-mono">
              Content preview: {content?.substring(0, 100)}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsContent;

function createCopyButton(codeEl: any) {
  const button = document.createElement("button");
  button.classList.add("prism-copy-button");
  button.textContent = "Copy";

  button.addEventListener("click", () => {
    if (button.textContent === "Copied") {
      return;
    }
    navigator.clipboard.writeText(codeEl.textContent || "");
    button.textContent = "Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Copy";
      button.disabled = false;
    }, 3000);
  });

  return button;
}
