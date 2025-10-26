import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: '/holidays',
        destination: '/',
        permanent: true,
      },
      {
        source: '/holidays/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
