import { MetadataRoute } from 'next';
import { getAvailableCountries, getRegions, getStates } from '@/services/holidays';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com';

  // Add all static routes that should be indexed by search engines
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/holidays`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  // Generate holiday routes for all countries, states, and regions
  const holidayRoutes: MetadataRoute.Sitemap = [];

  // Get all countries
  const countries = getAvailableCountries();

  // Add country-level pages
  for (const { countryCode } of countries) {
    holidayRoutes.push({
      url: `${baseUrl}/holidays/${countryCode.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    });

    // Get states for this country
    const states = getStates(countryCode);

    // Add state-level pages
    for (const { code: stateCode } of states) {
      holidayRoutes.push({
        url: `${baseUrl}/holidays/${countryCode.toLowerCase()}/${stateCode.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });

      // Get regions for this state
      const regions = getRegions(countryCode, stateCode);

      // Add region-level pages
      for (const { code: regionCode } of regions) {
        holidayRoutes.push({
          url: `${baseUrl}/holidays/${countryCode.toLowerCase()}/${stateCode.toLowerCase()}/${regionCode.toLowerCase()}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        });
      }
    }
  }

  return [...staticRoutes, ...holidayRoutes];
}
