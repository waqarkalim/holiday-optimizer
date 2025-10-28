import type { NextConfig } from 'next';

if (process.env.NODE_ENV === 'production') {
  process.env.NEXT_FORCE_WEBPACK = '1';
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
