import { useOptimizer } from '@/contexts/OptimizerContext';
import { OptimizationStrategy } from '@/types';

/**
 * Hook for managing days input in the optimizer form
 * Provides access to days state and methods to update it
 */
export function useDaysInput() {
  const { state, dispatch } = useOptimizer();
  
  return {
    days: state.days,
    errors: state.errors.days,
    setDays: (value: string) => dispatch({ type: 'SET_DAYS', payload: value }),
  };
}

/**
 * Hook for managing strategy selection in the optimizer form
 * Provides access to strategy state and methods to update it
 */
export function useStrategySelection() {
  const { state, dispatch } = useOptimizer();
  
  return {
    strategy: state.strategy,
    setStrategy: (value: OptimizationStrategy) => 
      dispatch({ type: 'SET_STRATEGY', payload: value }),
  };
}

/**
 * Hook for managing year selection in the optimizer form
 * Provides access to selected year state and methods to update it
 */
export function useYearSelection() {
  const { state, dispatch } = useOptimizer();
  
  return {
    selectedYear: state.selectedYear,
    setSelectedYear: (value: number) => 
      dispatch({ type: 'SET_SELECTED_YEAR', payload: value }),
  };
}

/**
 * Hook for managing holidays in the optimizer form
 * Provides access to holidays state and methods to update it
 */
export function useHolidays() {
  const { state, dispatch } = useOptimizer();
  
  return {
    holidays: state.holidays,
    errors: state.errors.holiday,
    addHoliday: (date: string, name: string) => 
      dispatch({ type: 'ADD_HOLIDAY', payload: { date, name } }),
    removeHoliday: (date: string) => 
      dispatch({ type: 'REMOVE_HOLIDAY', payload: date }),
    clearHolidays: () => 
      dispatch({ type: 'CLEAR_HOLIDAYS' }),
    setDetectedHolidays: (holidays: Array<{ date: string, name: string }>) =>
      dispatch({ type: 'SET_DETECTED_HOLIDAYS', payload: holidays }),
  };
}

/**
 * Hook for managing company days in the optimizer form
 * Provides access to company days state and methods to update it
 */
export function useCompanyDays() {
  const { state, dispatch } = useOptimizer();
  
  return {
    companyDaysOff: state.companyDaysOff,
    errors: state.errors.companyDay,
    addCompanyDay: (date: string, name: string) => 
      dispatch({ type: 'ADD_COMPANY_DAY', payload: { date, name } }),
    removeCompanyDay: (date: string) => 
      dispatch({ type: 'REMOVE_COMPANY_DAY', payload: date }),
    clearCompanyDays: () => 
      dispatch({ type: 'CLEAR_COMPANY_DAYS' }),
    setCompanyDays: (days: Array<{ date: string, name: string }>) => 
      dispatch({ type: 'SET_COMPANY_DAYS', payload: days }),
  };
} 