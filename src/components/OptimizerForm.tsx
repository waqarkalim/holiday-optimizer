'use client';

import { FormEvent } from 'react';
import { Button } from './ui/button';
import { Calendar, Sparkles } from 'lucide-react';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { DaysInputStep } from './features/form/DaysInputStep';
import { StrategySelectionStep } from './features/form/StrategySelectionStep';
import { HolidaysStep } from './features/form/HolidaysStep';
import { CompanyDaysStep } from './features/form/CompanyDaysStep';
import { YearSelectionStep } from './features/form/YearSelectionStep';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OptimizationStrategy } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { TooltipProvider } from './ui/tooltip';

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

  // Initialize local storage sync
  useLocalStorage();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numDays = parseInt(days);
    
    if (numDays <= 0) return;
    
    const formData: FormData = { 
      days: numDays, 
      strategy, 
      companyDaysOff, 
      holidays,
      selectedYear
    };
    
    onSubmitAction(formData);
  };

  const isFormValid = days && parseInt(days) > 0;

  const loadingContent = (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>Creating your personalized schedule...</span>
    </span>
  );

  const submitContent = (
    <span className="flex items-center justify-center gap-2">
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      <span>Create My Perfect Schedule</span>
    </span>
  );

  return (
    <Card variant="primary">
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Time off optimizer">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-teal-900 dark:text-teal-100">
            <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
            Design Your Dream Year
          </CardTitle>
          <CardDescription>
            Just 4 essential steps to optimize your time off, with an optional 5th to fine-tune your perfect work-life balance.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <TooltipProvider>
            <YearSelectionStep />
            <DaysInputStep />
            <StrategySelectionStep />
            <HolidaysStep />
            <CompanyDaysStep />
          </TooltipProvider>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            variant="primary-action"
            disabled={isLoading || !isFormValid}
            tabIndex={0}
            role="button"
            aria-label={isLoading ? 'Creating your personalized schedule...' : 'Create My Perfect Schedule'}
          >
            {isLoading ? loadingContent : submitContent}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 