import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getMonth,
  isPast,
  isToday,
  parse,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { Tooltip, TooltipTrigger, StatTooltipContent } from '@/components/ui/tooltip';
import { OptimizedDay } from '@/types';
import { cn, DayType, dayTypeToColorScheme } from '@/lib/utils';
import { COLOR_SCHEMES, WEEKDAYS } from '@/constants';

interface MonthCalendarProps {
  month: number;
  year: number;
  days: OptimizedDay[];
}

interface CalendarDayProps {
  day: OptimizedDay;
  dayInfo: ReturnType<(day: OptimizedDay) => {
    date: Date;
    dayType: 'default' | 'companyDayOff' | 'weekend' | 'cto' | 'publicHoliday';
    tooltipText: string;
    bgClass: string;
    textClass: string;
    isCurrentDay: boolean
  }>;
  hasPublicHoliday: boolean;
}

const getDayColorScheme = (day: OptimizedDay, date: Date, isCurrentDay: boolean) => {
  // Determine color scheme based on day state
  if (isCurrentDay) {
    return 'today';
  }
  
  if (isPast(startOfDay(date)) && !isCurrentDay) {
    return 'past';
  }
  
  // Determine day type based on properties
  let dayType: DayType = 'default';
  
  if (day.isCTO) {
    dayType = 'cto';
  } else if (day.isPublicHoliday) {
    dayType = 'publicHoliday';
  } else if (day.isCompanyDayOff) {
    dayType = 'companyDayOff';
  } else if (day.isWeekend) {
    dayType = 'weekend';
  }
  
  return dayTypeToColorScheme[dayType];
};

/**
 * Renders a single calendar day with appropriate styling and tooltip
 */
const CalendarDay = ({ day, dayInfo, hasPublicHoliday }: CalendarDayProps) => {
  const { date, tooltipText, bgClass, textClass, isCurrentDay } = dayInfo;
  
  const colorScheme = getDayColorScheme(day, date, isCurrentDay);

  return (
    <>
      <div
        className={cn(
          'absolute inset-0.5 rounded-md',
          bgClass,
          isCurrentDay && 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-sm',
          // Integrate break styles directly here with minimal effect
          day.isPartOfBreak && !isCurrentDay && 'ring-1 ring-indigo-300/40 dark:ring-indigo-400/30 ring-dashed'
        )}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'absolute inset-0 flex items-center justify-center font-medium z-10 text-xs',
            textClass,
            tooltipText ? 'cursor-pointer' : '',
            // Very subtle text emphasis
            day.isPartOfBreak && 'text-indigo-700 dark:text-indigo-300',
          )}>
            {format(date, 'd')}
          </div>
        </TooltipTrigger>
        {tooltipText && (
          <StatTooltipContent colorScheme={colorScheme}>
            {/* Enhanced tooltip content with better structure */}
            {day.isPartOfBreak ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-indigo-500/70 dark:bg-indigo-400/80" />
                  <p className="text-xs font-medium">Break Period</p>
                </div>
                {/* Show more specific information if available */}
                {tooltipText !== 'Part of Break Period' && (
                  <p className="text-xs pl-3 text-gray-600 dark:text-gray-300">{tooltipText}</p>
                )}
                <p className="text-xs pl-3 text-gray-500 dark:text-gray-400">{format(date, 'EEEE, MMMM d, yyyy')}</p>
              </div>
            ) : (
              <p className="text-xs">{tooltipText}</p>
            )}
          </StatTooltipContent>
        )}
      </Tooltip>

      {/* Holiday Indicator Dot */}
      {hasPublicHoliday && day.isPublicHoliday && (
        <div className={cn(
          'absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full',
          COLOR_SCHEMES[dayTypeToColorScheme.publicHoliday].calendar.text,
        )} />
      )}
    </>
  );
};


// Determine styling based on day state
const getDayStyles = (isCurrentDay: boolean, isPastDay: boolean, dayType: DayType) => {
  const colorKey = isCurrentDay ? 'today' : isPastDay ? 'past' : dayTypeToColorScheme[dayType];
  return {
    bgClass: COLOR_SCHEMES[colorKey].calendar.bg,
    textClass: cn(
      isCurrentDay && 'font-bold',
      COLOR_SCHEMES[colorKey].calendar.text,
    ),
  };
};

/**
 * MonthCalendar Component
 *
 * Renders a monthly calendar view with color-coded days based on their types
 * (CTO days, public holidays, company days off, etc.)
 */
export function MonthCalendar({ month, year, days }: MonthCalendarProps) {
  // Initialize calendar dates
  const firstDay = startOfMonth(new Date(year, month));
  const lastDay = endOfMonth(firstDay);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startingDayIndex = getDay(firstDay);

  // Check if any day types exist in the data
  const dayTypeFlags = {
    hasCTODays: days.some(day => day.isCTO),
    hasPublicHoliday: days.some(day => day.isPublicHoliday),
    hasCompanyDaysOff: days.some(day => day.isCompanyDayOff),
    hasExtendedWeekends: days.some(day => day.isPartOfBreak && day.isWeekend),
    hasBreaks: days.some(day => day.isPartOfBreak), // Added explicit check for breaks
    hasWeekends: days.some(day => day.isWeekend) // Add check for regular weekends
  };

  // Get holidays for the current month
  const holidays = days.filter(day => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date());
    return day.isPublicHoliday && getMonth(date) === month;
  });

  // Create calendar grid with empty cells for proper alignment
  const calendarDays = Array(35).fill(null);
  daysInMonth.forEach((date, index) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = days.find(d => d.date === dateStr);
    calendarDays[startingDayIndex + index] = day || {
      date: dateStr,
      isWeekend: getDay(date) === 0 || getDay(date) === 6,
      isCTO: false,
      isPartOfBreak: false,
    };
  });

  /**
   * Helper function to process all day-related information in one pass
   */
  const getDayInfo = (day: OptimizedDay) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date());
    const isCurrentDay = isToday(date);
    const isPastDay = isPast(startOfDay(date)) && !isCurrentDay;

    // Determine day type with order of precedence
    let dayType: DayType = 'default';
    let tooltipText = '';

    if (isPastDay) {
      tooltipText = 'Past dates are not considered in the optimization';
    } else if (isCurrentDay) {
      tooltipText = 'Today';
    } else {
      // Order of precedence: Company Days > Public Holidays > Extended Weekends > CTO Days > Regular Weekends
      if (dayTypeFlags.hasCompanyDaysOff && day.isCompanyDayOff) {
        dayType = 'companyDayOff';
        tooltipText = day.companyDayName || 'Company Day Off';
      } else if (dayTypeFlags.hasPublicHoliday && day.isPublicHoliday) {
        dayType = 'publicHoliday';
        tooltipText = day.publicHolidayName || 'Public Holiday';
      } else if (dayTypeFlags.hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) {
        dayType = 'weekend';
        tooltipText = 'Extended Weekend';
      } else if (dayTypeFlags.hasCTODays && day.isCTO) {
        dayType = 'cto';
        tooltipText = 'CTO Day';
      } else if (day.isPartOfBreak) {
        // Add specific tooltip for break days that aren't weekends or holidays
        tooltipText = 'Part of Break Period';
      } else if (day.isWeekend) {
        // Regular weekend
        dayType = 'weekend';
        tooltipText = 'Normal Weekend';
      }
    }

    const { bgClass, textClass } = getDayStyles(isCurrentDay, isPastDay, dayType);

    return {
      date,
      dayType,
      tooltipText,
      bgClass,
      textClass,
      isCurrentDay,
    };
  };

  return (
    <div
      className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
      {/* Calendar Header */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 leading-none">
          {format(firstDay, 'MMMM yyyy')}
        </h4>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 min-h-[1.25rem] flex items-center gap-2">
          {holidays.length > 0 && (
            <>Holidays: {holidays.map(h => h.publicHolidayName).join(', ')}</>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5">
          {/* Weekday Headers */}
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                'aspect-square p-1 text-xs relative',
                !day && 'bg-gray-50 dark:bg-gray-800/30',
              )}
            >
              {day &&
                <CalendarDay day={day} dayInfo={getDayInfo(day)} hasPublicHoliday={dayTypeFlags.hasPublicHoliday} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}