'use client';

import { FormEvent, KeyboardEvent, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CustomDayOff, OptimizationStrategy } from '@/types';
import { format, parse } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Palmtree,
  Shuffle,
  Sparkles,
  Star,
  Sunrise,
  X,
} from 'lucide-react';
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

const WEEKDAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
] as const;

interface OptimizerFormProps {
  onSubmit: (data: {
    days: number
    strategy: OptimizationStrategy
    customDaysOff: CustomDayOff[]
    holidays: Array<{ date: string, name: string }>
  }) => void;
  isLoading?: boolean;
}

type CustomDayField = keyof Partial<CustomDayOff>

// Update the icons type to match strategy IDs
const STRATEGY_ICONS: Record<OptimizationStrategy, typeof Shuffle> = {
  balanced: Shuffle,
  miniBreaks: Star,
  longWeekends: Coffee,
  weekLongBreaks: Sunrise,
  extendedVacations: Palmtree,
};

export function OptimizerForm({ onSubmit, isLoading = false }: OptimizerFormProps) {
  const { state, dispatch } = useOptimizer();
  const {
    days,
    strategy,
    errors,
    customDaysOff,
    holidays,
    selectedDates,
    currentMonth,
    currentYear,
  } = state;

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

    if (numDays > 0) {
      onSubmit({
        days: numDays,
        strategy,
        customDaysOff,
        holidays,
      });
    } else {
      return;
    }
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
        date: formattedDate
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
        date: formattedDate
      };
      dispatch({ type: 'ADD_HOLIDAY', payload: holiday });
      storeHoliday(holiday);
    }
    // const formattedDate = format(date, 'yyyy-MM-dd');
    // const isSelected = selectedDates.some(d =>
    //   format(d, 'yyyy-MM-dd') === formattedDate
    // );
    //
    // if (isSelected) {
    //   dispatch({
    //     type: 'REMOVE_HOLIDAY',
    //     payload: holidays.findIndex(h => h.date === formattedDate)
    //   });
    //   removeStoredHoliday(date);
    // } else {
    //   dispatch({
    //     type: 'ADD_HOLIDAY',
    //     payload: {
    //       date: formattedDate,
    //       name: format(date, 'MMMM d, yyyy')
    //     }
    //   });
    //   storeHoliday(date);
    // }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      dispatch({ type: 'SET_MONTH', payload: 11 });
      dispatch({ type: 'SET_YEAR', payload: currentYear - 1 });
    } else {
      dispatch({ type: 'SET_MONTH', payload: currentMonth - 1 });
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      dispatch({ type: 'SET_MONTH', payload: 0 });
      dispatch({ type: 'SET_YEAR', payload: currentYear + 1 });
    } else {
      dispatch({ type: 'SET_MONTH', payload: currentMonth + 1 });
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
              In just 4 simple steps, we'll help you create the perfect balance of work and life, maximizing every day off.
            </p>
          </header>

          <div className="space-y-3">
            {/* Step 1: Days Input Section */}
            <section
              className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-teal-900/5 dark:ring-teal-300/10 space-y-2"
              aria-labelledby="days-heading"
            >
              <header>
                <h2 id="days-heading" className="text-xs font-medium text-teal-900 dark:text-teal-100 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-medium text-teal-900 dark:text-teal-100">1</span>
                  Start with Your Days
                </h2>
                <p id="days-description" className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  How many paid time off days do you have? We'll make every single one count.
                </p>
              </header>
              <div>
                <label htmlFor="days" className="sr-only">Enter number of CTO days available (numeric input field)</label>
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
                <h2 id="strategy-heading" className="text-xs font-medium text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-[10px] font-medium text-blue-900 dark:text-blue-100">2</span>
                  Pick Your Perfect Style
                </h2>
                <p id="strategy-description" className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  Choose how you'd like to enjoy your time off. Each style is designed to match different preferences.
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
                <h2 id="holidays-heading" className="text-xs font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 text-[10px] font-medium text-amber-900 dark:text-amber-100">3</span>
                  Include Public Holidays
                </h2>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  Mark the holidays that apply to you. We'll optimize around these to maximize your extended breaks.
                </p>
              </header>

              <div className="space-y-6">
                {/* Calendar Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleNextMonth}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <MonthCalendarSelector
                    selectedDates={holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()))}
                    onDateSelect={handleHolidaySelect}
                    month={currentMonth}
                    year={currentYear}
                  />
                </div>

                {/* Selected Dates List */}
                {holidays.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        Selected Holidays
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-[10px] text-amber-900 dark:text-amber-100">
                          {holidays.length}
                        </span>
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => {
                          dispatch({ type: 'CLEAR_HOLIDAYS' });
                          clearStoredHolidays();
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="pr-2 -mr-2">
                      <ul className="grid gap-1.5" aria-label="Selected holidays">
                        {holidays.map((holiday, index) => (
                          <li
                            key={index}
                            className="group flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800/60 rounded-md border border-gray-200 dark:border-gray-700/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 text-center font-medium text-amber-600 dark:text-amber-400">
                                {format(parse(holiday.date, 'yyyy-MM-dd', new Date()), 'd')}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {format(parse(holiday.date, 'yyyy-MM-dd', new Date()), 'MMMM yyyy')}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCustomDayRemove(index)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Step 4: Custom Days Off Section */}
            <section
              className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-violet-900/5 dark:ring-violet-300/10"
              aria-labelledby="custom-days-heading"
            >
              <header className="mb-4">
                <h2 id="custom-days-heading" className="text-xs font-medium text-violet-900 dark:text-violet-100 flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900 text-[10px] font-medium text-violet-900 dark:text-violet-100">4</span>
                  Add Company Days
                </h2>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  Select your company's special days off (like Summer Fridays or team events). We'll work these into your perfect schedule.
                </p>
              </header>

              <div className="space-y-6">
                {/* Calendar Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleNextMonth}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <MonthCalendarSelector
                    selectedDates={customDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()))}
                    onDateSelect={handleCustomDaySelect}
                    month={currentMonth}
                    year={currentYear}
                  />
                </div>

                {/* Selected Custom Days List */}
                {customDaysOff.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        Selected Company Days
                        <span className="px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/30 text-[10px] text-violet-900 dark:text-violet-100">
                          {customDaysOff.length}
                        </span>
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => {
                          dispatch({ type: 'CLEAR_CUSTOM_DAYS' });
                          clearStoredCustomDays();
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="pr-2 -mr-2">
                      <ul className="grid gap-1.5" aria-label="Selected custom days">
                        {customDaysOff.map((day, index) => (
                          <li
                            key={index}
                            className="group flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800/60 rounded-md border border-gray-200 dark:border-gray-700/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 text-center font-medium text-violet-600 dark:text-violet-400">
                                {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'd')}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMMM yyyy')}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCustomDayRemove(index)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
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