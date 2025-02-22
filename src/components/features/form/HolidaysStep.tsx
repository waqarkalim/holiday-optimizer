import { MapPin } from 'lucide-react';
import { Button } from '../../ui/button';
import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '../components/DateList';
import { parse } from 'date-fns';
import { HolidaysStepProps } from './types';

export function HolidaysStep({
  holidays,
  onHolidaySelect,
  onHolidayRemove,
  onClearHolidays,
  onAutoDetect,
}: HolidaysStepProps) {
  return (
    <section
      className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-amber-900/5 dark:ring-amber-300/10"
      aria-labelledby="holidays-heading"
    >
      <header className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 id="holidays-heading"
              className="text-xs font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 text-[10px] font-medium text-amber-900 dark:text-amber-100">3</span>
            Include Public Holidays
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30"
            onClick={onAutoDetect}
          >
            <MapPin className="h-3.5 w-3.5" />
            Auto-detect
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 dark:text-gray-300">
          Mark the holidays that apply to you or use auto-detect. We&apos;ll optimize around these to maximize
          your extended breaks.
        </p>
      </header>

      <div className="space-y-6">
        {/* Calendar Selection */}
        <MonthCalendarSelector
          selectedDates={holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()))}
          onDateSelect={onHolidaySelect}
          colorScheme="amber"
        />

        {/* Selected Dates List */}
        <DateList
          items={holidays}
          title="Selected Holidays"
          colorScheme="amber"
          onRemove={onHolidayRemove}
          onClearAll={onClearHolidays}
        />
      </div>
    </section>
  );
} 