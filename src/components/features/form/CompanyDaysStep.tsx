import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '../components/DateList';
import { parse } from 'date-fns';
import { CompanyDaysStepProps } from './types';
import { StepHeader } from './components/StepHeader';

export function CompanyDaysStep({
  companyDaysOff,
  onCompanyDaySelect,
  onCompanyDayRemove,
  onClearCompanyDays,
}: CompanyDaysStepProps) {
  return (
    <section
      className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-violet-900/5 dark:ring-violet-300/10"
      aria-labelledby="company-days-heading"
    >
      <StepHeader
        number={4}
        title="Company Days Off"
        description="Select your company's special days off (like Summer Fridays or team events). We'll work these into your perfect schedule."
        colorScheme="violet"
        id="company-days-heading"
      />

      <div className="space-y-6" role="group" aria-labelledby="company-days-heading">
        {/* Calendar Selection */}
        <MonthCalendarSelector
          id="company-days-calendar"
          selectedDates={companyDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()))}
          onDateSelect={onCompanyDaySelect}
          colorScheme="violet"
        />

        {/* Selected Company Days List */}
        <DateList
          items={companyDaysOff}
          title="Selected Company Days"
          colorScheme="violet"
          onRemove={onCompanyDayRemove}
          onClearAll={onClearCompanyDays}
          showName={false}
        />
      </div>
    </section>
  );
} 