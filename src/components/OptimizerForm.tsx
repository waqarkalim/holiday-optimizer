'use client';

import { FormEvent, useRef } from 'react';
import { Button } from './ui/button';
import { Calendar, Sparkles } from 'lucide-react';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { DaysInputStep } from './features/form/DaysInputStep';
import { StrategySelectionStep } from './features/form/StrategySelectionStep';
import { HolidaysStep } from './features/form/HolidaysStep';
import { CompanyDaysStep } from './features/form/CompanyDaysStep';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OptimizationStrategy } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { TooltipProvider } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useYearSelection } from '@/hooks/useOptimizer';
import { cn } from '@/lib/utils';

// Update to use dynamic calculation based on current year
const AVAILABLE_YEARS = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() + index);

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
  
  // Reference to manage focus flow
  const yearSelectRef = useRef<HTMLButtonElement>(null);
  const daysInputRef = useRef<HTMLDivElement>(null);

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

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
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
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="flex items-center gap-1.5 text-teal-900 dark:text-teal-100">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              Design Your Dream Year
            </CardTitle>
            
            <div className="flex items-center gap-2" role="group" aria-labelledby="year-selection-label">
              <span id="year-selection-label" className="text-sm text-gray-600 dark:text-gray-300">Planning for:</span>
              <div className="relative">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger
                    id="year-select"
                    ref={yearSelectRef}
                    className="h-8 w-28 rounded-md border border-teal-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm ring-offset-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-teal-800 dark:bg-teal-950 dark:text-gray-50"
                    aria-label="Select planning year"
                    tabIndex={0}
                  >
                    <SelectValue placeholder="Select a year" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md w-28 p-1"
                    position="popper"
                    align="end"
                    sideOffset={4}
                  >
                    <div className="max-h-[180px] overflow-y-auto">
                      {AVAILABLE_YEARS.map((year) => {
                        const isSelected = year.toString() === selectedYear.toString();
                        return (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                            className={cn(
                              "flex h-8 px-2 text-sm items-center justify-center rounded-sm cursor-pointer",
                              "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/30",
                              isSelected && "bg-teal-50 text-teal-900 font-medium dark:bg-teal-900/30 dark:text-teal-100"
                            )}
                          >
                            <span>{year}</span>
                          </SelectItem>
                        );
                      })}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <CardDescription>
            Just 3 essential steps to optimize your time off, with an optional 4th to fine-tune your perfect work-life balance.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <TooltipProvider>
            <div 
              ref={daysInputRef} 
              tabIndex={-1}
            >
              <DaysInputStep />
            </div>
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