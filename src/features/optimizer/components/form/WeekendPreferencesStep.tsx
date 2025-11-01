import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { cn } from '@/shared/lib/utils';
import { WEEKDAYS } from '@/constants';
import { WeekdayNumber } from '@/types';

const FULL_WEEKDAY_NAMES: Record<WeekdayNumber, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const getSelectedWeekendLabel = (weekendDays: WeekdayNumber[]) => {
  const names = WEEKDAYS.reduce<string[]>((acc, _label, index) => {
    if (weekendDays.includes(index as WeekdayNumber)) {
      acc.push(FULL_WEEKDAY_NAMES[index as WeekdayNumber]);
    }
    return acc;
  }, []);

  if (names.length === 0) {
    return 'None selected';
  }

  if (names.length === 1) {
    return names[0];
  }

  const last = names[names.length - 1];
  const initial = names.slice(0, -1);
  return `${initial.join(', ')} and ${last}`;
};

export function WeekendPreferencesStep() {
  const { weekendDays, setWeekendDays } = useOptimizerForm();

  const selectedWeekendLabel = getSelectedWeekendLabel(weekendDays);

  const toggleWeekendDay = (day: WeekdayNumber) => {
    const isSelected = weekendDays.includes(day);

    if (isSelected) {
      if (weekendDays.length === 1) {
        return;
      }
      setWeekendDays(weekendDays.filter(existing => existing !== day));
      return;
    }

    setWeekendDays([...weekendDays, day].sort((a, b) => a - b) as WeekdayNumber[]);
  };

  const titleWithInfo = (
    <StepTitleWithInfo
      title="Customize Weekends"
      colorScheme="amber"
      tooltip={{
        title: 'Your Weekly Days Off',
        description:
          'Pick the days you regularly have off. The optimizer treats these as weekend days when building extended breaks.',
        ariaLabel: 'About choosing weekend days',
      }}
    />
  );

  return (
    <FormSection colorScheme="amber" headingId="weekend-preferences-heading">
      <StepHeader
        number={7}
        title={titleWithInfo}
        description="Select the days you normally have off each week. This helps us identify extended weekends and bridge PTO days effectively."
        colorScheme="amber"
        id="weekend-preferences-heading"
      />
      <fieldset className="border-0 m-0 p-0 space-y-2" aria-labelledby="weekend-preferences-heading">
        <legend className="sr-only">Choose weekend days</legend>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full" role="group" aria-label="Weekend day options">
          {WEEKDAYS.map((label, index) => {
            const value = index as WeekdayNumber;
            const isSelected = weekendDays.includes(value);

            return (
              <label
                key={label}
                className={cn(
                  'relative flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer flex-1',
                  'focus-within:ring-2 focus-within:ring-amber-500/60 focus-within:border-transparent',
                  isSelected
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-amber-200 text-amber-700 hover:border-amber-300'
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  id={`weekend-day-${label}`}
                  name="weekend-days"
                  aria-label={FULL_WEEKDAY_NAMES[value]}
                  checked={isSelected}
                  onChange={() => toggleWeekendDay(value)}
                />
                <span aria-hidden>{label}</span>
              </label>
            );
          })}
        </div>
        <div className="flex items-center justify-start text-xs text-amber-900/80">
          <span>Selected: {selectedWeekendLabel}</span>
        </div>
        <p className="text-[11px] text-amber-900/70">
          At least one day stays selected so your extended weekends stay meaningful.
        </p>
      </fieldset>
    </FormSection>
  );
}
