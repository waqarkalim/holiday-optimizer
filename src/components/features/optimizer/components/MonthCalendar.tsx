import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getMonth, parse } from 'date-fns'
import clsx from 'clsx'
import type { OptimizedDay } from '@/services/optimizer'

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
    return day.isHoliday && getMonth(date) === month
  })

  const getDayColor = (day: OptimizedDay) => {
    if (day.isCTO) return 'bg-teal-100 dark:bg-teal-900/50'
    if (day.isHoliday) return 'bg-amber-100 dark:bg-amber-900/50'
    if (day.isCustomDayOff) return 'bg-emerald-100 dark:bg-emerald-900/50'
    if (day.isPartOfBreak && day.isWeekend) return 'bg-violet-100 dark:bg-violet-900/50'
    return 'bg-white dark:bg-gray-800/60'
  }

  const getDayTextColor = (day: OptimizedDay) => {
    if (day.isCTO) return 'text-teal-900 dark:text-teal-100'
    if (day.isHoliday) return 'text-amber-900 dark:text-amber-100'
    if (day.isCustomDayOff) return 'text-emerald-900 dark:text-emerald-100'
    if (day.isPartOfBreak && day.isWeekend) return 'text-violet-900 dark:text-violet-100'
    return 'text-gray-900 dark:text-gray-100'
  }

  const getDayTooltip = (day: OptimizedDay) => {
    if (day.isCTO) return 'CTO Day'
    if (day.isHoliday) return day.holidayName || 'Public Holiday'
    if (day.isCustomDayOff) return day.customDayName || 'Custom Day Off'
    if (day.isPartOfBreak && day.isWeekend) return 'Extended Weekend'
    return ''
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {format(firstDay, 'MMMM yyyy')}
        </h4>
        {holidays.length > 0 && (
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Holidays: {holidays.map(h => h.holidayName).join(', ')}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={clsx(
                'aspect-square p-2 text-sm relative group',
                !day && 'bg-gray-50 dark:bg-gray-800/30',
                day?.isPartOfBreak && 'font-semibold'
              )}
            >
              {day && (
                <>
                  <div 
                    className={clsx(
                      'absolute inset-1 rounded-lg transition-colors',
                      getDayColor(day)
                    )}
                  />
                  <div className={clsx(
                    'absolute inset-0 flex items-center justify-center font-medium z-10 transition-colors',
                    getDayTextColor(day)
                  )}>
                    {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'd')}
                  </div>
                  {/* Holiday Tooltip */}
                  {day.isHoliday && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs font-medium bg-gray-900 dark:bg-gray-700 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      {getDayTooltip(day)}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700" />
                    </div>
                  )}
                  {/* Holiday Indicator Dot */}
                  {day.isHoliday && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
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