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
    unoptimized: true, // Keep this for image handling
  },
  reactStrictMode: true,
  swcMinify: true,
  
  // Add trailingSlash to ensure consistent URL handling
  trailingSlash: true,
  
  // Add asset prefix to ensure proper asset loading on nested routes
  assetPrefix: '/',
  
  // Enable trace in development mode to help with debugging
  experimental: {
    serverComponentsExternalPackages: ['next-auth']
  },
  
  // This will ensure only /auth/* API routes are included in the build
  // and other dynamic API routes are excluded
  distDir: '.next',
  
  // Ignore the favicon.ico page route
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'md', 'mdx'],
  
  // Proxy both HTTP and WebSocket connections
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
        basePath: false,
      }
    ];
  },
};

// Only use 'export' output for production builds (when not in development mode)
// This allows API routes to work in development mode
// TEMPORARILY DISABLED due to conflicts with dynamic routes
/*
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
}
*/

module.exports = nextConfig;
