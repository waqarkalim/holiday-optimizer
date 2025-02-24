import { useEffect } from 'react';
import { useOptimizer } from '@/contexts/OptimizerContext';
import {
  clearStoredCompanyDays,
  getStoredCompanyDays,
  removeStoredCompanyDay,
  storeCompanyDay,
  updateStoredCompanyDay,
} from '@/lib/storage/companyDays';
import {
  clearStoredHolidays,
  getStoredHolidays,
  removeStoredHoliday,
  storeHoliday,
  updateStoredHoliday,
} from '@/lib/storage/holidays';

export function useLocalStorage() {
  const { state, dispatch } = useOptimizer();

  // Load stored data on mount
  useEffect(() => {
    // Load public holidays
    const storedHolidays = getStoredHolidays();
    storedHolidays.forEach(day => {
      dispatch({ type: 'ADD_HOLIDAY', payload: day });
    });

    // Load company days
    const storedCompanyDays = getStoredCompanyDays();
    storedCompanyDays.forEach(day => {
      dispatch({ type: 'ADD_COMPANY_DAY', payload: day });
    });
  }, [dispatch]);

  // Sync holidays to local storage
  useEffect(() => {
    clearStoredHolidays();
    state.holidays.forEach(storeHoliday);
  }, [state.holidays]);

  // Sync company days to local storage
  useEffect(() => {
    clearStoredCompanyDays();
    state.companyDaysOff.forEach(storeCompanyDay);
  }, [state.companyDaysOff]);
} 