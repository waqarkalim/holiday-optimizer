'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { DaysInputStep } from './features/form/DaysInputStep';
import { StrategySelectionStep } from './features/form/StrategySelectionStep';
import { HolidaysStep } from './features/form/HolidaysStep';
import { CompanyDaysStep } from './features/form/CompanyDaysStep';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OptimizationStrategy } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { TooltipProvider } from './ui/tooltip';
import { useYearSelection } from '@/hooks/useOptimizer';
import { trackEvent } from '@/utils/tracking';

// Update to use dynamic calculation based on current year
const AVAILABLE_YEARS = Array.from({ length: 2 }, (_, index) => new Date().getFullYear() + index);

interface FormData {
  days: number;
  strategy: OptimizationStrategy;
  companyDaysOff: Array<{ date: string; name: string }>;
  holidays: Array<{ date: string; name: string }>;
  selectedYear: number;
}

interface OptimizerFormProps {
  onSubmitAction: (data: FormData) => void;
  isLoading?: boolean;
}

export function OptimizerForm({ onSubmitAction, isLoading = false }: OptimizerFormProps) {
  const { state } = useOptimizer();
  const { days, strategy, companyDaysOff, holidays, selectedYear } = state;
  const { setSelectedYear } = useYearSelection();

  // Reference to manage focus flow - moved to dedicated refs for better semantic structure
  const daysInputRef = useRef<HTMLFieldSetElement>(null);
  const errorMessageRef = useRef<HTMLDivElement>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Initialize local storage sync
  useLocalStorage();

  // Check if form is valid - requires both days and country/holidays selection
  const isDaysValid = Boolean(days) && parseInt(days) > 0;
  const areHolidaysValid = holidays.length > 0;
  const isFormValid = isDaysValid && areHolidaysValid;

  // Scroll to the error message when validation fails after submission attempt
  useEffect(() => {
    if (attemptedSubmit && !isFormValid && errorMessageRef.current) {
      errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [attemptedSubmit, isFormValid]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Set attempted submit to true regardless of validation result
    setAttemptedSubmit(true);

    // Don't proceed with form submission if the form is invalid
    if (!isFormValid) return;

    const numDays = parseInt(days);
    if (numDays <= 0) return;

    const formData: FormData = {
      days: numDays,
      strategy,
      companyDaysOff,
      holidays,
      selectedYear,
    };

    // Track form submission with Umami
    trackEvent('Form Submitted!', {
      days: numDays,
      strategy,
      year: selectedYear,
      companyDaysCount: companyDaysOff.length,
      holidaysCount: holidays.length,
    });

    onSubmitAction(formData);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  return (
    <Card variant="primary">
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="form-title">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center justify-between">
              <CardTitle id="form-title" className="flex items-center gap-1.5 text-teal-900 dark:text-teal-100">
                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
                Plan Your Year
              </CardTitle>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center overflow-hidden rounded-md border border-teal-200 dark:border-teal-800 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/70 dark:focus-within:ring-teal-400/70 focus-within:border-transparent">
                <div
                  className="flex h-9 items-center border-r border-teal-200 bg-white px-3 text-xs font-medium text-gray-500 dark:border-teal-800 dark:bg-teal-950/50 dark:text-gray-400">
                  Year:
                </div>
                <div className="relative">
                  <select
                    id="year-select"
                    value={selectedYear.toString()}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="h-9 border-none bg-white px-3 pr-7 text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:bg-teal-950 dark:text-gray-100 appearance-none cursor-pointer transition-all duration-150"
                    aria-label="Select planning year"
                  >
                    {AVAILABLE_YEARS.map((year) => (
                      <option
                        key={year}
                        value={year.toString()}
                        className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                       aria-hidden="true">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardDescription>
            Complete these simple steps to optimize your time off throughout the year.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <TooltipProvider>
            <fieldset
              ref={daysInputRef}
              className="border-0 m-0 p-0"
              id="days-input-container"
              data-onboarding-target="days-input"
            >
              <DaysInputStep />
            </fieldset>
            <fieldset
              className="border-0 m-0 p-0"
              id="strategy-selection-container"
              data-onboarding-target="strategy-selection"
            >
              <StrategySelectionStep />
            </fieldset>
            <fieldset
              className="border-0 m-0 p-0"
              id="holidays-container"
              data-onboarding-target="holidays-selection"
            >
              <HolidaysStep />
            </fieldset>
            <fieldset
              className="border-0 m-0 p-0"
              id="company-days-container"
              data-onboarding-target="company-days"
            >
              <CompanyDaysStep />
            </fieldset>
          </TooltipProvider>
        </CardContent>

        <CardFooter className="flex flex-col items-end gap-1.5">
          {!isLoading && !isFormValid && (
            <div
              ref={errorMessageRef}
              className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 text-right w-full justify-end">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                    {!isDaysValid && !areHolidaysValid
                      ? 'Please enter PTO days and select holidays.'
                      : !isDaysValid
                        ? 'Please enter the number of PTO days.'
                        : 'Please select holidays.'}
                  </span>
            </div>
          )}
          <Button
            type="submit"
            variant="primary-action"
            disabled={isLoading}
            className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
            onClick={() => setAttemptedSubmit(true)}
            aria-busy={isLoading}
            tabIndex={0}
            aria-disabled={!isFormValid}
            title={!isDaysValid
              ? 'Please enter the number of PTO days'
              : !areHolidaysValid
                ? 'Please select your country to load holidays'
                : 'Generate your optimized schedule'}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Optimizing your schedule...</span>
                </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Generate</span>
                </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
