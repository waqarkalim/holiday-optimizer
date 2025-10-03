import { useEffect } from 'react';
import {
  getStoredCompanyDays,
  removeStoredCompanyDay,
  storeCompanyDay,
} from '@/features/optimizer/lib/storage/company-days';
import {
  getStoredHolidays,
  removeStoredHoliday,
  storeHoliday,
} from '@/features/optimizer/lib/storage/holidays';
import { useOptimizer } from '@/features/optimizer/context/OptimizerContext';
import {
  getStoredWeekendDays,
  storeWeekendDays,
} from '@/features/optimizer/lib/storage/weekend-days';

export function useLocalStorage() {
  const { state, dispatch } = useOptimizer();
  const { holidays, companyDaysOff, selectedYear, weekendDays } = state;

  // Load stored data when year changes or on mount
  useEffect(() => {
    // Clear existing holidays and company days when year changes
    dispatch({ type: 'CLEAR_HOLIDAYS' });
    dispatch({ type: 'CLEAR_COMPANY_DAYS' });

    // Load public holidays for the selected year
    const storedHolidays = getStoredHolidays(selectedYear);
    if (storedHolidays.length > 0) {
      storedHolidays.forEach(day => {
        dispatch({ type: 'ADD_HOLIDAY', payload: { date: day.date, name: day.name } });
      });
    }

    // Load company days for the selected year
    const storedCompanyDays = getStoredCompanyDays(selectedYear);
    if (storedCompanyDays.length > 0) {
      storedCompanyDays.forEach(day => {
        dispatch({ type: 'ADD_COMPANY_DAY', payload: { date: day.date, name: day.name } });
      });
    }
  }, [dispatch, selectedYear]);

  useEffect(() => {
    const storedWeekendDays = getStoredWeekendDays();
    dispatch({ type: 'SET_WEEKEND_DAYS', payload: storedWeekendDays });
  }, [dispatch]);

  // Sync individual holiday changes
  useEffect(() => {
    const storedHolidays = getStoredHolidays(selectedYear);

    // Find holidays to add or update
    holidays.forEach(holiday => {
      const stored = storedHolidays.find(h => h.date === holiday.date);
      if (!stored || stored.name !== holiday.name) {
        storeHoliday(holiday, selectedYear);
      }
    });

    // Find holidays to remove
    storedHolidays.forEach(stored => {
      if (!holidays.some(h => h.date === stored.date)) {
        removeStoredHoliday(stored.date, selectedYear);
      }
    });
  }, [holidays, selectedYear]);

  // Sync individual company day changes
  useEffect(() => {
    const storedCompanyDays = getStoredCompanyDays(selectedYear);

    // Find company days to add or update
    companyDaysOff.forEach(day => {
      const stored = storedCompanyDays.find(d => d.date === day.date);
      if (!stored || stored.name !== day.name) {
        storeCompanyDay(day, selectedYear);
      }
    });

    // Find company days to remove
    storedCompanyDays.forEach(stored => {
      if (!companyDaysOff.some(d => d.date === stored.date)) {
        removeStoredCompanyDay(stored.date, selectedYear);
      }
    });
  }, [companyDaysOff, selectedYear]);

  useEffect(() => {
    storeWeekendDays(weekendDays);
  }, [weekendDays]);
}
