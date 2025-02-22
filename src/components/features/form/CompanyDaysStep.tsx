import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '../components/DateList';
import { parse } from 'date-fns';
import { CompanyDaysStepProps } from './types';

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
      <header className="mb-4">
        <h2 id="company-days-heading"
            className="text-xs font-medium text-violet-900 dark:text-violet-100 flex items-center gap-2">
          <span
            className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900 text-[10px] font-medium text-violet-900 dark:text-violet-100">4</span>
          Add Company Days
        </h2>
        <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
          Select your company&apos;s special days off (like Summer Fridays or team events). We&apos;ll work
          these into your perfect schedule.
        </p>
      </header>

      <div className="space-y-6">
        {/* Calendar Selection */}
        <MonthCalendarSelector
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
        />
      </div>
    </section>
  );
} 