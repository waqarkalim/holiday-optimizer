import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com';
  const currentDate = new Date();
  
  // Define last modified dates
  const mainPageDate = currentDate;
  const termsLastModified = new Date(2023, 11, 15); // Example date: December 15, 2023
  const privacyLastModified = new Date(2023, 11, 15); // Example date: December 15, 2023
  const howItWorksLastModified = new Date(2024, 0, 10); // Example date: January 10, 2024
  
  // Add all routes that should be indexed by search engines
  const routes = [
    {
      url: baseUrl,
      lastModified: mainPageDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
      alternateRefs: [
        {
          hreflang: 'en',
          href: baseUrl,
        },
        // Add additional language versions if available
      ],
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: howItWorksLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternateRefs: [
        {
          hreflang: 'en',
          href: `${baseUrl}/how-it-works`,
        },
      ],
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: termsLastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternateRefs: [
        {
          hreflang: 'en',
          href: `${baseUrl}/terms`,
        },
      ],
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: privacyLastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternateRefs: [
        {
          hreflang: 'en',
          href: `${baseUrl}/privacy`,
        },
      ],
    }
  ];

  return routes;
} 