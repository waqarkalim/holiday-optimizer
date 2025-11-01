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
import { StatTooltipContent, Tooltip, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { OptimizedDay } from '@/types';
import { cn, DayType, dayTypeToColorScheme } from '@/shared/lib/utils';
import { COLOR_SCHEMES, WEEKDAYS } from '@/constants';
import { Lock } from 'lucide-react';

interface MonthCalendarProps {
  month: number;
  year: number;
  days: OptimizedDay[];
}

interface DayInfo {
  date: Date;
  dayType:
    | 'default'
    | 'companyDayOff'
    | 'weekend'
    | 'pto'
    | 'publicHoliday'
    | 'extendedWeekend';
  tooltipText: string;
  bgClass: string;
  textClass: string;
  isCurrentDay: boolean;
  isPastDay: boolean;
  accessibleLabel: string;
}

interface CalendarDayProps {
  day: OptimizedDay;
  dayInfo: DayInfo;
  hasPublicHoliday: boolean;
}

const getDayColorScheme = (
  day: OptimizedDay,
  date: Date,
  isCurrentDay: boolean,
  isCurrentYear: boolean
) => {
  // Determine color scheme based on day state
  if (isCurrentDay) {
    return 'today';
  }

  if (isCurrentYear && isPast(startOfDay(date)) && !isCurrentDay) {
    return 'past';
  }

  // Determine day type based on properties
  let dayType: DayType = 'default';

  if (day.isPTO) {
    dayType = 'pto';
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
  const { date, tooltipText, bgClass, textClass, isCurrentDay, dayType, accessibleLabel } = dayInfo;

  const today = new Date();
  const currentYear = today.getFullYear();
  const isCurrentYear = date.getFullYear() === currentYear;

  const colorScheme = getDayColorScheme(day, date, isCurrentDay, isCurrentYear);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0.5 rounded-md transition-colors',
          bgClass,
          isCurrentDay && 'ring-2 ring-blue-400 shadow-sm',
          day.isPartOfBreak &&
            dayType !== 'extendedWeekend' &&
            !isCurrentDay &&
            'ring-1 ring-indigo-300/40 ring-dashed',
          dayType === 'extendedWeekend' && !isCurrentDay && 'ring-1 ring-purple-400/70'
        )}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative z-10 flex h-full w-full items-center justify-center rounded-md text-xs font-medium gap-0.5',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
              'transition-colors duration-150 cursor-default',
              textClass,
              tooltipText && 'cursor-help',
              day.isPartOfBreak && dayType !== 'extendedWeekend' && 'text-indigo-700'
            )}
            aria-label={accessibleLabel}
          >
            {day.isPreBooked ? (
              <Lock className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            ) : (
              <span aria-hidden="true" className="leading-none">
                {format(date, 'd')}
              </span>
            )}
          </button>
        </TooltipTrigger>
        {tooltipText && (
          <StatTooltipContent colorScheme={colorScheme}>
            {day.isPartOfBreak ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-indigo-500/70" />
                  <p className="text-xs font-medium">Break Period</p>
                </div>
                {tooltipText !== 'Part of Break Period' && (
                  <p className="text-xs pl-3 text-gray-600">{tooltipText}</p>
                )}
                <p className="text-xs pl-3 text-gray-500">{format(date, 'EEEE, MMMM d, yyyy')}</p>
              </div>
            ) : (
              <p className="text-xs">{tooltipText}</p>
            )}
          </StatTooltipContent>
        )}
      </Tooltip>

      {hasPublicHoliday && day.isPublicHoliday && (
        <div
          className={cn(
            'absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full',
            COLOR_SCHEMES[dayTypeToColorScheme.publicHoliday].calendar.text
          )}
        />
      )}
    </>
  );
};

// Determine styling based on day state
const getDayStyles = (isCurrentDay: boolean, isPastDay: boolean, dayType: DayType) => {
  const colorKey = isCurrentDay ? 'today' : isPastDay ? 'past' : dayTypeToColorScheme[dayType];
  return {
    bgClass: COLOR_SCHEMES[colorKey].calendar.bg,
    textClass: cn(isCurrentDay && 'font-bold', COLOR_SCHEMES[colorKey].calendar.text),
  };
};

const getWeekendDayNumbers = (days: OptimizedDay[]) => {
  const weekendSet = new Set<number>();

  for (const day of days) {
    if (!day.isWeekend) {
      continue;
    }

    const parsed = parse(day.date, 'yyyy-MM-dd', new Date());
    weekendSet.add(getDay(parsed));

    if (weekendSet.size >= 7) {
      break;
    }
  }

  if (weekendSet.size === 0) {
    weekendSet.add(0);
    weekendSet.add(6);
  }

  return weekendSet;
};

/**
 * MonthCalendar Component
 * Displays a single month calendar with optimized day styling
 */
export function MonthCalendar({ month, year, days }: MonthCalendarProps) {
  // Initialize calendar dates
  const firstDay = startOfMonth(new Date(year, month));
  const lastDay = endOfMonth(firstDay);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startingDayIndex = getDay(firstDay);
  const today = new Date();
  const currentYear = today.getFullYear();
  const isCurrentYear = year === currentYear;

  // Check if any day types exist in the data
  const dayTypeFlags = {
    hasPTODays: days.some(day => day.isPTO),
    hasPublicHoliday: days.some(day => day.isPublicHoliday),
    hasCompanyDaysOff: days.some(day => day.isCompanyDayOff),
    hasExtendedWeekends: days.some(day => day.isPartOfBreak && day.isWeekend),
    hasBreaks: days.some(day => day.isPartOfBreak), // Added explicit check for breaks
    hasWeekends: days.some(day => day.isWeekend), // Add check for regular weekends
  };

  // Get holidays for the current month
  const holidays = days.filter(day => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date());
    return day.isPublicHoliday && getMonth(date) === month;
  });

  // Create calendar grid with empty cells for proper alignment
  const weekendDayNumbers = getWeekendDayNumbers(days);

  const totalCells = Math.ceil((startingDayIndex + daysInMonth.length) / 7) * 7;
  const calendarDays: Array<OptimizedDay | null> = Array(totalCells).fill(null);
  daysInMonth.forEach((date, index) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = days.find(d => d.date === dateStr);
    calendarDays[startingDayIndex + index] = day || {
      date: dateStr,
      isWeekend: weekendDayNumbers.has(getDay(date)),
      isPTO: false,
      isPartOfBreak: false,
      isPublicHoliday: false,
      isCompanyDayOff: false,
    };
  });

  /**
   * Helper function to process all day-related information in one pass
   */
  const getDayInfo = (day: OptimizedDay): DayInfo => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date());
    const isCurrentDay = isToday(date);
    // Only consider dates as past when in the current year
    const isPastDay = isCurrentYear && isPast(startOfDay(date)) && !isCurrentDay;

    // Determine day type with order of precedence
    let dayType: DayType = 'default';
    let tooltipText = '';

    if (isPastDay) {
      tooltipText = 'Past dates are not considered in the optimization';
    } else if (isCurrentDay) {
      tooltipText = 'Today';
    } else {
      // Order of precedence: Company Days > Public Holidays > Extended Weekends > PTO Days > Regular Weekends
      if (dayTypeFlags.hasCompanyDaysOff && day.isCompanyDayOff) {
        dayType = 'companyDayOff';
        tooltipText = day.companyDayName || 'Company Day Off';
      } else if (dayTypeFlags.hasPublicHoliday && day.isPublicHoliday) {
        dayType = 'publicHoliday';
        tooltipText = day.publicHolidayName || 'Public Holiday';
      } else if (dayTypeFlags.hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) {
        dayType = 'extendedWeekend';
        tooltipText = 'Extended Weekend';
      } else if (dayTypeFlags.hasPTODays && day.isPTO) {
        dayType = 'pto';
        tooltipText = day.isPreBooked ? 'Pre-Booked Vacation (Locked)' : 'PTO Day';
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

    const baseDateLabel = format(date, 'EEEE, MMMM d, yyyy');
    const descriptors: string[] = [];
    const addDescriptor = (value?: string) => {
      if (!value) return;
      if (!descriptors.includes(value)) {
        descriptors.push(value);
      }
    };

    if (isCurrentDay) {
      addDescriptor('Today');
    }

    if (isPastDay) {
      addDescriptor('Past date not considered in the optimization');
    }

    if (day.isPreBooked) {
      addDescriptor('Pre-booked PTO day');
    }

    switch (dayType) {
      case 'companyDayOff':
        addDescriptor(day.companyDayName ? `Company day off: ${day.companyDayName}` : 'Company day off');
        break;
      case 'publicHoliday':
        addDescriptor(day.publicHolidayName ? `Public holiday: ${day.publicHolidayName}` : 'Public holiday');
        break;
      case 'extendedWeekend':
        addDescriptor('Extended weekend day');
        break;
      case 'pto':
        addDescriptor('PTO day');
        break;
      case 'weekend':
        addDescriptor('Weekend day');
        break;
      default:
        break;
    }

    if (day.isPartOfBreak) {
      addDescriptor('Part of break period');
    }

    if (
      !day.isWeekend &&
      !day.isPTO &&
      !day.isPublicHoliday &&
      !day.isCompanyDayOff &&
      !day.isPartOfBreak &&
      !isPastDay &&
      !isCurrentDay
    ) {
      addDescriptor('Working day');
    }

    if (
      tooltipText &&
      !['Today', 'Normal Weekend', 'Part of Break Period'].includes(tooltipText) &&
      !descriptors.includes(tooltipText)
    ) {
      addDescriptor(tooltipText);
    }

    const accessibleLabel = [baseDateLabel, ...descriptors].join('. ');

    return {
      date,
      dayType,
      tooltipText,
      bgClass,
      textClass,
      isCurrentDay,
      isPastDay,
      accessibleLabel,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-200">
      {/* Calendar Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <h4 className="text-base font-medium text-gray-900 leading-none">
          {format(firstDay, 'MMMM yyyy')}
        </h4>
        <div className="mt-1 text-xs text-gray-600 min-h-[1.25rem] flex items-center gap-2">
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
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn('aspect-square p-1 text-xs relative', !day && 'bg-gray-50 ')}
            >
              {day && (
                <CalendarDay
                  day={day}
                  dayInfo={getDayInfo(day)}
                  hasPublicHoliday={dayTypeFlags.hasPublicHoliday}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
