import { useQuery } from '@tanstack/react-query';
import { getAvailableCountries, getPublicHolidaysByCountry } from '@/services/holidays';

/**
 * Hook for fetching available countries using React Query
 */
export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: getAvailableCountries,
    staleTime: Infinity, // Countries rarely change
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name))
  });
};

/**
 * Hook for fetching holidays for a specific country and year
 * @param countryCode - The ISO country code
 * @param year - The year to fetch holidays for
 */
export const useHolidaysByCountry = (countryCode: string, year: number) => {
  return useQuery({
    queryKey: ['holidays', countryCode, year],
    queryFn: () => getPublicHolidaysByCountry(countryCode, year),
    enabled: !!countryCode && !!year, // Only run if countryCode and year are provided
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - holidays don't change often
  });
}; 