import { useEffect } from 'react';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { getStoredCompanyDays, removeStoredCompanyDay, storeCompanyDay } from '@/lib/storage/companyDays';
import { getStoredHolidays, removeStoredHoliday, storeHoliday } from '@/lib/storage/holidays';

export function useLocalStorage() {
  const { state, dispatch } = useOptimizer();

  // Load stored data on mount
  useEffect(() => {
    // Load public holidays
    const storedHolidays = getStoredHolidays();
    if (storedHolidays.length > 0) {
      storedHolidays.forEach(day => {
        dispatch({ type: 'ADD_HOLIDAY', payload: day });
      });
    }

    // Load company days
    const storedCompanyDays = getStoredCompanyDays();
    if (storedCompanyDays.length > 0) {
      storedCompanyDays.forEach(day => {
        dispatch({ type: 'ADD_COMPANY_DAY', payload: day });
      });
    }
  }, [dispatch]); // Only run on mount

  // Sync individual holiday changes
  useEffect(() => {
    const storedHolidays = getStoredHolidays();

    // Find holidays to add or update
    state.holidays.forEach(holiday => {
      const stored = storedHolidays.find(h => h.date === holiday.date);
      if (!stored || stored.name !== holiday.name) {
        storeHoliday(holiday);
      }
    });

    // Find holidays to remove
    storedHolidays.forEach(stored => {
      if (!state.holidays.some(h => h.date === stored.date)) {
        removeStoredHoliday(stored.date);
      }
    });
  }, [state.holidays]);

  // Sync individual company day changes
  useEffect(() => {
    const storedCompanyDays = getStoredCompanyDays();

    // Find company days to add or update
    state.companyDaysOff.forEach(day => {
      const stored = storedCompanyDays.find(d => d.date === day.date);
      if (!stored || stored.name !== day.name) {
        storeCompanyDay(day);
      }
    });

    // Find company days to remove
    storedCompanyDays.forEach(stored => {
      if (!state.companyDaysOff.some(d => d.date === stored.date)) {
        removeStoredCompanyDay(stored.date);
      }
    });
  }, [state.companyDaysOff]);
} 