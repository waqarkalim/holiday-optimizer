'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse } from 'date-fns'
import clsx from 'clsx'

interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday?: boolean
  holidayName?: string
}

interface ResultsDisplayProps {
  optimizedDays: OptimizedDay[]
}

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function MonthCalendar({ month, year, days }: { month: number; year: number; days: OptimizedDay[] }) {
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

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {MONTHS[month]} {year}
        </h4>
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
                'aspect-square p-2 text-sm relative',
                !day && 'bg-gray-50 dark:bg-gray-800/30',
                day?.isPartOfBreak && 'font-semibold'
              )}
            >
              {day && (
                <>
                  <div 
                    className={clsx(
                      'absolute inset-1 rounded-lg border transition-colors',
                      day.isCTO && 'bg-teal-100 dark:bg-teal-900/50 border-teal-200 dark:border-teal-700',
                      day.isHoliday && 'bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-700',
                      day.isWeekend && day.isPartOfBreak && !day.isHoliday && !day.isCTO && 'bg-violet-100 dark:bg-violet-900/50 border-violet-200 dark:border-violet-700',
                      !(day.isCTO || day.isHoliday || (day.isWeekend && day.isPartOfBreak)) && 'bg-white dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                    )}
                  />
                  <div className={clsx(
                    'absolute inset-0 flex items-center justify-center font-medium z-10 transition-colors',
                    day.isCTO && 'text-teal-900 dark:text-teal-100',
                    day.isHoliday && 'text-amber-900 dark:text-amber-100',
                    day.isWeekend && day.isPartOfBreak && !day.isHoliday && !day.isCTO && 'text-violet-900 dark:text-violet-100',
                    !(day.isCTO || day.isHoliday || (day.isWeekend && day.isPartOfBreak)) && 'text-gray-700 dark:text-gray-300'
                  )}>
                    {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'd')}
                  </div>
                  {day.isHoliday && (
                    <div className="absolute bottom-1 left-2 right-2 text-[10px] leading-tight text-amber-900 dark:text-amber-100 font-medium z-10 text-center">
                      {day.holidayName}
                    </div>
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

export function ResultsDisplay({ optimizedDays }: ResultsDisplayProps) {
  if (!optimizedDays?.length) {
    return null
  }

  const totalDaysOff = optimizedDays.filter(day => day.isPartOfBreak).length
  const ctoDays = optimizedDays.filter(day => day.isCTO).length
  const extendedWeekends = optimizedDays.filter(day => day.isPartOfBreak && day.isWeekend).length
  const holidays = optimizedDays.filter(day => day.isHoliday).length

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 dark:bg-teal-900/30 rounded-md p-4 ring-1 ring-teal-900/10 dark:ring-teal-400/10">
        <div>
          <h3 className="text-lg font-medium text-teal-900 dark:text-teal-100">Optimization Results</h3>
          <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
            Total consecutive days off: {totalDaysOff} days
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-teal-700 dark:text-teal-300">
              • {ctoDays} CTO days
            </p>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              • {extendedWeekends} weekend days that are part of longer breaks
            </p>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              • {holidays} holidays
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MONTHS.map((_, index) => (
          <MonthCalendar
            key={index}
            month={index}
            year={2025}
            days={optimizedDays}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm p-4 ring-1 ring-gray-900/5 dark:ring-white/10">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700" />
            <span className="text-sm text-gray-700 dark:text-gray-300">CTO Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Holiday</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Extended Weekend</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Regular Day</span>
          </div>
        </div>
      </div>
    </div>
  )
} 