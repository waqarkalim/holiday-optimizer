import { useOptimizer } from '@/contexts/OptimizerContext';
import { OptimizationStrategy } from '@/types';

export function useDaysInput() {
  const { state, dispatch } = useOptimizer();
  return {
    days: state.days,
    errors: state.errors.days,
    setDays: (value: string) => dispatch({ type: 'SET_DAYS', payload: value }),
  };
}

export function useStrategySelection() {
  const { state, dispatch } = useOptimizer();
  return {
    strategy: state.strategy,
    setStrategy: (value: OptimizationStrategy) => dispatch({ type: 'SET_STRATEGY', payload: value }),
  };
}

export function useHolidays() {
  const { state, dispatch } = useOptimizer();
  return {
    holidays: state.holidays,
    errors: state.errors.holiday,
    addHoliday: (date: string, name: string) => 
      dispatch({ type: 'ADD_HOLIDAY', payload: { date, name } }),
    removeHoliday: (date: string) => 
      dispatch({ type: 'REMOVE_HOLIDAY', payload: date }),
    clearHolidays: () => dispatch({ type: 'CLEAR_HOLIDAYS' }),
    setHolidays: (holidays: Array<{ date: string, name: string }>) => 
      dispatch({ type: 'SET_HOLIDAYS', payload: holidays }),
    setDetectedHolidays: (holidays: Array<{ date: string, name: string }>) => 
      dispatch({ type: 'SET_DETECTED_HOLIDAYS', payload: holidays }),
  };
}

export function useCompanyDays() {
  const { state, dispatch } = useOptimizer();
  return {
    companyDaysOff: state.companyDaysOff,
    errors: state.errors.companyDay,
    addCompanyDay: (date: string, name: string) => 
      dispatch({ type: 'ADD_COMPANY_DAY', payload: { date, name } }),
    removeCompanyDay: (date: string) => 
      dispatch({ type: 'REMOVE_COMPANY_DAY', payload: date }),
    clearCompanyDays: () => dispatch({ type: 'CLEAR_COMPANY_DAYS' }),
    setCompanyDays: (days: Array<{ date: string, name: string }>) => 
      dispatch({ type: 'SET_COMPANY_DAYS', payload: days }),
  };
} 