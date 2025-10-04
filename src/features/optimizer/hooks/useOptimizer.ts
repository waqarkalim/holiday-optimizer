import { useOptimizer } from '@/features/optimizer/context/OptimizerContext';
import { OptimizationStrategy, WeekdayNumber } from '@/types';

type SimpleDay = { date: string; name: string };

export function useOptimizerForm() {
  const { state, dispatch } = useOptimizer();

  const setDays = (value: string) => {
    dispatch({ type: 'SET_DAYS', payload: value });
  };

  const setStrategy = (value: OptimizationStrategy) => {
    dispatch({ type: 'SET_STRATEGY', payload: value });
  };

  const setSelectedYear = (value: number) => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: value });
  };

  const setWeekendDays = (value: WeekdayNumber[]) => {
    dispatch({ type: 'SET_WEEKEND_DAYS', payload: value });
  };

  const addHoliday = (date: string, name: string) => {
    dispatch({ type: 'ADD_HOLIDAY', payload: { date, name } });
  };

  const removeHoliday = (date: string) => {
    dispatch({ type: 'REMOVE_HOLIDAY', payload: date });
  };

  const clearHolidays = () => {
    dispatch({ type: 'CLEAR_HOLIDAYS' });
  };

  const setDetectedHolidays = (holidays: SimpleDay[]) => {
    dispatch({ type: 'SET_DETECTED_HOLIDAYS', payload: holidays });
  };

  const setHolidays = (holidays: SimpleDay[]) => {
    dispatch({ type: 'SET_HOLIDAYS', payload: holidays });
  };

  const addCompanyDay = (date: string, name: string) => {
    dispatch({ type: 'ADD_COMPANY_DAY', payload: { date, name } });
  };

  const removeCompanyDay = (date: string) => {
    dispatch({ type: 'REMOVE_COMPANY_DAY', payload: date });
  };

  const clearCompanyDays = () => {
    dispatch({ type: 'CLEAR_COMPANY_DAYS' });
  };

  const setCompanyDays = (days: SimpleDay[]) => {
    dispatch({ type: 'SET_COMPANY_DAYS', payload: days });
  };

  const setCustomStartDate = (value?: string) => {
    dispatch({ type: 'SET_CUSTOM_START_DATE', payload: value });
  };

  const setCustomEndDate = (value?: string) => {
    dispatch({ type: 'SET_CUSTOM_END_DATE', payload: value });
  };

  const clearCustomDateRange = () => {
    dispatch({ type: 'CLEAR_CUSTOM_DATE_RANGE' });
  };

  const applyTimeframePreset = (
    preset: 'calendar' | 'fiscalJul' | 'federalOct' | 'custom',
    year?: number
  ) => {
    dispatch({ type: 'APPLY_TIMEFRAME_PRESET', payload: { preset, year } });
  };

  const {
    days,
    strategy,
    companyDaysOff,
    holidays,
    selectedYear,
    selectedDates,
    weekendDays,
    customStartDate,
    customEndDate,
    timeframePreset,
    errors,
  } = state;

  return {
    days,
    strategy,
    companyDaysOff,
    holidays,
    selectedYear,
    selectedDates,
    weekendDays,
    customStartDate,
    customEndDate,
    timeframePreset,
    errors,
    daysError: errors.days,
    companyDayError: errors.companyDay,
    holidayError: errors.holiday,
    setDays,
    setStrategy,
    setSelectedYear,
    setWeekendDays,
    addHoliday,
    removeHoliday,
    clearHolidays,
    setDetectedHolidays,
    setHolidays,
    addCompanyDay,
    removeCompanyDay,
    clearCompanyDays,
    setCompanyDays,
    applyTimeframePreset,
    setCustomStartDate,
    setCustomEndDate,
    clearCustomDateRange,
  };
}
