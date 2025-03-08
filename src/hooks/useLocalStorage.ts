import { useEffect } from 'react';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { getStoredCompanyDays, removeStoredCompanyDay, storeCompanyDay } from '@/lib/storage/companyDays';
import { getStoredHolidays, removeStoredHoliday, storeHoliday } from '@/lib/storage/holidays';
import { useCompanyDays, useHolidays } from '@/hooks/useOptimizer';

export function useLocalStorage() {
  const { state, dispatch } = useOptimizer();
  const { clearHolidays } = useHolidays();
  const { clearCompanyDays } = useCompanyDays();
  const { selectedYear } = state;

  // Load stored data when year changes or on mount
  useEffect(() => {
    // Clear existing holidays and company days when year changes
    clearHolidays()
    clearCompanyDays()

    // Load public holidays for the selected year
    const storedHolidays = getStoredHolidays(selectedYear);
    if (storedHolidays.length > 0) {
      storedHolidays.forEach(day => {
        dispatch({ type: 'ADD_HOLIDAY', payload: day });
      });
    }

    // Load company days for the selected year
    const storedCompanyDays = getStoredCompanyDays(selectedYear);
    if (storedCompanyDays.length > 0) {
      storedCompanyDays.forEach(day => {
        dispatch({ type: 'ADD_COMPANY_DAY', payload: day });
      });
    }
  }, [dispatch, selectedYear]); // Re-run when selected year changes

  // Sync individual holiday changes
  useEffect(() => {
    const storedHolidays = getStoredHolidays(selectedYear);

    // Find holidays to add or update
    state.holidays.forEach(holiday => {
      const stored = storedHolidays.find(h => h.date === holiday.date);
      if (!stored || stored.name !== holiday.name) {
        storeHoliday(holiday, selectedYear);
      }
    });

    // Find holidays to remove
    storedHolidays.forEach(stored => {
      if (!state.holidays.some(h => h.date === stored.date)) {
        removeStoredHoliday(stored.date, selectedYear);
      }
    });
  }, [state.holidays, selectedYear]);

  // Sync individual company day changes
  useEffect(() => {
    const storedCompanyDays = getStoredCompanyDays(selectedYear);

    // Find company days to add or update
    state.companyDaysOff.forEach(day => {
      const stored = storedCompanyDays.find(d => d.date === day.date);
      if (!stored || stored.name !== day.name) {
        storeCompanyDay(day, selectedYear);
      }
    });

    // Find company days to remove
    storedCompanyDays.forEach(stored => {
      if (!state.companyDaysOff.some(d => d.date === stored.date)) {
        removeStoredCompanyDay(stored.date, selectedYear);
      }
    });
  }, [state.companyDaysOff, selectedYear]);
} 