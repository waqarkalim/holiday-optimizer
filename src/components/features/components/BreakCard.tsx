import { format, parse } from 'date-fns';
import clsx from 'clsx';
import { BREAK_LENGTHS } from '@/services/optimizer.constants';
import { Break } from '@/types';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BreakCardProps {
  breakPeriod: Break;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const timelineVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.2,
    },
  },
};

const dayVariants = {
  hidden: { opacity: 0, scaleY: 0 },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.2 },
  },
};

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

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-none">
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {breakPeriod.totalDays} day{breakPeriod.totalDays !== 1 ? 's' : ''} off
          </p>
        </div>
        <div className={clsx(
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
              <svg
                className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.ctoDays}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">CTO Days</p>
          </div>
        )}
        {breakPeriod.publicHolidays > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <svg
                className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.publicHolidays}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {breakPeriod.publicHolidays === 1 ? 'Public Holiday' : 'Public Holidays'}
            </p>
          </div>
        )}
        {breakPeriod.companyDaysOff > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <svg
                className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.companyDaysOff}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {breakPeriod.companyDaysOff === 1 ? 'Company Day Off' : 'Company Days Off'}
            </p>
          </div>
        )}
        {breakPeriod.weekends > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <svg
                className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{breakPeriod.weekends}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Weekends</p>
          </div>
        )}
      </div>

      <motion.div
        variants={timelineVariants}
        initial="hidden"
        animate="visible"
        className="mt-3"
      >
        <div className="flex space-x-0.5">
          {breakPeriod.days.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <motion.div
                  key={day.date}
                  variants={dayVariants}
                  className={clsx(
                    'h-1.5 flex-1 rounded-sm relative group cursor-help',
                    day.isCTO ? 'bg-blue-500 dark:bg-blue-400' :
                      day.isPublicHoliday ? 'bg-amber-500 dark:bg-amber-400' :
                        day.isCompanyDayOff ? 'bg-emerald-500 dark:bg-emerald-400' :
                          day.isWeekend ? 'bg-violet-500 dark:bg-violet-400' :
                            'bg-gray-200 dark:bg-gray-700',
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
      </motion.div>
    </motion.div>
  );
} 