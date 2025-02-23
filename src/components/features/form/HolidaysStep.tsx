import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '../components/DateList';
import { parse } from 'date-fns';
import { HolidaysStepProps } from './types';
import { StepHeader } from './components/StepHeader';

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
      <StepHeader
        number={3}
        title="Public Holidays"
        description="Find holidays in your area instantly, or pick specific dates from the calendar."
        colorScheme="amber"
        id="holidays-heading"
      />

      <div className="space-y-2" role="group" aria-labelledby="holidays-heading">
        <Button
          onClick={onAutoDetect}
          variant="outline"
          size="sm"
          type="button"
          className="w-full bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-2"
          tabIndex={0}
          role="button"
          aria-label="Find public holidays in your location"
        >
          <MapPin className="h-3.5 w-3.5 mr-2 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Find Local Holidays
        </Button>

        <div className="space-y-6">
          {/* Calendar Selection */}
          <MonthCalendarSelector
            id="holidays-calendar"
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
      </div>
    </section>
  );
} 