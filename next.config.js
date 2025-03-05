/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during build
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.sanity.io',
      'source.unsplash.com',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
    unoptimized: true, // Required for static export
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Enable static export
};

module.exports = nextConfig;
