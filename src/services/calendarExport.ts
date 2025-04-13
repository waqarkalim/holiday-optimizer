import { Break, OptimizationStats } from '@/types';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface CalendarExportOptions {
  breaks: Break[];
  stats: OptimizationStats;
  selectedYear: number;
  timezone?: string; // Optional timezone parameter (e.g., 'America/New_York')
}

interface ExportResult {
  success: boolean;
  message: string;
}

type ExportParams = CalendarExportOptions;

/**
 * Converts a date string in format 'yyyy-MM-dd' to a Date array [year, month, day]
 * for use with the ics library, preserving the same date regardless of timezone
 */
const dateStringToArray = (dateString: string): DateArray => {
  // Parse the date string directly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  
  return [
    year,
    month,
    day,
    0, // hours
    0, // minutes
  ];
};

/**
 * Adds one day to a date and handles month/year boundaries correctly
 * Returns a DateArray [year, month, day, hour, minute]
 */
const addDayWithRollover = (dateString: string): DateArray => {
  // Create a Date object temporarily just for rollover calculation
  // We'll use UTC methods to avoid timezone issues
  const date = new Date(`${dateString}T12:00:00Z`); // Use noon UTC to avoid DST issues
  date.setUTCDate(date.getUTCDate() + 1); // Add one day
  
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1, // Convert 0-based month to 1-based
    date.getUTCDate(),
    0, // hours
    0, // minutes
  ];
};

/**
 * Generate event description with break statistics
 */
const generateEventDescription = (breakItem: Break, stats: OptimizationStats): string => {
  return `
    PTO Days: ${breakItem.ptoDays}
    Public Holidays: ${breakItem.publicHolidays}
    Company Days Off: ${breakItem.companyDaysOff}
    Weekends: ${breakItem.weekends}
    Total Days: ${breakItem.totalDays}
    
    Optimized with Holiday Optimizer
    
    Total PTO Used This Year: ${stats.totalPTODays} days
    Total Days Off This Year: ${stats.totalDaysOff} days
  `;
};

/**
 * Exports calendar events to iCal (.ics) format
 * Uses floating time approach to ensure dates appear on the intended day
 * regardless of the user's timezone
 */
export const exportToICS = async (options: CalendarExportOptions): Promise<{ success: boolean; message: string }> => {
  try {
    const { breaks, stats } = options;
    
    // Format breaks as events for ics
    const events: EventAttributes[] = breaks.map((breakItem) => {
      // Create start date array - parse directly from date string
      const startDate = dateStringToArray(breakItem.startDate);
      
      // Create end date array with proper rollover handling
      // ICS end dates are exclusive, so we add one day to the end date
      const endDate = addDayWithRollover(breakItem.endDate);
      
      return {
        start: startDate,
        // Floating time (no UTC designation) ensures dates appear on the correct day
        // regardless of the user's timezone
        end: endDate,
        title: 'PTO - Holiday Optimizer',
        description: generateEventDescription(breakItem, stats),
        busyStatus: 'OOF' as const, // Out of office
        categories: ['PTO', 'Vacation'],
        status: 'CONFIRMED' as const,
        calName: 'Holiday Optimizer',
      };
    });

    const { error, value } = createEvents(events);
    
    if (error) {
      console.error('Error creating calendar events:', error);
      return { success: false, message: `Error creating calendar file: ${error}` };
    }
    
    // Create Blob and download file
    const blob = new Blob([value || ''], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, `holiday-optimizer-calendar-${options.selectedYear}.ics`);
    
    return { 
      success: true, 
      message: 'Calendar exported successfully! Your events will appear on the correct dates in your calendar.' 
    };
    
  } catch (error) {
    console.error('Error exporting to ICS:', error);
    return { 
      success: false, 
      message: `An error occurred while exporting the calendar: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

export const exportToPTOText = async ({ breaks, stats, selectedYear }: ExportParams): Promise<ExportResult> => {
  try {
    // Create text content
    let content = `PTO Days Export for ${selectedYear}\n`;
    content += `Total PTO Days: ${stats.totalPTODays}\n\n`;
    
    // Sort breaks by start date
    const sortedBreaks = [...breaks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Add each break's PTO days
    sortedBreaks.forEach((breakPeriod, index) => {
      const ptoDays = breakPeriod.days.filter(day => day.isPTO);
      if (ptoDays.length > 0) {
        content += `Break ${index + 1} (${format(new Date(breakPeriod.startDate), 'MMM d')} - ${format(new Date(breakPeriod.endDate), 'MMM d')}):\n`;
        ptoDays.forEach(day => {
          content += `  - ${format(new Date(day.date), 'MMMM d, yyyy')}\n`;
        });
        content += '\n';
      }
    });

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pto-days-${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'PTO days have been exported to a text file.'
    };
  } catch (error) {
    console.error('Error exporting PTO days:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred while exporting PTO days.'
    };
  }
};
