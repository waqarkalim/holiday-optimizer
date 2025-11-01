/**
 * BreakCard Component
 *
 * Displays a card representing a break period with details about dates,
 * day types, and a visual representation of the days in the break.
 */
import { format, parse } from 'date-fns';
import { Break } from '@/types';
import { Tooltip, TooltipTrigger, StatTooltipContent } from '@/shared/components/ui/tooltip';
import { BREAK_LENGTHS, COLOR_SCHEMES } from '@/constants';
import { Calendar, Clock, Sparkles, Star } from 'lucide-react';
import { cn, DayType, dayTypeToColorScheme } from '@/shared/lib/utils';
import { ReactNode } from 'react';

interface BreakCardProps {
  breakPeriod: Break;
}

/**
 * Determines the type of break based on the total number of days
 * @param totalDays - Total number of days in the break period
 * @returns A string representing the break type (Extended Break, Week Break, Mini Break, or Long Weekend)
 */
const getBreakType = (totalDays: number) => {
  if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) return 'Extended Break';
  if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) return 'Week Break';
  if (totalDays >= BREAK_LENGTHS.MINI_BREAK.MIN) return 'Mini Break';
  return 'Long Weekend';
};

/**
 * Gets the appropriate styling classes for the break type badge
 * @param totalDays - Total number of days in the break period
 * @returns A string of Tailwind CSS classes for styling the break type badge
 */
const getBreakStyles = (totalDays: number) => {
  if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) return 'bg-purple-50 text-purple-700';
  if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) return 'bg-blue-50 text-blue-700';
  if (totalDays >= BREAK_LENGTHS.MINI_BREAK.MIN) return 'bg-orange-50 text-orange-700';
  return 'bg-green-50 text-green-700';
};

/**
 * Determines the type of day (PTO, public holiday, company day off, weekend, or default)
 * @param day - A day object from the break period
 * @returns The day type as a DayType enum value
 */
const getDayType = (day: Break['days'][0]): DayType => {
  if (day.isPTO) return 'pto';
  if (day.isPublicHoliday) return 'publicHoliday';
  if (day.isCompanyDayOff) return 'companyDayOff';
  if (day.isWeekend) return 'weekend';
  return 'default';
};

/**
 * Gets a human-readable description of the day type for tooltips
 * @param day - A day object from the break period
 * @returns A string describing the day type
 */
const getDayDescription = (day: Break['days'][0]): string => {
  if (day.isPTO) return 'PTO Day';
  if (day.isPublicHoliday) return day.publicHolidayName || 'Holiday';
  if (day.isCompanyDayOff) return day.companyDayName || 'Company Day Off';
  if (day.isWeekend) return 'Weekend';
  return 'Work Day';
};

/**
 * DayCount Component
 *
 * Displays a count of a specific day type with an icon and label
 */
interface DayCountProps {
  count: number;
  icon: ReactNode;
  label: string;
}

const DayCount = ({ count, icon, label }: DayCountProps) => (
  <div className="space-y-0.5">
    <div className="flex items-center space-x-1">
      {icon}
      <span className="text-xs font-medium text-gray-900">{count}</span>
    </div>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

/**
 * DayCountsGrid Component
 *
 * Displays a grid of day type counts (PTO days, public holidays, etc.)
 */
interface DayCountsGridProps {
  breakPeriod: Break;
}

const iconSize = 'h-3.5 w-3.5';

const DayCountsGrid = ({ breakPeriod }: DayCountsGridProps) => (
  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {/* PTO Days count */}
    {breakPeriod.ptoDays > 0 && (
      <DayCount
        count={breakPeriod.ptoDays}
        icon={
          <Calendar className={cn(iconSize, COLOR_SCHEMES[dayTypeToColorScheme.pto].icon.text)} />
        }
        label={breakPeriod.ptoDays === 1 ? 'PTO Day' : 'PTO Days'}
      />
    )}

    {/* Public Holidays count */}
    {breakPeriod.publicHolidays > 0 && (
      <DayCount
        count={breakPeriod.publicHolidays}
        icon={
          <Star
            className={cn(iconSize, COLOR_SCHEMES[dayTypeToColorScheme.publicHoliday].icon.text)}
          />
        }
        label={breakPeriod.publicHolidays === 1 ? 'Public Holiday' : 'Public Holidays'}
      />
    )}

    {/* Company Days Off count */}
    {breakPeriod.companyDaysOff > 0 && (
      <DayCount
        count={breakPeriod.companyDaysOff}
        icon={
          <Sparkles
            className={cn(iconSize, COLOR_SCHEMES[dayTypeToColorScheme.companyDayOff].icon.text)}
          />
        }
        label={breakPeriod.companyDaysOff === 1 ? 'Company Day Off' : 'Company Days Off'}
      />
    )}

    {/* Weekends count */}
    {breakPeriod.weekends > 0 && (
      <DayCount
        count={breakPeriod.weekends}
        icon={
          <Clock className={cn(iconSize, COLOR_SCHEMES[dayTypeToColorScheme.weekend].icon.text)} />
        }
        label={breakPeriod.weekends === 1 ? 'Weekend' : 'Weekends'}
      />
    )}
  </div>
);

/**
 * DayVisualization Component
 *
 * Displays a visual representation of the days in the break period
 * with color-coded bars and tooltips showing day information
 */
interface DayVisualizationProps {
  days: Break['days'];
}

const DayVisualization = ({ days }: DayVisualizationProps) => {
  return (
    <div className="mt-3">
      <div className="sr-only">
        <p>
          {days.map(day => {
            const parsed = parse(day.date, 'yyyy-MM-dd', new Date());
            const fullDate = format(parsed, 'MMMM d, yyyy');
            const baseDescription = getDayDescription(day);
            const extras: string[] = [];

            if (day.isPartOfBreak) {
              extras.push('part of the break period');
            }

            if (day.isPreBooked) {
              extras.push('pre-booked and locked');
            }

            const extraText = extras.length ? ` (${extras.join(', ')})` : '';
            return (
              <span key={day.date}>{`${fullDate}: ${baseDescription}${extraText}. `}</span>
            );
          })}
        </p>
      </div>

      {/* Container for day bars with bottom alignment */}
      <div className="flex space-x-0.5 items-end h-3">
        {days.map(day => {
          const dayType = getDayType(day);
          const colorScheme = dayTypeToColorScheme[dayType];
          const parsedDate = parse(day.date, 'yyyy-MM-dd', new Date());
          const formattedDate = format(parsedDate, 'MMM d');
          const description = getDayDescription(day);
          const accessibleLabelParts = [`${format(parsedDate, 'EEEE, MMMM d, yyyy')}: ${description}`];

          if (day.isPartOfBreak) {
            accessibleLabelParts.push('Part of the break period');
          }

          if (day.isPreBooked) {
            accessibleLabelParts.push('Pre-booked and locked');
          }

          // Determine height based on day type for visual hierarchy
          const heightClass = 'h-2';

          return (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                {/* Day bar with color based on day type */}
                <button
                  type="button"
                  className={cn(
                    'flex-1 rounded-sm relative group cursor-help',
                    // Color mapping based on color scheme
                    COLOR_SCHEMES[colorScheme].calendar.bg,
                    heightClass,
                    'border border-transparent hover:border-gray-200',
                    'transition-all duration-150 hover:shadow-sm',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500'
                  )}
                  aria-label={accessibleLabelParts.join('. ')}
                />
              </TooltipTrigger>
              {/* Tooltip showing date and day type */}
              <StatTooltipContent colorScheme={colorScheme}>
                <p className="text-xs">{`${formattedDate} - ${description}`}</p>
              </StatTooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

/**
 * BreakHeader Component
 *
 * Displays the header of the break card with date range and break type
 */
interface BreakHeaderProps {
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

const BreakHeader = ({ startDate, endDate, totalDays }: BreakHeaderProps) => (
  <div className="flex items-start justify-between">
    {/* Date range and total days */}
    <div className="space-y-0.5">
      <h3 className="text-base font-semibold text-gray-900 leading-none">
        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
      </h3>
      <p className="text-xs text-gray-500">
        {totalDays} day{totalDays !== 1 ? 's' : ''} off
      </p>
    </div>
    {/* Break type badge */}
    <div className={cn('px-2 py-1 rounded-lg text-xs font-medium', getBreakStyles(totalDays))}>
      {getBreakType(totalDays)}
    </div>
  </div>
);

/**
 * Main BreakCard Component
 *
 * Assembles all the sub-components to create a complete break card
 */
export const BreakCard = ({ breakPeriod }: BreakCardProps) => {
  // Parse string dates into Date objects
  const startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date());
  const endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date());

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4">
      {/* Header with date range and break type */}
      <BreakHeader startDate={startDate} endDate={endDate} totalDays={breakPeriod.totalDays} />
      {/* Grid showing counts of different day types */}
      <DayCountsGrid breakPeriod={breakPeriod} />
      {/* Visual representation of days in the break */}
      <DayVisualization days={breakPeriod.days} />
    </div>
  );
};
