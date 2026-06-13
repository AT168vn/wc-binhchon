import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone', //Tạo ra một thư mục .next/standalone chứa toàn bộ mã server và dependency cần thiết
  
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

  // Tối ưu images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
