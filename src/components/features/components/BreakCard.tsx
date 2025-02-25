import { format, parse } from 'date-fns';
import { Break } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BREAK_LENGTHS } from '@/constants';
import { Calendar, Star, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreakCardProps {
  breakPeriod: Break;
}

export function BreakCard({ breakPeriod }: BreakCardProps) {
  const startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date());
  const endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date());

  const getBreakType = (totalDays: number) => {
    if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) return 'Extended Break';
    if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) return 'Week Break';
    if (totalDays >= BREAK_LENGTHS.MINI_BREAK.MIN) return 'Mini Break';
    return 'Long Weekend';
  };

  const getBreakStyles = (totalDays: number) => {
    if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
    if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    }
    if (totalDays >= BREAK_LENGTHS.MINI_BREAK.MIN) {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    }
    return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  };

  // Helper function to get day color classes
  const getDayColorClasses = (day: Break['days'][0]) => {
    if (day.isCTO) {
      return 'bg-green-100 dark:bg-green-900/50';
    }
    if (day.isPublicHoliday) {
      return 'bg-amber-100 dark:bg-amber-900/50';
    }
    if (day.isCompanyDayOff) {
      return 'bg-violet-100 dark:bg-violet-900/50';
    }
    if (day.isWeekend) {
      return 'bg-teal-100 dark:bg-teal-900/50';
    }
    return 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-none">
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {breakPeriod.totalDays} day{breakPeriod.totalDays !== 1 ? 's' : ''} off
          </p>
        </div>
        <div className={cn(
          'px-2 py-1 rounded-lg text-xs font-medium',
          getBreakStyles(breakPeriod.totalDays),
        )}>
          {getBreakType(breakPeriod.totalDays)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {breakPeriod.ctoDays > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.ctoDays}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">CTO Days</p>
          </div>
        )}
        {breakPeriod.publicHolidays > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.publicHolidays}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {breakPeriod.publicHolidays === 1 ? 'Public Holiday' : 'Public Holidays'}
            </p>
          </div>
        )}
        {breakPeriod.companyDaysOff > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.companyDaysOff}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {breakPeriod.companyDaysOff === 1 ? 'Company Day Off' : 'Company Days Off'}
            </p>
          </div>
        )}
        {breakPeriod.weekends > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.weekends}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Weekends</p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex space-x-0.5">
          {breakPeriod.days.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'h-1.5 flex-1 rounded-sm relative group cursor-help',
                    getDayColorClasses(day)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{`${format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMM d')} - ${day.isCTO ? 'CTO Day' :
                  day.isPublicHoliday ? day.publicHolidayName || 'Holiday' :
                    day.isCompanyDayOff ? day.companyDayName || 'Company Day Off' :
                      day.isWeekend ? 'Weekend' : 'Work Day'
                }`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
} 