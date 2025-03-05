import { Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '@/components/features/HolidaysDateList';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useHolidays } from '@/hooks/useOptimizer';
import { detectPublicHolidays } from '@/services/holidays';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function HolidaysStep() {
  const { holidays, addHoliday, removeHoliday, clearHolidays, setDetectedHolidays } = useHolidays();

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
      const detectedHolidays = await detectPublicHolidays();
      setDetectedHolidays(detectedHolidays);
      toast.success('Holidays detected', {
        description: `Found ${detectedHolidays.length} public holidays for your location. Any custom holidays have been preserved.`,
      });
    } catch (error) {
      console.error('Error detecting holidays:', error);
      toast.error('Error detecting holidays', {
        description: error instanceof Error ? error.message : 'Failed to detect holidays for your location.',
      });
    }
  };

  const handleUpdateHolidayName = (date: string, newName: string) => {
    addHoliday(date, newName);
  };

  const handleBulkRename = (dates: string[], newName: string) => {
    dates.forEach(date => addHoliday(date, newName));
  };

  // Info tooltip content
  const titleWithInfo = (
    <div className="flex items-center justify-between w-full">
      <span>Public Holidays</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-full p-1 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 cursor-help transition-colors">
            <Info className="h-3.5 w-3.5 text-amber-500/70 dark:text-amber-400/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start"
          className="max-w-xs bg-amber-50/95 dark:bg-amber-900/90 border-amber-100 dark:border-amber-800/40 text-amber-900 dark:text-amber-100"
        >
          <div className="space-y-2 p-1">
            <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">Why Public Holidays Matter</h4>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
              Public holidays affect how your time off is optimized. They&apos;re automatically excluded from
              potential time-off dates since you&apos;ll already have those days off. Including holidays
              ensures your optimizer creates the most efficient schedule possible.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const selectedDates = holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()));

  return (
    <FormSection colorScheme="amber" headingId="holidays-heading">
      <StepHeader
        number={3}
        title={titleWithInfo}
        description="Find holidays in your area instantly, or pick specific dates from the calendar. Select multiple dates to rename them together."
        colorScheme="amber"
        id="holidays-heading"
      />

      <div className="space-y-3" role="group" aria-labelledby="holidays-heading">
        <Button
          onClick={handleAutoDetect}
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
          <MonthCalendarSelector
            id="holidays-calendar"
            selectedDates={selectedDates}
            onDateSelect={handleHolidaySelect}
            colorScheme="amber"
          />

          <DateList
            items={holidays}
            title="Selected Holidays"
            colorScheme="amber"
            onRemoveAction={removeHoliday}
            onClearAllAction={clearHolidays}
            onUpdateName={handleUpdateHolidayName}
            onBulkRename={handleBulkRename}
            showBulkManagement={false}
          />
        </div>
      </div>
    </FormSection>
  );
} 