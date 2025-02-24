'use client';

import { FormEvent } from 'react';
import { Button } from './ui/button';
import { Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { DaysInputStep } from './features/form/DaysInputStep';
import { StrategySelectionStep } from './features/form/StrategySelectionStep';
import { HolidaysStep } from './features/form/HolidaysStep';
import { CompanyDaysStep } from './features/form/CompanyDaysStep';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface OptimizerFormProps {
  onSubmitAction: (data: {
    days: number;
    strategy: string;
    companyDaysOff: Array<{ date: string; name: string }>;
    holidays: Array<{ date: string; name: string }>;
  }) => void;
  isLoading?: boolean;
}

export function OptimizerForm({ onSubmitAction, isLoading = false }: OptimizerFormProps) {
  const { state } = useOptimizer();
  const { days, strategy, companyDaysOff, holidays } = state;

  // Initialize local storage sync
  useLocalStorage();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numDays = parseInt(days);
    if (numDays <= 0) return;

    onSubmitAction({ days: numDays, strategy, companyDaysOff, holidays });
  };

  return (
    <main className="bg-teal-50/30 dark:bg-gray-800/60 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-300/10 shadow-sm">
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
            <DaysInputStep />
            <StrategySelectionStep />
            <HolidaysStep />
            <CompanyDaysStep />
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