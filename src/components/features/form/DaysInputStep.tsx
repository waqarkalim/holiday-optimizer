import { Input } from '../../ui/input';
import { cn } from '@/lib/utils';
import { DaysInputStepProps } from './types';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';

export function DaysInputStep({ days, onDaysChange, errors }: DaysInputStepProps) {
  return (
    <FormSection colorScheme="teal" headingId="days-heading">
      <StepHeader
        number={1}
        title="Start with Your Days"
        description="How many paid time off days do you have? We'll optimize your days from today until the end of the year, making every single one count."
        colorScheme="teal"
        id="days-heading"
      />
      <div className="pt-1">
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
          onChange={(e) => onDaysChange(e.target.value)}
          className={cn(
            'max-w-[160px] h-9',
            'bg-white dark:bg-gray-900',
            'border-teal-200 dark:border-teal-800',
            'focus:border-teal-400 dark:focus:border-teal-600',
            'text-sm font-medium text-teal-900 dark:text-teal-100',
            'placeholder:text-teal-400 dark:placeholder:text-teal-500',
            'transition-colors duration-200',
            errors?.days && 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500',
          )}
          placeholder="Enter days"
          required
          aria-describedby="days-description days-error"
          aria-invalid={!!errors?.days}
          aria-errormessage={errors?.days ? 'days-error' : undefined}
        />
        {errors?.days && (
          <p id="days-error" role="alert" className="text-[11px] font-medium text-red-500 dark:text-red-400 mt-1.5">
            {errors.days}
          </p>
        )}
      </div>
    </FormSection>
  );
} 