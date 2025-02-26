import { MapPin, Info, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '@/components/features/DateList';
import { format, parse, isWithinInterval, addMonths, isSameMonth } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useHolidays } from '@/hooks/useOptimizer';
import { detectPublicHolidays } from '@/services/holidays';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

// Common holidays that users might forget
const COMMON_HOLIDAYS = {
  US: [
    { month: 0, day: 1, name: "New Year's Day" },
    { month: 1, day: 14, name: "Valentine's Day" },
    { month: 4, day: 27, name: "Memorial Day" }, // Last Monday in May (approximate)
    { month: 6, day: 4, name: "Independence Day" },
    { month: 8, day: 4, name: "Labor Day" }, // First Monday in September (approximate)
    { month: 10, day: 28, name: "Thanksgiving" }, // Fourth Thursday in November (approximate)
    { month: 11, day: 25, name: "Christmas" }
  ]
};

export function HolidaysStep() {
  const { holidays, addHoliday, removeHoliday, clearHolidays, setDetectedHolidays } = useHolidays();
  const [showDidYouForget, setShowDidYouForget] = useState(false);
  
  // Check if common holidays might be missing
  useEffect(() => {
    // Only show the reminder if they have some holidays but might be missing important ones
    if (holidays.length > 0 && holidays.length < 5) {
      const holidayDates = holidays.map(h => parse(h.date, 'yyyy-MM-dd', new Date()));
      
      // Check if they might be missing major holidays
      const hasChristmas = holidayDates.some(date => 
        date.getMonth() === 11 && date.getDate() === 25
      );
      
      const hasNewYears = holidayDates.some(date => 
        date.getMonth() === 0 && date.getDate() === 1
      );
      
      // If missing obvious holidays, show reminder
      if (!hasChristmas || !hasNewYears) {
        setShowDidYouForget(true);
      } else {
        setShowDidYouForget(false);
      }
    } else {
      setShowDidYouForget(false);
    }
  }, [holidays]);

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
      
      // Hide "Did you forget?" prompt after auto-detection
      setShowDidYouForget(false);
    } catch (error) {
      console.error('Error detecting holidays:', error);
      toast.error('Error detecting holidays', {
        description: error instanceof Error ? error.message : 'Failed to detect holidays for your location.',
      });
    }
  };
  
  // Jump to month with common holidays and add the holiday
  const jumpToImportantMonth = (month: number) => {
    const targetDate = new Date();
    targetDate.setMonth(month);
    
    // Set the date based on which holiday was selected
    switch(month) {
      case 0: // January - New Year's Day
        targetDate.setDate(1);
        addHoliday(format(targetDate, 'yyyy-MM-dd'), "New Year's Day");
        break;
      case 6: // July - Independence Day
        targetDate.setDate(4);
        addHoliday(format(targetDate, 'yyyy-MM-dd'), "Independence Day");
        break;
      case 10: // November - Thanksgiving (4th Thursday)
        // Find the 4th Thursday
        targetDate.setDate(1);
        const dayOfWeek = targetDate.getDay();
        // Move to first Thursday
        targetDate.setDate(1 + ((4 - dayOfWeek + 7) % 7));
        // Move to fourth Thursday
        targetDate.setDate(targetDate.getDate() + 21);
        addHoliday(format(targetDate, 'yyyy-MM-dd'), "Thanksgiving");
        break;
      case 11: // December - Christmas
        targetDate.setDate(25);
        addHoliday(format(targetDate, 'yyyy-MM-dd'), "Christmas");
        break;
    }
    
    // Show success toast
    toast.success(`Added holiday`, {
      description: `Successfully added holiday to your calendar.`,
    });
    
    // Hide the reminder since user took action
    setShowDidYouForget(false);
  };

  // Custom title with info icon tooltip
  const titleWithInfo = (
    <div className="flex items-center justify-between w-full">
      <span>Public Holidays</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-full p-1 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 cursor-help transition-colors">
            <Info className="h-3.5 w-3.5 text-amber-500/70 dark:text-amber-400/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="max-w-xs bg-amber-50/95 dark:bg-amber-900/90 border-amber-100 dark:border-amber-800/40 text-amber-900 dark:text-amber-100">
          <div className="space-y-2 p-1">
            <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">Why Public Holidays Matter</h4>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
              Public holidays affect how your time off is optimized. They're automatically excluded from 
              potential time-off dates since you'll already have those days off. Including holidays 
              ensures your optimizer creates the most efficient schedule possible.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

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
        <TooltipProvider>
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
        </TooltipProvider>

        {/* "Did you forget?" prompt */}
        {showDidYouForget && (
          <Alert 
            variant="default" 
            className="bg-amber-50/70 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/30 text-amber-800 dark:text-amber-200"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">Missing common holidays?</AlertTitle>
            <AlertDescription className="text-amber-700/90 dark:text-amber-300/90">
              <p className="mb-2 text-xs">
                You might be missing some important holidays. Consider adding:
              </p>
              <div className="flex gap-1.5 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => jumpToImportantMonth(11)} // December
                      className="h-6 px-1.5 text-[10px] bg-amber-100/60 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
                    >
                      Christmas
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add Christmas (December 25) to your holidays</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => jumpToImportantMonth(0)} // January
                      className="h-6 px-1.5 text-[10px] bg-amber-100/60 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
                    >
                      New Year's
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add New Year's Day (January 1) to your holidays</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => jumpToImportantMonth(6)} // July
                      className="h-6 px-1.5 text-[10px] bg-amber-100/60 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
                    >
                      Independence Day
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add Independence Day (July 4) to your holidays</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => jumpToImportantMonth(10)} // November
                      className="h-6 px-1.5 text-[10px] bg-amber-100/60 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
                    >
                      Thanksgiving
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add Thanksgiving (4th Thursday in November) to your holidays</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Calendar Selection with enhanced context */}
          <div>
            <MonthCalendarSelector
              id="holidays-calendar"
              selectedDates={holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()))}
              onDateSelect={handleHolidaySelect}
              colorScheme="amber"
            />
          </div>

          {/* Selected Dates List */}
          <DateList
            items={holidays}
            title="Selected Holidays"
            colorScheme="amber"
            onRemove={(date: string) => removeHoliday(date)}
            onClearAll={clearHolidays}
            onUpdateName={(date: string, newName: string) => {
              addHoliday(date, newName);
            }}
            onBulkRename={(dates: string[], newName: string) => {
              dates.forEach(date => {
                addHoliday(date, newName);
              });
            }}
            showBulkManagement={false}
          />
        </div>
      </div>
    </FormSection>
  );
} 