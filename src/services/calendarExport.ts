import { Break, OptimizationStats } from '@/types';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { saveAs } from 'file-saver';

interface CalendarExportOptions {
  breaks: Break[];
  stats: OptimizationStats;
  selectedYear: number;
}

/**
 * Converts a date string in format 'yyyy-MM-dd' to a Date array [year, month, day]
 * for use with the ics library
 */
const dateStringToArray = (dateString: string): DateArray => {
  const date = new Date(dateString);
  return [
    date.getFullYear(),
    date.getMonth() + 1, // ics uses 1-indexed months
    date.getDate(),
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
 */
export const exportToICS = async (options: CalendarExportOptions): Promise<{ success: boolean; message: string }> => {
  try {
    const { breaks, stats } = options;
    
    // Format breaks as events for ics
    const events: EventAttributes[] = breaks.map((breakItem) => {
      // Create a start date array for ics
      const startDate = dateStringToArray(breakItem.startDate);
      
      // Create an end date array for ics
      // For calendar events, the end date should be the day after the last day
      const endDateObj = new Date(breakItem.endDate);
      endDateObj.setDate(endDateObj.getDate() + 1); // Add one day for exclusive end date
      const endDate = dateStringToArray(endDateObj.toISOString().split('T')[0]);
      
      return {
        start: startDate,
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
      message: 'Calendar exported successfully! You can now import this file into your calendar application.' 
    };
    
  } catch (error) {
    console.error('Error exporting to ICS:', error);
    return { 
      success: false, 
      message: `An error occurred while exporting the calendar: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Generates Google Calendar event URL
 */
export const generateGoogleCalendarUrl = (breakItem: Break, stats: OptimizationStats): string => {
  try {
    // Format dates for Google Calendar (YYYYMMDD format)
    const startDateFormatted = breakItem.startDate.replace(/-/g, '');
    
    // For Google Calendar, we need to add a day to make it inclusive
    const endDateObj = new Date(breakItem.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endDateFormatted = endDateObj.toISOString().split('T')[0].replace(/-/g, '');
    
    // Create description text
    const description = encodeURIComponent(generateEventDescription(breakItem, stats));
    
    // Create Google Calendar URL
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent('PTO - Holiday Optimizer')}&dates=${startDateFormatted}/${endDateFormatted}&details=${description}&trp=false`;
  } catch (error) {
    console.error('Error generating Google Calendar URL:', error);
    return '';
  }
};

/**
 * Opens multiple Google Calendar events in new tabs
 */
export const exportToGoogleCalendar = (options: CalendarExportOptions): { success: boolean; message: string } => {
  try {
    const { breaks, stats } = options;
    
    // For each break, generate and open a Google Calendar URL
    breaks.forEach((breakItem, index) => {
      const url = generateGoogleCalendarUrl(breakItem, stats);
      
      if (url) {
        // Delay opening multiple tabs to prevent popup blockers
        setTimeout(() => {
          window.open(url, `_blank${index}`);
        }, index * 500);
      }
    });
    
    return { 
      success: true, 
      message: 'Google Calendar events opened in new tabs. Please review and save each event.' 
    };
  } catch (error) {
    console.error('Error exporting to Google Calendar:', error);
    return { 
      success: false, 
      message: `An error occurred while exporting to Google Calendar: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 