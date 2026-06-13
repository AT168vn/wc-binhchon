import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const githubPagesBasePath = '/wc-binhchon';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: githubPagesBasePath,
        assetPrefix: githubPagesBasePath,
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {
        output: 'standalone',
        images: {
          formats: ['image/webp', 'image/avif'],
          deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
          imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        },
      }),

  // Tối ưu development performance
  experimental: {
    optimizePackageImports: ['react-chartjs-2', 'chart.js'],
  },

  // Next.js 15 expects Turbopack options at the top-level, not under `experimental`.
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Không tùy chỉnh splitChunks trong dev — dễ gây lỗi chunk thiếu (MODULE_NOT_FOUND './nnnn.js')
  // khi Next/webpack tạo runtime. Tối ưu chart dùng optimizePackageImports ở trên là đủ.
};

export default nextConfig;
