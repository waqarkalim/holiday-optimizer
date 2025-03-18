import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com';
  
  return {
    rules: [
      {
        // Allow major search engines with specific directives
        userAgent: [
          'Googlebot', 
          'Googlebot-Image',
          'Googlebot-News',
          'Googlebot-Video',
          'Bingbot', 
          'DuckDuckBot', 
          'Slurp',
          'Baiduspider', // Chinese search engine
          'Yandex',      // Russian search engine
          'facebookexternalhit', // Facebook crawler
          'LinkedInBot',  // LinkedIn crawler
          'Twitterbot',   // Twitter crawler
          'Applebot',      // Apple's web crawler
          'Pinterestbot',  // Pinterest crawler
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
        // Specific rules for AI crawlers - you can adjust this if you want visibility in AI tools
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'Anthropic-AI', 'Claude-Web', 'Cohere-AI', 'CCBot'],
        disallow: '/',  // Block AI crawlers entirely (or customize as needed)
      },
      {
        // Block all other bots
        userAgent: '*',
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          '/admin/',
          '/*.json$',
          '/*.xml$',
          '/debug/',
        ],
        allow: '/', // Allow indexing for everything else
        crawlDelay: 5, // Higher delay for unknown bots
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Add sitemap for search engines
    host: baseUrl.replace(/^https?:\/\//, ''), // Canonical host without protocol
  };
} 