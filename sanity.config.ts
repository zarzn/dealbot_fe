import schemas from "@/sanity/schemas";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  title: process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || "AI Agentic Deals System",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-02-06",
  basePath: "/admin",
  plugins: [structureTool()],
  schema: { types: schemas },
});

export default config;
