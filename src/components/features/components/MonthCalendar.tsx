import { eachDayOfInterval, endOfMonth, format, getDay, getMonth, parse, startOfMonth } from 'date-fns';
import clsx from 'clsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OptimizedDay } from '@/types';

interface MonthCalendarProps {
  month: number
  year: number
  days: OptimizedDay[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function MonthCalendar({ month, year, days }: MonthCalendarProps) {
  const firstDay = startOfMonth(new Date(year, month))
  const lastDay = endOfMonth(firstDay)
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startingDayIndex = getDay(firstDay)

  // Check if any day types exist in the data
  const hasCTODays = days.some(day => day.isCTO)
  const hasPublicHoliday = days.some(day => day.isPublicHoliday)
  const hasCustomDaysOff = days.some(day => day.isCustomDayOff)
  const hasExtendedWeekends = days.some(day => day.isPartOfBreak && day.isWeekend)

  // Create calendar grid with empty cells for proper alignment
  const calendarDays = Array(35).fill(null)
  daysInMonth.forEach((date, index) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const day = days.find(d => d.date === dateStr)
    calendarDays[startingDayIndex + index] = day || {
      date: dateStr,
      isWeekend: getDay(date) === 0 || getDay(date) === 6,
      isCTO: false,
      isPartOfBreak: false
    }
  })

  // Get holidays for the current month
  const holidays = days.filter(day => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    return day.isPublicHoliday && getMonth(date) === month
  })

  const getDayColor = (day: OptimizedDay) => {
    // Order of precedence: Custom Days > Public Holidays > Extended Weekends > CTO Days
    if (hasCustomDaysOff && day.isCustomDayOff) return 'bg-emerald-100 dark:bg-emerald-900/50'
    if (hasPublicHoliday && day.isPublicHoliday) return 'bg-amber-100 dark:bg-amber-900/50'
    if (hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) return 'bg-violet-100 dark:bg-violet-900/50'
    if (hasCTODays && day.isCTO) return 'bg-teal-100 dark:bg-teal-900/50'
    return 'bg-white dark:bg-gray-800/60'
  }

  const getDayTextColor = (day: OptimizedDay) => {
    // Order of precedence: Custom Days > Public Holidays > Extended Weekends > CTO Days
    if (hasCustomDaysOff && day.isCustomDayOff) return 'text-emerald-900 dark:text-emerald-100'
    if (hasPublicHoliday && day.isPublicHoliday) return 'text-amber-900 dark:text-amber-100'
    if (hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) return 'text-violet-900 dark:text-violet-100'
    if (hasCTODays && day.isCTO) return 'text-teal-900 dark:text-teal-100'
    return 'text-gray-900 dark:text-gray-100'
  }

  const getDayTooltip = (day: OptimizedDay) => {
    // Order of precedence: Custom Days > Public Holidays > Extended Weekends > CTO Days
    if (hasCustomDaysOff && day.isCustomDayOff) return day.customDayName || 'Custom Day Off'
    if (hasPublicHoliday && day.isPublicHoliday) return day.publicHolidayName || 'Public Holiday'
    if (hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) return 'Extended Weekend'
    if (hasCTODays && day.isCTO) return 'CTO Day'
    return ''
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10">
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 leading-none">
          {format(firstDay, 'MMMM yyyy')}
        </h4>
        {holidays.length > 0 && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Holidays: {holidays.map(h => h.publicHolidayName).join(', ')}
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={clsx(
                'aspect-square p-1 text-xs relative',
                !day && 'bg-gray-50 dark:bg-gray-800/30',
                day?.isPartOfBreak && 'font-semibold'
              )}
            >
              {day && (
                <>
                  <div 
                    className={clsx(
                      'absolute inset-0.5 rounded-md',
                      getDayColor(day)
                    )}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={clsx(
                        'absolute inset-0 flex items-center justify-center font-medium z-10 text-xs',
                        getDayTextColor(day)
                      )}>
                        {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'd')}
                      </div>
                    </TooltipTrigger>
                    {getDayTooltip(day) && (
                      <TooltipContent>
                        <p className="text-xs">{getDayTooltip(day)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  {/* Holiday Indicator Dot */}
                  {hasPublicHoliday && day.isPublicHoliday && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 