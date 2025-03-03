const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

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
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
        process: require.resolve('process/browser'),
      };
    }
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
