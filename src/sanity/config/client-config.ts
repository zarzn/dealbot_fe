import { integrations } from "../../../integrations.config";

// Only create config if Sanity is enabled and project ID is valid
const config = integrations.isSanityEnabled && 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "your-actual-project-id"
  ? {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-06',
      useCdn: process.env.NODE_ENV === 'production',
    }
  : null;

export default config;
