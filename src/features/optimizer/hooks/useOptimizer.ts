import { useCallback, useMemo } from 'react';
import { useOptimizer } from '@/features/optimizer/context/OptimizerContext';
import { OptimizationStrategy } from '@/types';

type SimpleDay = { date: string; name: string };

export function useOptimizerForm() {
  const { state, dispatch } = useOptimizer();

  const setDays = useCallback((value: string) => {
    dispatch({ type: 'SET_DAYS', payload: value });
  }, [dispatch]);

  const setStrategy = useCallback((value: OptimizationStrategy) => {
    dispatch({ type: 'SET_STRATEGY', payload: value });
  }, [dispatch]);

  const setSelectedYear = useCallback((value: number) => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: value });
  }, [dispatch]);

  const addHoliday = useCallback((date: string, name: string) => {
    dispatch({ type: 'ADD_HOLIDAY', payload: { date, name } });
  }, [dispatch]);

  const removeHoliday = useCallback((date: string) => {
    dispatch({ type: 'REMOVE_HOLIDAY', payload: date });
  }, [dispatch]);

  const clearHolidays = useCallback(() => {
    dispatch({ type: 'CLEAR_HOLIDAYS' });
  }, [dispatch]);

  const setDetectedHolidays = useCallback((holidays: SimpleDay[]) => {
    dispatch({ type: 'SET_DETECTED_HOLIDAYS', payload: holidays });
  }, [dispatch]);

  const setHolidays = useCallback((holidays: SimpleDay[]) => {
    dispatch({ type: 'SET_HOLIDAYS', payload: holidays });
  }, [dispatch]);

  const addCompanyDay = useCallback((date: string, name: string) => {
    dispatch({ type: 'ADD_COMPANY_DAY', payload: { date, name } });
  }, [dispatch]);

  const removeCompanyDay = useCallback((date: string) => {
    dispatch({ type: 'REMOVE_COMPANY_DAY', payload: date });
  }, [dispatch]);

  const clearCompanyDays = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPANY_DAYS' });
  }, [dispatch]);

  const setCompanyDays = useCallback((days: SimpleDay[]) => {
    dispatch({ type: 'SET_COMPANY_DAYS', payload: days });
  }, [dispatch]);

  return useMemo(() => {
    const { days, strategy, companyDaysOff, holidays, selectedYear, selectedDates, errors } = state;

    return {
      days,
      strategy,
      companyDaysOff,
      holidays,
      selectedYear,
      selectedDates,
      errors,
      daysError: errors.days,
      companyDayError: errors.companyDay,
      holidayError: errors.holiday,
      setDays,
      setStrategy,
      setSelectedYear,
      addHoliday,
      removeHoliday,
      clearHolidays,
      setDetectedHolidays,
      setHolidays,
      addCompanyDay,
      removeCompanyDay,
      clearCompanyDays,
      setCompanyDays,
    } as const;
  }, [
    state,
    setDays,
    setStrategy,
    setSelectedYear,
    addHoliday,
    removeHoliday,
    clearHolidays,
    setDetectedHolidays,
    setHolidays,
    addCompanyDay,
    removeCompanyDay,
    clearCompanyDays,
    setCompanyDays,
  ]);
}
