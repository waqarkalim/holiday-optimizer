import { Input } from '../../ui/input';
import { cn } from '@/lib/utils';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useDaysInput } from '@/hooks/useOptimizer';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';

export function DaysInputStep() {
  const { days, errors, setDays } = useDaysInput();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setDays(e.target.value);

  // Using the new StepTitleWithInfo component
  const titleWithInfo = (
    <StepTitleWithInfo
      title="Enter Your Days"
      colorScheme="teal"
      badge={{ label: "Required" }}
      tooltip={{
        title: "Your Available PTO",
        description: "Enter how many paid time off days you have available. These are workdays you can take off while still getting paid. The optimizer will distribute them strategically.",
        ariaLabel: "About your PTO days"
      }}
    />
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
        description="Enter how many paid time off days you have available. The app will optimize their use from today through the end of the year."
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