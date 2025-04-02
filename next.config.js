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
  
  // Disable trailing slashes for better SPA compatibility
  trailingSlash: false,
  
  // Remove asset prefix that could be causing SPA navigation issues
  // assetPrefix: '/',
  
  // Enable static export for production deployment to S3/CloudFront
  // We only want to use 'export' in production
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // Disable server actions for static export in production only
  experimental: {
    // Keep appDir enabled
    appDir: true,
    
    // Only enable server features in development
    ...(process.env.NODE_ENV !== 'production' ? {
      serverComponentsExternalPackages: ['next-auth'],
      serverActions: true
    } : {})
  },
  
  // This will ensure only /auth/* API routes are included in the build
  // and other dynamic API routes are excluded
  distDir: '.next',
  
  // Include favicon.ico in the page extensions for proper handling
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'md', 'mdx'],
};

// Only add rewrites in development mode (and explicitly check for output option)
if (process.env.NODE_ENV !== 'production' && nextConfig.output !== 'export') {
  nextConfig.rewrites = async () => {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
        basePath: false,
      }
    ];
  };
}

module.exports = nextConfig;
