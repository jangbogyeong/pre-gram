/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'placeholder.svg'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true,
  },
  experimental: {
    // Remove optimizeCss to fix the critters dependency issue
    scrollRestoration: true,
    optimisticClientCache: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
