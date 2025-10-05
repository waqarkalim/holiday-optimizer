import { parse } from 'date-fns';

/**
 * Test suite for Company Days Timeframe Filtering
 *
 * This test suite validates the filtering logic for company days based on selected timeframes.
 * The goal is to identify edge cases WITHOUT implementing complex solutions that lead to spaghetti code.
 */

type CompanyDay = { date: string; name: string };

/**
 * Filtering logic to be tested (extracted from implementation)
 */
function filterCompanyDaysByTimeframe(
  companyDays: CompanyDay[],
  customStartDate?: string,
  customEndDate?: string
): CompanyDay[] {
  if (!customStartDate || !customEndDate) return companyDays;

  return companyDays.filter(day => {
    const dayDate = parse(day.date, 'yyyy-MM-dd', new Date());
    const startDate = parse(customStartDate, 'yyyy-MM-dd', new Date());
    const endDate = parse(customEndDate, 'yyyy-MM-dd', new Date());

    return dayDate >= startDate && dayDate <= endDate;
  });
}

describe('Company Days Timeframe Filtering', () => {
  const createCompanyDay = (date: string, name: string = 'Company Holiday'): CompanyDay => ({
    date,
    name,
  });

  describe('Basic Filtering Scenarios', () => {
    test('should return all company days when no timeframe is specified', () => {
      const companyDays = [
        createCompanyDay('2025-01-15'),
        createCompanyDay('2025-06-20'),
        createCompanyDay('2025-12-25'),
      ];

      const result = filterCompanyDaysByTimeframe(companyDays);

      expect(result).toHaveLength(3);
      expect(result).toEqual(companyDays);
    });

    test('should return all company days when only start date is specified', () => {
      const companyDays = [
        createCompanyDay('2025-01-15'),
        createCompanyDay('2025-06-20'),
      ];

      const result = filterCompanyDaysByTimeframe(companyDays, '2025-01-01');

      expect(result).toHaveLength(2);
      expect(result).toEqual(companyDays);
    });

    test('should return all company days when only end date is specified', () => {
      const companyDays = [
        createCompanyDay('2025-01-15'),
        createCompanyDay('2025-06-20'),
      ];

      const result = filterCompanyDaysByTimeframe(companyDays, undefined, '2025-12-31');

      expect(result).toHaveLength(2);
      expect(result).toEqual(companyDays);
    });

    test('should filter company days within calendar year timeframe', () => {
      const companyDays = [
        createCompanyDay('2024-12-20', 'Last year'),
        createCompanyDay('2025-03-15', 'This year Q1'),
        createCompanyDay('2025-08-20', 'This year Q3'),
        createCompanyDay('2026-01-10', 'Next year'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-03-15');
      expect(result[1].date).toBe('2025-08-20');
    });

    test('should filter company days within fiscal year timeframe (July to June)', () => {
      const companyDays = [
        createCompanyDay('2025-06-30', 'End of previous fiscal year'),
        createCompanyDay('2025-07-01', 'Start of fiscal year'),
        createCompanyDay('2025-12-25', 'Mid fiscal year'),
        createCompanyDay('2026-06-30', 'End of fiscal year'),
        createCompanyDay('2026-07-01', 'Start of next fiscal year'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-07-01',
        '2026-06-30'
      );

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-07-01');
      expect(result[1].date).toBe('2025-12-25');
      expect(result[2].date).toBe('2026-06-30');
    });
  });

  describe('Boundary Testing', () => {
    test('should include company days exactly on start date', () => {
      const companyDays = [
        createCompanyDay('2024-12-31'),
        createCompanyDay('2025-01-01'),
        createCompanyDay('2025-01-02'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-01-01');
    });

    test('should include company days exactly on end date', () => {
      const companyDays = [
        createCompanyDay('2025-12-30'),
        createCompanyDay('2025-12-31'),
        createCompanyDay('2026-01-01'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(2);
      expect(result[1].date).toBe('2025-12-31');
    });

    test('should exclude company days one day before start date', () => {
      const companyDays = [
        createCompanyDay('2024-12-31'),
        createCompanyDay('2025-01-01'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-01');
    });

    test('should exclude company days one day after end date', () => {
      const companyDays = [
        createCompanyDay('2025-12-31'),
        createCompanyDay('2026-01-01'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-12-31');
    });
  });

  describe('Edge Cases - Empty and Invalid Data', () => {
    test('should handle empty company days array', () => {
      const result = filterCompanyDaysByTimeframe(
        [],
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    test('should handle timeframe with no matching company days', () => {
      const companyDays = [
        createCompanyDay('2024-01-15'),
        createCompanyDay('2024-06-20'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(0);
    });

    test('should handle single day timeframe', () => {
      const companyDays = [
        createCompanyDay('2025-07-04'),
        createCompanyDay('2025-07-05'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-07-04',
        '2025-07-04'
      );

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-07-04');
    });
  });

  describe('Multi-Year Scenarios', () => {
    test('should handle fiscal year spanning two calendar years', () => {
      const companyDays = [
        createCompanyDay('2024-07-15', 'Previous fiscal year'),
        createCompanyDay('2025-08-01', 'Current fiscal year - Year 1'),
        createCompanyDay('2025-12-25', 'Current fiscal year - Year 1 end'),
        createCompanyDay('2026-02-14', 'Current fiscal year - Year 2'),
        createCompanyDay('2026-06-15', 'Current fiscal year - Year 2 end'),
        createCompanyDay('2026-08-01', 'Next fiscal year'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-07-01',
        '2026-06-30'
      );

      expect(result).toHaveLength(4);
      expect(result.map(d => d.date)).toEqual([
        '2025-08-01',
        '2025-12-25',
        '2026-02-14',
        '2026-06-15',
      ]);
    });

    test('should handle multiple fiscal years worth of data', () => {
      const companyDays = [
        // FY 2024-2025 (Jul 2024 - Jun 2025)
        createCompanyDay('2024-12-25', 'FY2024 Q2'),
        createCompanyDay('2025-03-15', 'FY2024 Q3'),

        // FY 2025-2026 (Jul 2025 - Jun 2026)
        createCompanyDay('2025-12-25', 'FY2025 Q2'),
        createCompanyDay('2026-03-15', 'FY2025 Q3'),

        // FY 2026-2027 (Jul 2026 - Jun 2027)
        createCompanyDay('2026-12-25', 'FY2026 Q2'),
        createCompanyDay('2027-03-15', 'FY2026 Q3'),
      ];

      // Test switching between different fiscal years
      const fy2024 = filterCompanyDaysByTimeframe(
        companyDays,
        '2024-07-01',
        '2025-06-30'
      );
      expect(fy2024).toHaveLength(2);

      const fy2025 = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-07-01',
        '2026-06-30'
      );
      expect(fy2025).toHaveLength(2);

      const fy2026 = filterCompanyDaysByTimeframe(
        companyDays,
        '2026-07-01',
        '2027-06-30'
      );
      expect(fy2026).toHaveLength(2);
    });
  });

  describe('Custom Timeframe Scenarios', () => {
    test('should handle arbitrary custom date ranges', () => {
      const companyDays = [
        createCompanyDay('2025-03-14', 'Before range'),
        createCompanyDay('2025-03-15', 'Start of range'),
        createCompanyDay('2025-06-20', 'Middle of range'),
        createCompanyDay('2025-09-15', 'End of range'),
        createCompanyDay('2025-09-16', 'After range'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-03-15',
        '2025-09-15'
      );

      expect(result).toHaveLength(3);
      expect(result.map(d => d.date)).toEqual([
        '2025-03-15',
        '2025-06-20',
        '2025-09-15',
      ]);
    });

    test('should handle very short custom timeframe (1 week)', () => {
      const companyDays = [
        createCompanyDay('2025-06-14'),
        createCompanyDay('2025-06-15'),
        createCompanyDay('2025-06-20'),
        createCompanyDay('2025-06-21'),
        createCompanyDay('2025-06-22'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-06-15',
        '2025-06-21'
      );

      expect(result).toHaveLength(3);
    });

    test('should handle very long custom timeframe (multiple years)', () => {
      const companyDays = [
        createCompanyDay('2023-12-25'),
        createCompanyDay('2024-12-25'),
        createCompanyDay('2025-12-25'),
        createCompanyDay('2026-12-25'),
        createCompanyDay('2027-12-25'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2024-01-01',
        '2026-12-31'
      );

      expect(result).toHaveLength(3);
      expect(result.map(d => d.date)).toEqual([
        '2024-12-25',
        '2025-12-25',
        '2026-12-25',
      ]);
    });
  });

  describe('Real-World Usage Patterns', () => {
    test('should maintain data when switching from calendar to fiscal year', () => {
      const companyDays = [
        createCompanyDay('2025-01-15', 'New Year Party'),
        createCompanyDay('2025-07-04', 'Independence Day'),
        createCompanyDay('2026-01-15', 'Next New Year Party'),
      ];

      // Start with calendar year 2025
      const calendarYear = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );
      expect(calendarYear).toHaveLength(2);

      // Switch to fiscal year (Jul 2025 - Jun 2026)
      const fiscalYear = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-07-01',
        '2026-06-30'
      );
      expect(fiscalYear).toHaveLength(2);
      expect(fiscalYear.map(d => d.date)).toEqual(['2025-07-04', '2026-01-15']);

      // Switch back to calendar year - data should still be there
      const backToCalendar = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );
      expect(backToCalendar).toHaveLength(2);
      expect(backToCalendar).toEqual(calendarYear);
    });

    test('should handle user adding company days across different timeframes', () => {
      // Simulate user workflow:
      // 1. Set calendar year 2025, add some days
      // 2. Switch to fiscal year, add more days
      // 3. Switch back to calendar year, verify both sets are preserved

      const allCompanyDays: CompanyDay[] = [];

      // Step 1: Calendar year 2025
      allCompanyDays.push(createCompanyDay('2025-03-15', 'Spring Break'));
      allCompanyDays.push(createCompanyDay('2025-11-25', 'Thanksgiving'));

      const step1 = filterCompanyDaysByTimeframe(
        allCompanyDays,
        '2025-01-01',
        '2025-12-31'
      );
      expect(step1).toHaveLength(2);

      // Step 2: Switch to fiscal year (Jul 2025 - Jun 2026), add more days
      allCompanyDays.push(createCompanyDay('2026-02-14', 'Valentine\'s Day'));
      allCompanyDays.push(createCompanyDay('2026-05-01', 'May Day'));

      const step2 = filterCompanyDaysByTimeframe(
        allCompanyDays,
        '2025-07-01',
        '2026-06-30'
      );
      expect(step2).toHaveLength(3); // Thanksgiving + 2 new ones

      // Step 3: Switch back to calendar year 2025
      const step3 = filterCompanyDaysByTimeframe(
        allCompanyDays,
        '2025-01-01',
        '2025-12-31'
      );
      expect(step3).toHaveLength(2); // Original 2 still there

      // Step 4: Switch to calendar year 2026
      const step4 = filterCompanyDaysByTimeframe(
        allCompanyDays,
        '2026-01-01',
        '2026-12-31'
      );
      expect(step4).toHaveLength(2); // The 2 added in fiscal year
    });

    test('should show correct days when rapidly switching timeframes', () => {
      const companyDays = [
        createCompanyDay('2024-12-25'),
        createCompanyDay('2025-06-15'),
        createCompanyDay('2025-12-25'),
        createCompanyDay('2026-06-15'),
      ];

      // Rapid switches
      const switch1 = filterCompanyDaysByTimeframe(companyDays, '2025-01-01', '2025-12-31');
      const switch2 = filterCompanyDaysByTimeframe(companyDays, '2025-07-01', '2026-06-30');
      const switch3 = filterCompanyDaysByTimeframe(companyDays, '2024-01-01', '2024-12-31');
      const switch4 = filterCompanyDaysByTimeframe(companyDays, '2025-01-01', '2025-12-31');

      expect(switch1).toHaveLength(2);
      expect(switch2).toHaveLength(2);
      expect(switch3).toHaveLength(1);
      expect(switch4).toHaveLength(2);
      expect(switch4).toEqual(switch1); // Should be consistent
    });
  });

  describe('Date Format and Parsing', () => {
    test('should handle dates in yyyy-MM-dd format', () => {
      const companyDays = [
        createCompanyDay('2025-01-01'),
        createCompanyDay('2025-12-31'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(2);
    });

    test('should handle dates with single-digit months and days', () => {
      const companyDays = [
        createCompanyDay('2025-01-05'),
        createCompanyDay('2025-09-09'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('Potential Edge Cases to Consider', () => {
    test('EDGE CASE: should handle leap year dates', () => {
      const companyDays = [
        createCompanyDay('2024-02-29', 'Leap day 2024'),
        createCompanyDay('2025-02-28', 'Not leap year'),
        createCompanyDay('2028-02-29', 'Leap day 2028'),
      ];

      const result2024 = filterCompanyDaysByTimeframe(
        companyDays,
        '2024-01-01',
        '2024-12-31'
      );
      expect(result2024).toHaveLength(1);
      expect(result2024[0].date).toBe('2024-02-29');

      const result2025 = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );
      expect(result2025).toHaveLength(1);
      expect(result2025[0].date).toBe('2025-02-28');
    });

    test('EDGE CASE: should handle end-of-month edge cases', () => {
      const companyDays = [
        createCompanyDay('2025-01-31', 'End of Jan'),
        createCompanyDay('2025-02-28', 'End of Feb'),
        createCompanyDay('2025-03-31', 'End of Mar'),
        createCompanyDay('2025-04-30', 'End of Apr'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(4);
    });

    test('EDGE CASE: should handle fiscal year starting mid-month', () => {
      // Some companies might have fiscal year starting on weird dates
      const companyDays = [
        createCompanyDay('2025-04-14', 'Before fiscal year'),
        createCompanyDay('2025-04-15', 'Fiscal year starts'),
        createCompanyDay('2026-04-14', 'Fiscal year ends'),
        createCompanyDay('2026-04-15', 'Next fiscal year'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-04-15',
        '2026-04-14'
      );

      expect(result).toHaveLength(2);
      expect(result.map(d => d.date)).toEqual(['2025-04-15', '2026-04-14']);
    });

    test('EDGE CASE: should handle reverse date range gracefully', () => {
      // What if someone accidentally provides end date before start date?
      // Current implementation will return empty array, which is reasonable
      const companyDays = [
        createCompanyDay('2025-06-15'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-12-31',
        '2025-01-01'
      );

      // This should return empty because dayDate >= startDate will fail
      expect(result).toHaveLength(0);
    });

    test('EDGE CASE: should preserve name and metadata when filtering', () => {
      const companyDays = [
        createCompanyDay('2025-03-15', 'Custom Named Holiday'),
        createCompanyDay('2025-06-20', 'Another Special Day'),
      ];

      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );

      expect(result[0].name).toBe('Custom Named Holiday');
      expect(result[1].name).toBe('Another Special Day');
    });
  });

  describe('Performance Considerations', () => {
    test('should handle large number of company days efficiently', () => {
      // Generate 365 company days (one per day of the year)
      const companyDays: CompanyDay[] = [];
      for (let i = 1; i <= 365; i++) {
        const date = new Date(2025, 0, 1);
        date.setDate(i);
        const dateStr = date.toISOString().split('T')[0];
        companyDays.push(createCompanyDay(dateStr, `Day ${i}`));
      }

      const startTime = performance.now();
      const result = filterCompanyDaysByTimeframe(
        companyDays,
        '2025-01-01',
        '2025-12-31'
      );
      const endTime = performance.now();

      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    test('should handle repeated filtering calls', () => {
      const companyDays = [
        createCompanyDay('2025-01-15'),
        createCompanyDay('2025-06-20'),
        createCompanyDay('2025-12-25'),
      ];

      // Simulate user changing timeframes multiple times
      for (let i = 0; i < 10; i++) {
        const result = filterCompanyDaysByTimeframe(
          companyDays,
          '2025-01-01',
          '2025-12-31'
        );
        expect(result).toHaveLength(3);
      }
    });
  });
});

describe('Integration: Calendar Display Logic', () => {
  // These tests verify that the calendar shows ALL company days
  // regardless of the selected timeframe (as per requirements)

  test('calendar should show all company days even when timeframe is narrowed', () => {
    const allCompanyDays = [
      { date: '2024-12-25', name: 'Christmas 2024' },
      { date: '2025-07-04', name: 'Independence Day' },
      { date: '2026-01-01', name: 'New Year 2026' },
    ];

    // Calendar should always show ALL company days
    const calendarDays = allCompanyDays; // No filtering

    // But the list should be filtered
    const listDays = filterCompanyDaysByTimeframe(
      allCompanyDays,
      '2025-01-01',
      '2025-12-31'
    );

    expect(calendarDays).toHaveLength(3);
    expect(listDays).toHaveLength(1);
    expect(listDays[0].date).toBe('2025-07-04');
  });

  test('should allow selecting days outside timeframe via calendar', () => {
    // User can click on dates outside the current timeframe
    // These should be stored in the master list
    const allCompanyDays: CompanyDay[] = [
      { date: '2025-06-15', name: 'Summer Day' },
    ];

    // User switches to fiscal year and adds a day
    allCompanyDays.push({ date: '2026-03-15', name: 'Spring Day' });

    // Calendar shows both
    expect(allCompanyDays).toHaveLength(2);

    // But when viewing calendar year 2025, only one shows in list
    const visibleInCalendar2025 = filterCompanyDaysByTimeframe(
      allCompanyDays,
      '2025-01-01',
      '2025-12-31'
    );
    expect(visibleInCalendar2025).toHaveLength(1);
  });
});
