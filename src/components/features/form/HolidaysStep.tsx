import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '@/components/features/HolidaysDateList';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useHolidays } from '@/hooks/useOptimizer';
import { detectPublicHolidays } from '@/services/holidays';
import { toast } from 'sonner';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizer } from '@/contexts/OptimizerContext';

export function HolidaysStep() {
  const title = 'Selected Holidays';
  const colorScheme = 'amber';
  const { holidays, addHoliday, removeHoliday, setDetectedHolidays } = useHolidays();
  const { state } = useOptimizer();
  const { selectedYear } = state;

  const handleHolidaySelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = holidays.some(day => day.date === formattedDate);

    if (isSelected) {
      removeHoliday(formattedDate);
    } else {
      addHoliday(formattedDate, format(date, 'MMMM d, yyyy'));
    }
  };

  const handleAutoDetect = async () => {
    try {
      const detectedHolidays = await detectPublicHolidays(selectedYear);
      setDetectedHolidays(detectedHolidays);
      toast.success('Holidays detected', {
        description: `Found ${detectedHolidays.length} public holidays for your location in ${selectedYear}. Any custom holidays have been preserved.`,
      });
    } catch (error) {
      console.error('Error detecting holidays:', error);
      toast.error('Error detecting holidays', {
        description: error instanceof Error ? error.message : 'Failed to detect holidays for your location.',
      });
    }
  };

  // Using the new StepTitleWithInfo component
  const titleWithInfo = (
    <StepTitleWithInfo
      title="Public Holidays"
      colorScheme={colorScheme}
      tooltip={{
        title: "Why Public Holidays Matter",
        description: "Public holidays affect how your time off is optimized. They're automatically excluded from potential time-off dates since you'll already have those days off. Including holidays ensures your optimizer creates the most efficient schedule possible.",
        ariaLabel: "Why public holidays matter"
      }}
    />
  );

  const selectedDates = holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()));

  return (
    <FormSection colorScheme={colorScheme} headingId="holidays-heading">
      <StepHeader
        number={3}
        title={titleWithInfo}
        description={`Find holidays in your area for ${selectedYear}, or pick specific dates from the calendar. Select multiple dates to rename them together.`}
        colorScheme={colorScheme}
        id="holidays-heading"
      />

      <fieldset className="space-y-3 border-0 m-0 p-0" aria-labelledby="holidays-heading">
        <legend className="sr-only">Public holidays selection</legend>
        <Button
          id="detect-holidays-button"
          onClick={handleAutoDetect}
          variant="outline"
          size="sm"
          type="button"
          tabIndex={0}
          className="w-full bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-2"
          aria-label={`Find public holidays in your location for ${selectedYear}`}
        >
          <MapPin className="h-3.5 w-3.5 mr-2 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Find {selectedYear} Holidays
        </Button>

        <div className="space-y-6">
          <MonthCalendarSelector
            id="holidays-calendar"
            selectedDates={selectedDates}
            onDateSelect={handleHolidaySelect}
            colorScheme={colorScheme}
            year={selectedYear}
          />

          <DateList title={title} colorScheme={colorScheme} />
        </div>
      </fieldset>
    </FormSection>
  );
} 