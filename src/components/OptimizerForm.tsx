'use client';

import { FormEvent, KeyboardEvent, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CustomDayOff, OptimizationStrategy } from '@/types';
import { format, parse } from 'date-fns';
import { Calendar, Coffee, MapPin, Palmtree, Shuffle, Sparkles, Star, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { OPTIMIZATION_STRATEGIES } from '@/constants';
import { MonthCalendarSelector } from './features/components/MonthCalendarSelector';
import { clearStoredHolidays, getStoredHolidays, removeStoredHoliday, storeHoliday } from '@/lib/storage/holidays';
import {
  clearStoredCustomDays,
  getStoredCustomDays,
  removeStoredCustomDay,
  storeCustomDay,
} from '@/lib/storage/customDays';
import { detectPublicHolidays } from '@/services/holidays';
import { toast } from 'sonner';
import { DateList } from './features/components/DateList';

interface OptimizerFormProps {
  onSubmitAction: (data: {
    days: number
    strategy: OptimizationStrategy
    customDaysOff: CustomDayOff[]
    holidays: Array<{ date: string, name: string }>
  }) => void;
  isLoading?: boolean;
}

// Update the icons type to match strategy IDs
const STRATEGY_ICONS: Record<OptimizationStrategy, typeof Shuffle> = {
  balanced: Shuffle,
  miniBreaks: Star,
  longWeekends: Coffee,
  weekLongBreaks: Sunrise,
  extendedVacations: Palmtree,
};

export function OptimizerForm({ onSubmitAction, isLoading = false }: OptimizerFormProps) {
  const { state, dispatch } = useOptimizer();
  const { days, strategy, errors, customDaysOff, holidays } = state;

  // Load stored holidays and custom days on mount
  useEffect(() => {
    // Load public holidays
    const storedHolidays = getStoredHolidays();
    storedHolidays.forEach(day => {
      dispatch({ type: 'ADD_HOLIDAY', payload: day });
    });

    // Load custom days
    const storedCustomDays = getStoredCustomDays();
    storedCustomDays.forEach(day => {
      dispatch({ type: 'ADD_CUSTOM_DAY', payload: day });
    });
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numDays = parseInt(days);
    if (numDays <= 0) return;

    onSubmitAction({ days: numDays, strategy, customDaysOff, holidays });
  };

  const handleCustomDayRemove = (index: number) => {
    dispatch({ type: 'REMOVE_CUSTOM_DAY', payload: index });
    removeStoredCustomDay(index);
  };

  const handleCustomDaySelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = customDaysOff.some(day => day.date === formattedDate);

    if (isSelected) {
      const index = customDaysOff.findIndex(day => day.date === formattedDate);
      dispatch({ type: 'REMOVE_CUSTOM_DAY', payload: index });
      removeStoredCustomDay(index);
    } else {
      const customDay = {
        name: format(date, 'MMMM d, yyyy'),
        date: formattedDate,
      };
      dispatch({ type: 'ADD_CUSTOM_DAY', payload: customDay });
      storeCustomDay(customDay);
    }
  };

  const handleStrategyKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OPTIMIZATION_STRATEGIES.findIndex(s => s.id === strategy);
    const lastIndex = OPTIMIZATION_STRATEGIES.length - 1;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        const prevStrategy = OPTIMIZATION_STRATEGIES[prevIndex];
        dispatch({ type: 'SET_STRATEGY', payload: prevStrategy.id });
        const radioInput = document.querySelector<HTMLInputElement>(`input[value="${prevStrategy.id}"]`);
        radioInput?.focus();
        break;
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        const nextStrategy = OPTIMIZATION_STRATEGIES[nextIndex];
        dispatch({ type: 'SET_STRATEGY', payload: nextStrategy.id });
        const radioInput = document.querySelector<HTMLInputElement>(`input[value="${nextStrategy.id}"]`);
        radioInput?.focus();
        break;
      }
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

  const handleHolidayRemove = (index: number) => {
    dispatch({ type: 'REMOVE_HOLIDAY', payload: index });
    removeStoredHoliday(index);
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
            {/* Step 1: Days Input Section */}
            <section
              className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-teal-900/5 dark:ring-teal-300/10 space-y-2"
              aria-labelledby="days-heading"
            >
              <header>
                <h2 id="days-heading"
                    className="text-xs font-medium text-teal-900 dark:text-teal-100 flex items-center gap-1.5">
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-medium text-teal-900 dark:text-teal-100">1</span>
                  Start with Your Days
                </h2>
                <p id="days-description" className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  How many paid time off days do you have? We&apos;ll optimize your days from today until the end of the
                  year, making every single one count.
                </p>
              </header>
              <div>
                <label htmlFor="days" className="sr-only">Enter number of CTO days available (numeric input
                  field)</label>
                <Input
                  autoFocus
                  id="days"
                  name="days"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => {
                    dispatch({ type: 'SET_DAYS', payload: e.target.value });
                  }}
                  className={cn(
                    'max-w-[160px] h-8 bg-white dark:bg-gray-900 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 text-sm text-teal-900 dark:text-teal-100',
                    errors.days && 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500',
                  )}
                  required
                  aria-describedby="days-description days-error"
                  aria-invalid={!!errors.days}
                  aria-errormessage={errors.days ? 'days-error' : undefined}
                />
                {errors.days && (
                  <p id="days-error" role="alert" className="text-[10px] text-red-500 dark:text-red-400 mt-1">
                    {errors.days}
                  </p>
                )}
              </div>
            </section>

            {/* Step 2: Strategy Selection Section */}
            <section
              className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-blue-900/5 dark:ring-blue-300/10 space-y-2"
              aria-labelledby="strategy-heading"
            >
              <header>
                <h2 id="strategy-heading"
                    className="text-xs font-medium text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-[10px] font-medium text-blue-900 dark:text-blue-100">2</span>
                  Pick Your Perfect Style
                </h2>
                <p id="strategy-description" className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  Choose how you&apos;d like to enjoy your time off. Each style is designed to match different
                  preferences.
                </p>
              </header>
              <div
                role="radiogroup"
                aria-labelledby="strategy-heading"
                aria-describedby="strategy-description"
                className="space-y-1.5"
                onKeyDown={handleStrategyKeyDown}
              >
                {OPTIMIZATION_STRATEGIES.map((strategyOption, index) => {
                  const Icon = STRATEGY_ICONS[strategyOption.id];
                  const isSelected = strategy === strategyOption.id;

                  return (
                    <label
                      key={strategyOption.id}
                      className={cn(
                        'flex items-center p-2 rounded-lg transition-all duration-200 cursor-pointer',
                        'focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600',
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-900/30 ring-1 ring-blue-900/10 dark:ring-blue-400/10'
                          : 'bg-white dark:bg-gray-800/60 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-blue-200 dark:hover:ring-blue-800',
                      )}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        value={strategyOption.id}
                        checked={isSelected}
                        className="sr-only"
                        tabIndex={isSelected || (index === 0 && !strategy) ? 0 : -1}
                        onChange={() => dispatch({ type: 'SET_STRATEGY', payload: strategyOption.id })}
                      />
                      <div className="flex items-center gap-2 w-full">
                        <div className={cn(
                          'p-1.5 rounded-md',
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                        )}>
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                            {strategyOption.label}
                            {strategyOption.id === 'balanced' && (
                              <span
                                className="ml-1.5 inline-flex items-center rounded-md bg-blue-50/80 dark:bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-900 dark:text-blue-100 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
                                Recommended
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-600 dark:text-gray-300">
                            {strategyOption.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300 flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Public Holidays Section */}
            <section
              className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-amber-900/5 dark:ring-amber-300/10"
              aria-labelledby="holidays-heading"
            >
              <header className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 id="holidays-heading"
                      className="text-xs font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 text-[10px] font-medium text-amber-900 dark:text-amber-100">3</span>
                    Include Public Holidays
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                    onClick={handleAutoDetectHolidays}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Auto-detect
                  </Button>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-300">
                  Mark the holidays that apply to you or use auto-detect. We&apos;ll optimize around these to maximize
                  your extended breaks.
                </p>
              </header>

              <div className="space-y-6">
                {/* Calendar Selection */}
                <MonthCalendarSelector
                  selectedDates={holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()))}
                  onDateSelect={handleHolidaySelect}
                  colorScheme="amber"
                />

                {/* Selected Dates List */}
                <DateList
                  items={holidays}
                  title="Selected Holidays"
                  colorScheme="amber"
                  onRemove={handleHolidayRemove}
                  onClearAll={() => {
                    dispatch({ type: 'CLEAR_HOLIDAYS' });
                    clearStoredHolidays();
                  }}
                />
              </div>
            </section>

            {/* Step 4: Custom Days Off Section */}
            <section
              className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-violet-900/5 dark:ring-violet-300/10"
              aria-labelledby="custom-days-heading"
            >
              <header className="mb-4">
                <h2 id="custom-days-heading"
                    className="text-xs font-medium text-violet-900 dark:text-violet-100 flex items-center gap-2">
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900 text-[10px] font-medium text-violet-900 dark:text-violet-100">4</span>
                  Add Company Days
                </h2>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  Select your company&apos;s special days off (like Summer Fridays or team events). We&apos;ll work
                  these into
                  your perfect schedule.
                </p>
              </header>

              <div className="space-y-6">
                {/* Calendar Selection */}
                <MonthCalendarSelector
                  selectedDates={customDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()))}
                  onDateSelect={handleCustomDaySelect}
                  colorScheme="violet"
                />

                {/* Selected Custom Days List */}
                <DateList
                  items={customDaysOff}
                  title="Selected Company Days"
                  colorScheme="violet"
                  onRemove={handleCustomDayRemove}
                  onClearAll={() => {
                    dispatch({ type: 'CLEAR_CUSTOM_DAYS' });
                    clearStoredCustomDays();
                  }}
                />
              </div>
            </section>

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
            aria-label={isLoading ? 'Creating your personalized schedule...' : 'Create My Perfect Schedule'}
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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