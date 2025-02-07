import { integrations } from "../../../integrations.config";

const config = integrations.isSanityEnabled
  ? {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-02-06',
      useCdn: process.env.NODE_ENV === 'production',
    }
  : null;

export default config;
