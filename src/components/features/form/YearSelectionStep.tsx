'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYearSelection } from '@/hooks/useOptimizer';
import { FormSection } from './components/FormSection';
import { StepHeader } from './components/StepHeader';

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029];

export function YearSelectionStep() {
  const { selectedYear, setSelectedYear } = useYearSelection();

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  return (
    <FormSection colorScheme="teal" headingId="year-heading">
      <StepHeader
        number={1}
        title="Choose Year"
        description="Select which year you want to plan your time off"
        colorScheme="teal"
        id="year-heading"
      />
      <div className="pt-1">
        <label htmlFor="year-select" className="block text-sm font-medium text-teal-900 dark:text-teal-100 mb-1.5">
          Planning Year
        </label>
        <Select
          value={selectedYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger
            id="year-select"
            className="border-teal-200 bg-white focus:ring-teal-500 dark:border-teal-800 dark:bg-teal-950 max-w-[160px]"
            aria-label="Select planning year"
          >
            <SelectValue placeholder="Select a year" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_YEARS.map((year) => (
              <SelectItem
                key={year}
                value={year.toString()}
                className="cursor-pointer focus:bg-teal-100 focus:text-teal-900 dark:focus:bg-teal-800 dark:focus:text-teal-50"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </FormSection>
  );
} 