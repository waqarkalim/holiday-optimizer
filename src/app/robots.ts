import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ctoplanner.com';
  
  return {
    rules: [
      {
        // Allow major search engines
        userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp'],
        allow: '/',
        disallow: [
          '/api/',      // Protect API routes
          '/_next/',    // Protect Next.js system files
          '/static/',   // Protect static files if any
        ],
      },
      {
        // Block all other bots
        userAgent: '*',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Add sitemap for search engines
  };
} 