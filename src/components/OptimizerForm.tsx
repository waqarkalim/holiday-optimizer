'use client';

import { FormEvent, useEffect } from 'react';
import { Button } from './ui/button';
import { CompanyDayOff, OptimizationStrategy } from '@/types';
import { format } from 'date-fns';
import { Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { clearStoredHolidays, getStoredHolidays, removeStoredHoliday, storeHoliday } from '@/lib/storage/holidays';
import {
  clearStoredCompanyDays,
  getStoredCompanyDays,
  removeStoredCompanyDay,
  storeCompanyDay,
} from '@/lib/storage/companyDays';
import { detectPublicHolidays } from '@/services/holidays';
import { toast } from 'sonner';
import { DaysInputStep } from './features/form/DaysInputStep';
import { StrategySelectionStep } from './features/form/StrategySelectionStep';
import { HolidaysStep } from './features/form/HolidaysStep';
import { CompanyDaysStep } from './features/form/CompanyDaysStep';

interface OptimizerFormProps {
  onSubmitAction: (data: {
    days: number
    strategy: OptimizationStrategy
    companyDaysOff: CompanyDayOff[]
    holidays: Array<{ date: string, name: string }>
  }) => void;
  isLoading?: boolean;
}

export function OptimizerForm({ onSubmitAction, isLoading = false }: OptimizerFormProps) {
  const { state, dispatch } = useOptimizer();
  const { days, strategy, errors, companyDaysOff, holidays } = state;

  // Load stored holidays and company days on mount
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
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numDays = parseInt(days);
    if (numDays <= 0) return;

    onSubmitAction({ days: numDays, strategy, companyDaysOff, holidays });
  };

  const handleCompanyDaySelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = companyDaysOff.some(day => day.date === formattedDate);

    if (isSelected) {
      const index = companyDaysOff.findIndex(day => day.date === formattedDate);
      dispatch({ type: 'REMOVE_COMPANY_DAY', payload: index });
      removeStoredCompanyDay(index);
    } else {
      const companyDay = {
        name: format(date, 'MMMM d, yyyy'),
        date: formattedDate,
      };
      dispatch({ type: 'ADD_COMPANY_DAY', payload: companyDay });
      storeCompanyDay(companyDay);
    }
  };

  const handleHolidaySelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = holidays.some(day => day.date === formattedDate);

    if (isSelected) {
      const index = holidays.findIndex(day => day.date === formattedDate);
      dispatch({ type: 'REMOVE_HOLIDAY', payload: index });
      removeStoredHoliday(index);
    } else {
      const holiday = {
        name: format(date, 'MMMM d, yyyy'),
        date: formattedDate,
      };
      dispatch({ type: 'ADD_HOLIDAY', payload: holiday });
      storeHoliday(holiday);
    }
  };

  const handleAutoDetectHolidays = async () => {
    try {
      const detectedHolidays = await detectPublicHolidays();
      dispatch({ type: 'SET_DETECTED_HOLIDAYS', payload: detectedHolidays });
      detectedHolidays.forEach(storeHoliday);

      toast.success('Holidays detected', {
        description: `Found ${detectedHolidays.length} public holidays for your location.`,
      });
    } catch (error) {
      console.error('Error detecting holidays:', error);
      toast.error('Error detecting holidays', {
        description: error instanceof Error ? error.message : 'Failed to detect holidays for your location.',
      });
    }
  };

  return (
    <main
      className="bg-teal-50/30 dark:bg-gray-800/60 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-300/10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Time off optimizer">
        <div className="space-y-3">
          <header>
            <h1 className="text-base font-semibold text-teal-900 dark:text-teal-100 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              Design Your Dream Year
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
              In just 4 simple steps, we&apos;ll help you create the perfect balance of work and life, maximizing every
              day off.
            </p>
          </header>

          <div className="space-y-3">
            <DaysInputStep
              days={days}
              onDaysChange={(value) => dispatch({ type: 'SET_DAYS', payload: value })}
              errors={errors}
            />

            <StrategySelectionStep
              strategy={strategy}
              onStrategyChange={(value) => dispatch({ type: 'SET_STRATEGY', payload: value })}
            />

            <HolidaysStep
              holidays={holidays}
              onHolidaySelect={handleHolidaySelect}
              onHolidayRemove={(index) => {
                dispatch({ type: 'REMOVE_HOLIDAY', payload: index });
                removeStoredHoliday(index);
              }}
              onClearHolidays={() => {
                dispatch({ type: 'CLEAR_HOLIDAYS' });
                clearStoredHolidays();
              }}
              onAutoDetect={handleAutoDetectHolidays}
            />

            <CompanyDaysStep
              companyDaysOff={companyDaysOff}
              onCompanyDaySelect={handleCompanyDaySelect}
              onCompanyDayRemove={(index) => {
                dispatch({ type: 'REMOVE_COMPANY_DAY', payload: index });
                removeStoredCompanyDay(index);
              }}
              onClearCompanyDays={() => {
                dispatch({ type: 'CLEAR_COMPANY_DAYS' });
                clearStoredCompanyDays();
              }}
            />
          </div>
        </div>

        <footer className="mt-6">
          <Button
            type="submit"
            disabled={isLoading || !days || parseInt(days) <= 0}
            className={cn(
              'w-full',
              'bg-violet-500 hover:bg-violet-600 dark:bg-violet-400 dark:hover:bg-violet-500',
              'text-white dark:text-gray-900',
              'h-10 rounded-lg',
              'transition-colors',
              'shadow-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-300 focus:ring-offset-2',
            )}
            tabIndex={0}
            role="button"
            aria-label={isLoading ? 'Creating your personalized schedule...' : 'Create My Perfect Schedule'}
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating your personalized schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Create My Perfect Schedule</span>
                </>
              )}
            </span>
          </Button>
        </footer>
      </form>
    </main>
  );
} 