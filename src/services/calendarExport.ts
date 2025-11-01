import { Break, OptimizationStats } from '@/types';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { saveAs } from 'file-saver';

interface CalendarExportOptions {
  breaks: Break[];
  stats: OptimizationStats;
  selectedYear: number;
  timezone?: string; // Optional timezone parameter (e.g., 'America/New_York')
}

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
export const exportToICS = async (
  options: CalendarExportOptions
): Promise<{ success: boolean; message: string }> => {
  try {
    const { breaks, stats } = options;

    // Format breaks as events for ics
    const events: EventAttributes[] = breaks.map(breakItem => {
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
      return { success: false, message: `Error creating calendar file: ${error}` };
    }

    // Create Blob and download file
    const blob = new Blob([value || ''], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, `holiday-optimizer-calendar-${options.selectedYear}.ics`);

    return {
      success: true,
      message:
        'Calendar exported successfully! Your events will appear on the correct dates in your calendar.',
    };
  } catch (error) {
    return {
      success: false,
      message: `An error occurred while exporting the calendar: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
