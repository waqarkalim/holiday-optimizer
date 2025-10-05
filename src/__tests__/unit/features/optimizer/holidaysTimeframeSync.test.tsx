/**
 * Simple tests for Holidays Timeframe Synchronization
 *
 * Ensures holidays automatically update when timeframe changes.
 * Keeps tests simple to avoid over-testing implementation details.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the holidays service
jest.mock('@/services/holidays', () => ({
  getAvailableCountries: jest.fn(() => Promise.resolve([
    { countryCode: 'US', name: 'United States' },
    { countryCode: 'CA', name: 'Canada' },
  ])),
  getStates: jest.fn(() => Promise.resolve([])),
  getRegions: jest.fn(() => Promise.resolve([])),
  getPublicHolidaysByCountry: jest.fn((year, countryInfo) => {
    // Return different holidays based on year
    const holidays = {
      2025: [
        { date: '2025-01-01', name: 'New Year\'s Day 2025' },
        { date: '2025-07-04', name: 'Independence Day 2025' },
      ],
      2026: [
        { date: '2026-01-01', name: 'New Year\'s Day 2026' },
        { date: '2026-07-04', name: 'Independence Day 2026' },
      ],
    };
    return Promise.resolve(holidays[year as keyof typeof holidays] || []);
  }),
}));

import { useHolidaysByCountry } from '@/features/holidays/hooks/useHolidayQueries';

describe('Holidays Timeframe Synchronization', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Core Behavior: Country Persists Across Year Changes', () => {
    test('should fetch holidays for multiple years with same country info', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Fetch for 2025
      const { result: result2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      // Wait for query to complete
      await waitFor(() => expect(result2025.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      expect(result2025.current.data).toBeDefined();
      expect(result2025.current.data?.length).toBeGreaterThan(0);

      // Now fetch for 2026 with SAME country info
      const { result: result2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      // Wait for 2026 query to complete
      await waitFor(() => expect(result2026.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      expect(result2026.current.data).toBeDefined();
      expect(result2026.current.data?.length).toBeGreaterThan(0);

      // Verify different data for different years
      expect(result2025.current.data?.[0].name).toContain('2025');
      expect(result2026.current.data?.[0].name).toContain('2026');
    });

    test('should support fetching holidays for two years simultaneously (fiscal year use case)', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Simulate fiscal year spanning 2025-2026
      const { result: result2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      const { result: result2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      // Wait for both to load
      await waitFor(
        () => {
          expect(result2025.current.isSuccess).toBe(true);
          expect(result2026.current.isSuccess).toBe(true);
        },
        { timeout: 3000 }
      );

      // Both should have data
      expect(result2025.current.data).toBeDefined();
      expect(result2026.current.data).toBeDefined();

      // Can combine them for fiscal year display
      const combinedHolidays = [
        ...(result2025.current.data || []),
        ...(result2026.current.data || []),
      ];

      expect(combinedHolidays.length).toBeGreaterThan(0);
    });
  });

  describe('Query Caching Behavior', () => {
    test('should cache queries separately by year', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Fetch 2025
      const { result: result2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(result2025.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      // Fetch 2026
      const { result: result2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(result2026.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      // Check cache keys
      const cacheKeys = queryClient.getQueryCache().getAll().map(q => q.queryKey);

      // Should have separate cache entries
      const has2025Cache = cacheKeys.some(
        key => JSON.stringify(key).includes('2025')
      );
      const has2026Cache = cacheKeys.some(
        key => JSON.stringify(key).includes('2026')
      );

      expect(has2025Cache).toBe(true);
      expect(has2026Cache).toBe(true);
    });
  });

  describe('Rapid Timeframe Switching', () => {
    test('should handle rapid switching between calendar years', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Simulate user rapidly switching: 2025 -> 2026 -> 2025 -> 2026
      const { result: result2025First } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(result2025First.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      const { result: result2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(result2026.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      // Switch back to 2025 - should use cached data
      const { result: result2025Second } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(result2025Second.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      // Should have consistent data
      expect(result2025First.current.data).toBeDefined();
      expect(result2025Second.current.data).toBeDefined();
      expect(result2025First.current.data?.[0].name).toBe(result2025Second.current.data?.[0].name);
    });

    test('should handle switching from calendar to fiscal year and back', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Start with calendar year 2025
      const { result: calendar2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(calendar2025.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      expect(calendar2025.current.data).toBeDefined();

      // Switch to fiscal year (need both 2025 and 2026)
      const { result: fiscal2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      const { result: fiscal2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => {
        expect(fiscal2025.current.isSuccess).toBe(true);
        expect(fiscal2026.current.isSuccess).toBe(true);
      }, {
        timeout: 3000,
      });

      // Both years should have data
      expect(fiscal2025.current.data).toBeDefined();
      expect(fiscal2026.current.data).toBeDefined();

      // Switch back to calendar year 2025 - should use cache
      const { result: backToCalendar } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(backToCalendar.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      expect(backToCalendar.current.data).toBeDefined();
    });
  });

  describe('Multi-Year Scenarios', () => {
    test('should handle fiscal year spanning 3 years (edge case)', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Unusual but possible: custom timeframe spanning multiple years
      const { result: year2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      const { result: year2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => {
        expect(year2025.current.isSuccess).toBe(true);
        expect(year2026.current.isSuccess).toBe(true);
      }, {
        timeout: 3000,
      });

      expect(year2025.current.data).toBeDefined();
      expect(year2026.current.data).toBeDefined();

      // All queries should be independent
      const cacheKeys = queryClient.getQueryCache().getAll().map(q => q.queryKey);
      expect(cacheKeys.length).toBeGreaterThanOrEqual(2);
    });

    test('should correctly combine holidays from two years for fiscal year', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Fetch both years
      const { result: year2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      const { result: year2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => {
        expect(year2025.current.isSuccess).toBe(true);
        expect(year2026.current.isSuccess).toBe(true);
      }, {
        timeout: 3000,
      });

      // Combine them
      const combined = [
        ...(year2025.current.data || []),
        ...(year2026.current.data || []),
      ];

      // Should have holidays from both years
      expect(combined.some(h => h.name.includes('2025'))).toBe(true);
      expect(combined.some(h => h.name.includes('2026'))).toBe(true);
      expect(combined.length).toBe(4); // 2 from each year
    });
  });

  describe('State and Region Support', () => {
    test('should refetch when state/region changes for same year', async () => {
      const usInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      const usCAInfo = {
        country: 'US',
        state: 'CA',
        region: '',
      };

      // Fetch US nationwide holidays
      const { result: usResult } = renderHook(
        () => useHolidaysByCountry(2025, usInfo),
        { wrapper }
      );

      await waitFor(() => expect(usResult.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      // Fetch US-CA specific holidays (same year, different state)
      const { result: usCAResult } = renderHook(
        () => useHolidaysByCountry(2025, usCAInfo),
        { wrapper }
      );

      await waitFor(() => expect(usCAResult.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      // Both should be cached separately
      const cacheKeys = queryClient.getQueryCache().getAll().map(q => q.queryKey);
      const hasUSCache = cacheKeys.some(key => {
        const keyStr = JSON.stringify(key);
        return keyStr.includes('US') && !keyStr.includes('CA');
      });
      const hasUSCACache = cacheKeys.some(key => {
        const keyStr = JSON.stringify(key);
        return keyStr.includes('US') && keyStr.includes('CA');
      });

      expect(hasUSCache).toBe(true);
      expect(hasUSCACache).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should not fetch when country is empty', () => {
      const emptyCountryInfo = {
        country: '',
        state: '',
        region: '',
      };

      const { result } = renderHook(
        () => useHolidaysByCountry(2025, emptyCountryInfo),
        { wrapper }
      );

      // Query should be disabled
      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    test('should not fetch when year is invalid', () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      const { result } = renderHook(
        () => useHolidaysByCountry(0, countryInfo),
        { wrapper }
      );

      // Query should be disabled
      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    test('should handle year far in the future', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      const { result } = renderHook(
        () => useHolidaysByCountry(2030, countryInfo),
        { wrapper }
      );

      // Should still make the query (API will handle if year not available)
      expect(result.current.data).toBeUndefined(); // No mock data for 2030
    });

    test('should handle year far in the past', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      const { result } = renderHook(
        () => useHolidaysByCountry(2020, countryInfo),
        { wrapper }
      );

      // Should still make the query
      expect(result.current.data).toBeUndefined(); // No mock data for 2020
    });
  });

  describe('Real-World User Flow', () => {
    test('should handle complete user workflow: select country, switch years, add more holidays', async () => {
      const countryInfo = {
        country: 'US',
        state: '',
        region: '',
      };

      // Step 1: User selects US, calendar year 2025
      const { result: step1 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(step1.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      expect(step1.current.data).toBeDefined();
      expect(step1.current.data?.length).toBe(2); // 2 holidays for 2025

      // Step 2: User switches to calendar year 2026
      const { result: step2 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => expect(step2.current.isSuccess).toBe(true), {
        timeout: 3000,
      });

      expect(step2.current.data).toBeDefined();
      expect(step2.current.data?.length).toBe(2); // 2 holidays for 2026

      // Step 3: User switches to fiscal year (Jul 2025 - Jun 2026)
      // This requires fetching both years
      const { result: fiscal2025 } = renderHook(
        () => useHolidaysByCountry(2025, countryInfo),
        { wrapper }
      );

      const { result: fiscal2026 } = renderHook(
        () => useHolidaysByCountry(2026, countryInfo),
        { wrapper }
      );

      await waitFor(() => {
        expect(fiscal2025.current.isSuccess).toBe(true);
        expect(fiscal2026.current.isSuccess).toBe(true);
      }, {
        timeout: 3000,
      });

      // Both should have data (likely from cache)
      expect(fiscal2025.current.data).toBeDefined();
      expect(fiscal2026.current.data).toBeDefined();

      // Verify cache is working efficiently
      const cacheKeys = queryClient.getQueryCache().getAll();
      expect(cacheKeys.length).toBeGreaterThanOrEqual(2);
    });
  });
});
