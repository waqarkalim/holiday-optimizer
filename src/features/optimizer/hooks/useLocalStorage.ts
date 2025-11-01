import { useEffect } from 'react';
import {
  getStoredCompanyDays,
  removeStoredCompanyDay,
  storeCompanyDay,
} from '@/features/optimizer/lib/storage/company-days';
import {
  getStoredPreBookedDays,
  removeStoredPreBookedDay,
  storePreBookedDay,
} from '@/features/optimizer/lib/storage/pre-booked-days';
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
import {
  getStoredRemoteWorkDays,
  storeRemoteWorkDays,
} from '@/features/optimizer/lib/storage/remote-work-days';

export function useLocalStorage() {
  const { state, dispatch } = useOptimizer();
  const { holidays, companyDaysOff, preBookedDays, selectedYear, weekendDays, remoteWorkDays } = state;

  // Load stored data when year changes or on mount
  useEffect(() => {
    // Clear existing holidays, company days, and pre-booked days when year changes
    dispatch({ type: 'CLEAR_HOLIDAYS' });
    dispatch({ type: 'CLEAR_COMPANY_DAYS' });
    dispatch({ type: 'CLEAR_PRE_BOOKED_DAYS' });

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

    // Load pre-booked days for the selected year
    const storedPreBookedDays = getStoredPreBookedDays(selectedYear);
    if (storedPreBookedDays.length > 0) {
      storedPreBookedDays.forEach(day => {
        dispatch({ type: 'ADD_PRE_BOOKED_DAY', payload: { date: day.date, name: day.name } });
      });
    }
  }, [dispatch, selectedYear]);

  useEffect(() => {
    const storedWeekendDays = getStoredWeekendDays();
    dispatch({ type: 'SET_WEEKEND_DAYS', payload: storedWeekendDays });
  }, [dispatch]);

  useEffect(() => {
    const storedRemoteDays = getStoredRemoteWorkDays();
    dispatch({ type: 'SET_REMOTE_WORK_DAYS', payload: storedRemoteDays });
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

  useEffect(() => {
    storeRemoteWorkDays(remoteWorkDays);
  }, [remoteWorkDays]);

  // Sync individual pre-booked day changes
  useEffect(() => {
    const storedPreBookedDays = getStoredPreBookedDays(selectedYear);

    // Find pre-booked days to add or update
    preBookedDays.forEach(day => {
      const stored = storedPreBookedDays.find(d => d.date === day.date);
      if (!stored || stored.name !== day.name) {
        storePreBookedDay(day, selectedYear);
      }
    });

    // Find pre-booked days to remove
    storedPreBookedDays.forEach(stored => {
      if (!preBookedDays.some(d => d.date === stored.date)) {
        removeStoredPreBookedDay(stored.date, selectedYear);
      }
    });
  }, [preBookedDays, selectedYear]);
}
