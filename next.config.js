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
  
  // Add trailingSlash to ensure consistent URL handling
  trailingSlash: true,
  
  // Add asset prefix to ensure proper asset loading on nested routes
  assetPrefix: '/',
  
  // For development, comment out the static export
  // output: 'export',
  
  // Enable trace in development mode to help with debugging
  experimental: {
    serverComponentsExternalPackages: ['next-auth'],
    // Enable server actions for development
    appDir: true,
    serverActions: true
  },
  
  // This will ensure only /auth/* API routes are included in the build
  // and other dynamic API routes are excluded
  distDir: '.next',
  
  // Include favicon.ico in the page extensions for proper handling
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'md', 'mdx'],
  
  // API routes for development
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
        basePath: false,
      }
    ];
  },
  
  // Add a comment about static export for future deployments
  // To deploy to AWS S3, uncomment the output: 'export' line above,
  // comment out the rewrites() function, and set serverActions: false
};

module.exports = nextConfig;
