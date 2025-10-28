'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useEffectEvent } from '@/shared/hooks/useEffectEvent';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle, Calendar, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { DaysInputStep } from './form/DaysInputStep';
import { WeekendPreferencesStep } from './form/WeekendPreferencesStep';
import { StrategySelectionStep } from './form/StrategySelectionStep';
import { HolidaysStep } from './form/HolidaysStep';
import { PreBookedDaysStep } from './form/PreBookedDaysStep';
import { CompanyDaysStep } from './form/CompanyDaysStep';
import { TimeframeStep } from './form/TimeframeStep';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { useLocalStorage } from '@/features/optimizer/hooks/useLocalStorage';
import { OptimizationStrategy, WeekdayNumber } from '@/types';
import { DEFAULT_WEEKEND_DAYS } from '@/constants';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { trackEvent } from '@/utils/tracking';


interface FormData {
  days: number;
  strategy: OptimizationStrategy;
  companyDaysOff: Array<{ date: string; name: string }>;
  preBookedDays: Array<{ date: string; name: string }>;
  holidays: Array<{ date: string; name: string }>;
  selectedYear: number;
  weekendDays: WeekdayNumber[];
  customStartDate?: string;
  customEndDate?: string;
}

interface OptimizerFormProps {
  onSubmitAction: (data: FormData) => void;
  isLoading?: boolean;
}

export function OptimizerForm({ onSubmitAction, isLoading = false }: OptimizerFormProps) {
  const {
    days,
    strategy,
    companyDaysOff,
    preBookedDays,
    holidays,
    selectedYear,
    weekendDays,
    customStartDate,
    customEndDate,
  } =
    useOptimizerForm();

  // Reference to manage focus flow - moved to dedicated refs for better semantic structure
  const daysInputRef = useRef<HTMLFieldSetElement>(null);
  const errorMessageRef = useRef<HTMLDivElement>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [advancedPreference, setAdvancedPreference] = useState<'shown' | 'hidden' | null>(null);
  const companyDaysCount = companyDaysOff.length;
  const preBookedDaysCount = preBookedDays.length;

  // Initialize local storage sync
  useLocalStorage();

  // Check if form is valid - requires both days and country/holidays selection
  const isDaysValid = Boolean(days) && parseInt(days) > 0;
  const areHolidaysValid = holidays.length > 0;
  const isFormValid = isDaysValid && areHolidaysValid;

  // Scroll to the error message when validation fails after submission attempt
  const scrollErrorMessageIntoView = useEffectEvent(() => {
    if (errorMessageRef.current) {
      errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  useEffect(() => {
    if (attemptedSubmit && !isFormValid) {
      scrollErrorMessageIntoView();
    }
  }, [attemptedSubmit, isFormValid]);

  const defaultWeekend = new Set(DEFAULT_WEEKEND_DAYS);
  const chosenWeekend = new Set(weekendDays);
  const isDefaultWeekend =
    chosenWeekend.size === defaultWeekend.size && [...defaultWeekend].every(day => chosenWeekend.has(day));

  const shouldAutoExpandAdvanced =
    !isDefaultWeekend || companyDaysCount > 0 || preBookedDaysCount > 0;

  const showAdvanced =
    advancedPreference === 'shown' ||
    (advancedPreference !== 'hidden' && shouldAutoExpandAdvanced);

  const toggleAdvancedVisibility = () => {
    setAdvancedPreference(showAdvanced ? 'hidden' : 'shown');
  };

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
      preBookedDays,
      holidays,
      selectedYear,
      weekendDays,
      customStartDate,
      customEndDate,
    };

    // Track form submission with Umami
    trackEvent('Form Submitted!', {
      days: numDays,
      strategy,
      year: selectedYear,
      companyDaysCount,
      preBookedDaysCount,
      holidaysCount: holidays.length,
      customStartDate: customStartDate ?? 'default',
      customEndDate: customEndDate ?? 'default',
    });

    onSubmitAction(formData);
  };


  return (
    <Card variant="primary">
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="form-title">
        <CardHeader className="pb-0">
          <CardTitle id="form-title" className="flex items-center gap-1.5 text-teal-900">
            <Calendar className="h-4 w-4 text-teal-600" aria-hidden="true" />
            Plan Your Year
          </CardTitle>
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
              id="timeframe-container"
              data-onboarding-target="timeframe-selection"
            >
              <TimeframeStep />
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
            <div className="pt-2 mt-3 border-t border-dashed border-violet-200/60">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium text-violet-800 hover:text-violet-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-md px-1.5 py-1"
                onClick={toggleAdvancedVisibility}
                aria-expanded={showAdvanced}
                aria-controls="advanced-options-container"
              >
                {showAdvanced ? (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
              </button>

              {showAdvanced && (
                <div id="advanced-options-container" className="mt-2 space-y-2">
                  <fieldset
                    className="border-0 m-0 p-0"
                    id="pre-booked-days-container"
                    data-onboarding-target="pre-booked-days"
                  >
                    <PreBookedDaysStep />
                  </fieldset>
                  <fieldset
                    className="border-0 m-0 p-0"
                    id="company-days-container"
                    data-onboarding-target="company-days"
                  >
                    <CompanyDaysStep />
                  </fieldset>
                  <fieldset className="border-0 m-0 p-0" data-onboarding-target="weekend-preferences">
                    <WeekendPreferencesStep />
                  </fieldset>
                </div>
              )}
            </div>
          </TooltipProvider>
        </CardContent>

        <CardFooter className="flex flex-col items-end gap-1.5">
          {!isLoading && !isFormValid && (
            <div
              ref={errorMessageRef}
              className="flex items-center gap-1 text-xs text-red-600 text-right w-full justify-end"
            >
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
            title={
              !isDaysValid
                ? 'Please enter the number of PTO days'
                : !areHolidaysValid
                  ? 'Please select your country to load holidays'
                  : 'Generate your optimized schedule'
            }
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
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
