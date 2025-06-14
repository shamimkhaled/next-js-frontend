/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seashell-app-4gkvz.ondigitalocean.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Fix for fs module issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  // Experimental features for Turbopack
  experimental: {
    turbo: {
      resolveAlias: {
        fs: false,
        path: false,
        os: false,
      },
    },
  },
};

export default nextConfig;