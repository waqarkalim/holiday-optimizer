import { useEffect } from 'react';
import { getStoredCompanyDays, removeStoredCompanyDay, storeCompanyDay } from '@/features/optimizer/lib/storage/company-days';
import { getStoredHolidays, removeStoredHoliday, storeHoliday } from '@/features/optimizer/lib/storage/holidays';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';

export function useLocalStorage() {
  const {
    holidays,
    companyDaysOff,
    selectedYear,
    addHoliday,
    clearHolidays,
    addCompanyDay,
    clearCompanyDays,
  } = useOptimizerForm();

  // Load stored data when year changes or on mount
  useEffect(() => {
    // Clear existing holidays and company days when year changes
    clearHolidays();
    clearCompanyDays();

    // Load public holidays for the selected year
    const storedHolidays = getStoredHolidays(selectedYear);
    if (storedHolidays.length > 0) {
      storedHolidays.forEach(day => {
        addHoliday(day.date, day.name);
      });
    }

    // Load company days for the selected year
    const storedCompanyDays = getStoredCompanyDays(selectedYear);
    if (storedCompanyDays.length > 0) {
      storedCompanyDays.forEach(day => {
        addCompanyDay(day.date, day.name);
      });
    }
  }, [addCompanyDay, addHoliday, clearCompanyDays, clearHolidays, selectedYear]);

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
}
