import { FormSection } from './components/FormSection';
import { StepHeader } from './components/StepHeader';
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

const buildSelectedLabel = (remoteWorkDays: WeekdayNumber[]) => {
  if (remoteWorkDays.length === 0) {
    return 'No travel days selected';
  }

  const names = WEEKDAYS.reduce<string[]>((acc, label, index) => {
    if (remoteWorkDays.includes(index as WeekdayNumber)) {
      acc.push(FULL_WEEKDAY_NAMES[index as WeekdayNumber]);
    }
    return acc;
  }, []);

  if (names.length === 1) {
    return names[0];
  }

  const last = names[names.length - 1];
  const initial = names.slice(0, -1);
  return `${initial.join(', ')} and ${last}`;
};

export function RemoteWorkTravelStep() {
  const { remoteWorkDays, setRemoteWorkDays } = useOptimizerForm();

  const toggleRemoteDay = (day: WeekdayNumber) => {
    const isSelected = remoteWorkDays.includes(day);

    if (isSelected) {
      setRemoteWorkDays(remoteWorkDays.filter(existing => existing !== day));
      return;
    }

    setRemoteWorkDays([...remoteWorkDays, day].sort((a, b) => a - b) as WeekdayNumber[]);
  };

  const titleWithInfo = (
    <StepTitleWithInfo
      title="Remote Travel Days"
      colorScheme="cyan"
      tooltip={{
        title: 'Travel-Friendly Work Days',
        description:
          'Select the weekdays you typically work remotely. We will treat these as travel-friendly days so you can extend a break without using PTO while still working.',
        ariaLabel: 'About remote travel-friendly days',
      }}
      badge={{ label: 'Optional' }}
    />
  );

  return (
    <FormSection colorScheme="cyan" headingId="remote-work-days-heading">
      <StepHeader
        number={8}
        title={titleWithInfo}
        description="Mark the work-from-home days you can travel on. They will extend your getaway without consuming PTO."
        colorScheme="cyan"
        id="remote-work-days-heading"
      />

      <fieldset className="border-0 m-0 p-0 space-y-2" aria-labelledby="remote-work-days-heading">
        <legend className="sr-only">Choose remote-friendly weekdays</legend>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full" role="group" aria-label="Remote travel day options">
          {WEEKDAYS.map((label, index) => {
            const value = index as WeekdayNumber;
            const isSelected = remoteWorkDays.includes(value);

            return (
              <label
                key={label}
                className={cn(
                  'relative flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer flex-1',
                  'focus-within:ring-2 focus-within:ring-cyan-500/60 focus-within:border-transparent',
                  isSelected
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-900'
                    : 'bg-white border-cyan-200 text-cyan-700 hover:border-cyan-300'
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  id={`remote-work-day-${label}`}
                  name="remote-work-days"
                  aria-label={FULL_WEEKDAY_NAMES[value]}
                  checked={isSelected}
                  onChange={() => toggleRemoteDay(value)}
                />
                <span aria-hidden>{label}</span>
              </label>
            );
          })}
        </div>
        <div className="flex items-center justify-start text-xs text-cyan-900/80">
          <span>Selected: {buildSelectedLabel(remoteWorkDays)}</span>
        </div>
        <p className="text-[11px] text-cyan-900/70">
          Remote days never use PTO but will still appear in your plan so you can travel while working.
        </p>
      </fieldset>
    </FormSection>
  );
}
