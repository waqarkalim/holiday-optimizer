import { format, parse } from 'date-fns'
import clsx from 'clsx'
import type { OptimizedDay } from '@/services/optimizer'
import { BREAK_LENGTHS } from '@/services/optimizer.constants'

interface Break {
  startDate: string
  endDate: string
  days: OptimizedDay[]
  totalDays: number
  ctoDays: number  // Must be > 0
  holidays: number
  weekends: number
  customDaysOff: number
}

interface BreakCardProps {
  breakPeriod: Break
}

export function BreakCard({ breakPeriod }: BreakCardProps) {
  // Validate that this is actually a break (contains CTO days)
  if (breakPeriod.ctoDays === 0) {
    console.warn('BreakCard received a period with no CTO days:', breakPeriod)
    return null
  }

  const startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
  const endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

  const getBreakType = (totalDays: number) => {
    if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) return 'Extended Break'
    if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) return 'Week Break'
    return 'Long Weekend'
  }

  const getBreakDescription = (totalDays: number) => {
    if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) {
      return `${BREAK_LENGTHS.EXTENDED.MIN} or more consecutive days off (including ${breakPeriod.ctoDays} CTO days)`
    }
    if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) {
      return `${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} consecutive days off (including ${breakPeriod.ctoDays} CTO days)`
    }
    return `${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} consecutive days off (including ${breakPeriod.ctoDays} CTO days)`
  }

  const getBreakStyles = (totalDays: number) => {
    if (totalDays >= BREAK_LENGTHS.EXTENDED.MIN) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    }
    if (totalDays >= BREAK_LENGTHS.WEEK_LONG.MIN) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    }
    return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {breakPeriod.totalDays} day{breakPeriod.totalDays !== 1 ? 's' : ''} off
          </p>
        </div>
        <div className={clsx(
          'px-3 py-1 rounded-full text-sm font-medium relative group cursor-help',
          getBreakStyles(breakPeriod.totalDays)
        )}>
          {getBreakType(breakPeriod.totalDays)}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs font-medium bg-gray-900 dark:bg-gray-700 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
            {getBreakDescription(breakPeriod.totalDays)}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        {breakPeriod.ctoDays > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <svg className="h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.ctoDays}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">CTO Days</p>
          </div>
        )}
        {breakPeriod.holidays > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.holidays}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{breakPeriod.holidays === 1 ? 'Public Holiday' : 'Public Holidays'}</p>
          </div>
        )}
        {breakPeriod.customDaysOff > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <svg className="h-4 w-4 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.customDaysOff}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{breakPeriod.customDaysOff === 1 ? 'Custom Day Off' : 'Custom Days Off'}</p>
          </div>
        )}
        {breakPeriod.weekends > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <svg className="h-4 w-4 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.weekends}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Weekends</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex space-x-1">
          {breakPeriod.days.map((day) => (
            <div
              key={day.date}
              className={clsx(
                'h-2 flex-1 rounded-full',
                day.isCTO ? 'bg-blue-500 dark:bg-blue-400' :
                  day.isHoliday ? 'bg-amber-500 dark:bg-amber-400' :
                    day.isCustomDayOff ? 'bg-emerald-500 dark:bg-emerald-400' :
                      day.isWeekend ? 'bg-violet-500 dark:bg-violet-400' :
                        'bg-gray-200 dark:bg-gray-700'
              )}
              title={`${format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMM d')} - ${day.isCTO ? 'CTO Day' :
                day.isHoliday ? day.holidayName || 'Holiday' :
                  day.isCustomDayOff ? day.customDayName || 'Custom Day Off' :
                    day.isWeekend ? 'Weekend' : 'Work Day'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 