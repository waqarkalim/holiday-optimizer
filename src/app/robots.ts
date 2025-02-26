import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ctoplanner.com';
  
  return {
    rules: [
      {
        // Allow major search engines with specific directives
        userAgent: [
          'Googlebot', 
          'Bingbot', 
          'DuckDuckBot', 
          'Slurp',
          'Baiduspider', // Chinese search engine
          'Yandex',      // Russian search engine
          'facebookexternalhit', // Facebook crawler
          'LinkedInBot',  // LinkedIn crawler
          'Twitterbot',   // Twitter crawler
          'Applebot'      // Apple's web crawler
        ],
        allow: '/',
        disallow: [
          '/api/',      // Protect API routes
          '/_next/',    // Protect Next.js system files
          '/static/',   // Protect static files if any
          '/admin/',    // Protect admin areas if any
          '/*.json$',   // Block access to JSON files
          '/*.xml$',    // Block access to XML files except sitemap
          '/debug/',    // Block debug pages
        ],
        crawlDelay: 2,  // Rate limiting for crawlers
      },
      {
        // Specific rules for AI crawlers
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'Anthropic-AI', 'Claude-Web', 'Cohere-AI'],
        disallow: '/',  // Block AI crawlers entirely (or customize as needed)
      },
      {
        // Block all other bots
        userAgent: '*',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Add sitemap for search engines
    host: baseUrl.replace(/^https?:\/\//, ''), // Canonical host without protocol
  };
} 