import { Input } from '../../ui/input';
import { cn } from '@/lib/utils';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useDaysInput } from '@/hooks/useOptimizer';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

export function DaysInputStep() {
  const { days, errors, setDays } = useDaysInput();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setDays(e.target.value);

  // Info tooltip for additional context
  const titleWithInfo = (
    <div className="flex items-center justify-between w-full">
      <span>Start with Your Days</span>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="rounded-full p-1 hover:bg-teal-100/70 dark:hover:bg-teal-900/40 cursor-help transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1" 
            aria-label="About your PTO days"
          >
            <Info className="h-3.5 w-3.5 text-teal-500/70 dark:text-teal-400/70" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start" 
          className="max-w-xs bg-teal-50/95 dark:bg-teal-900/90 border-teal-100 dark:border-teal-800/40 text-teal-900 dark:text-teal-100"
          role="tooltip"
        >
          <div className="space-y-2 p-1">
            <h4 className="font-medium text-teal-800 dark:text-teal-300 text-sm">About Your PTO Days</h4>
            <p className="text-xs text-teal-700/90 dark:text-teal-300/90 leading-relaxed">
              Enter the number of paid time off days you have available to use. 
              This is the total number of workdays you can take off while still 
              getting paid. The optimizer will help you make the most of these days.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const inputClasses = cn(
    'max-w-[160px] h-9',
    'bg-white dark:bg-gray-900',
    'border-teal-200 dark:border-teal-800',
    'focus:border-teal-400 dark:focus:border-teal-600',
    'text-sm font-medium text-teal-900 dark:text-teal-100',
    'placeholder:text-teal-400 dark:placeholder:text-teal-500',
    'transition-colors duration-200',
    errors && 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500',
  );

  return (
    <FormSection colorScheme="teal" headingId="days-heading">
      <StepHeader
        number={1}
        title={titleWithInfo}
        description="How many paid time off days do you have? We'll optimize your days from today until the end of the year, making every single one count."
        colorScheme="teal"
        id="days-heading"
      />
      <fieldset className="pt-1 border-0 m-0 p-0" aria-labelledby="days-heading">
        <legend className="sr-only">Number of paid time off days</legend>
        <label htmlFor="days" className="block text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">
          Number of days
          <span className="sr-only">(numeric input field)</span>
        </label>
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
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter days"
          required
          aria-describedby={errors ? "days-error" : undefined}
          aria-invalid={!!errors}
        />
        {errors && (
          <p id="days-error" role="alert" className="text-xs font-medium text-red-500 dark:text-red-400 mt-1.5">
            {errors}
          </p>
        )}
      </fieldset>
    </FormSection>
  );
} 