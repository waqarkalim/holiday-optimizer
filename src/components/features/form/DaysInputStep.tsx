import { Input } from '../../ui/input';
import { cn } from '@/lib/utils';
import { DaysInputStepProps } from './types';

export function DaysInputStep({ days, onDaysChange, errors }: DaysInputStepProps) {
  return (
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
            'max-w-[160px] h-8 bg-white dark:bg-gray-900 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 text-sm text-teal-900 dark:text-teal-100',
            errors?.days && 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500',
          )}
          required
          aria-describedby="days-description days-error"
          aria-invalid={!!errors?.days}
          aria-errormessage={errors?.days ? 'days-error' : undefined}
        />
        {errors?.days && (
          <p id="days-error" role="alert" className="text-[10px] text-red-500 dark:text-red-400 mt-1">
            {errors.days}
          </p>
        )}
      </div>
    </section>
  );
} 