'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse, getMonth } from 'date-fns'
import clsx from 'clsx'

interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday?: boolean
  holidayName?: string
}

interface AlternativeDay {
  originalDate: string
  alternativeDate: string
  reason: string
}

interface BreakSummary {
  startDate: string
  endDate: string
  length: number
  ctoDaysUsed: number
  holidaysIncluded: string[]
  type: string
  season: string
}

interface ResultsDisplayProps {
  optimizedDays: OptimizedDay[]
  alternatives: AlternativeDay[]
  description?: string
  breaks?: BreakSummary[]
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

  // Get holidays for the current month
  const holidays = days.filter(day => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    return day.isHoliday && getMonth(date) === month
  })

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {MONTHS[month]} {year}
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
                  {/* Holiday Tooltip */}
                  {day.isHoliday && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs font-medium bg-gray-900 dark:bg-gray-700 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      {day.holidayName}
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

function AlternativesSection({ alternatives }: { alternatives: AlternativeDay[] }) {
  if (!alternatives.length) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-md p-4 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
      <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300">Alternative Options</h3>
      <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
        You have {alternatives.length} alternative {alternatives.length === 1 ? 'option' : 'options'} for your CTO days:
      </p>
      <div className="mt-3 space-y-2">
        {alternatives.map((alt, index) => (
          <div key={index} className="flex items-start space-x-2 text-sm">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-blue-700 dark:text-blue-300">
              Instead of {format(parse(alt.originalDate, 'yyyy-MM-dd', new Date()), 'MMMM d')}, 
              you could take {format(parse(alt.alternativeDate, 'yyyy-MM-dd', new Date()), 'MMMM d')} off. 
              <span className="block mt-0.5 text-blue-600 dark:text-blue-400">{alt.reason}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResultsDisplay({ optimizedDays, alternatives, description, breaks }: ResultsDisplayProps) {
  if (!optimizedDays?.length) {
    return null
  }

  const totalDaysOff = optimizedDays.filter(day => day.isPartOfBreak).length
  const ctoDays = optimizedDays.filter(day => day.isCTO).length
  const extendedWeekends = optimizedDays.filter(day => day.isPartOfBreak && day.isWeekend).length
  const holidays = optimizedDays.filter(day => day.isHoliday).length

  return (
    <div className="space-y-6">
      {/* Optimization Results */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/40 dark:to-teal-900/20 rounded-xl p-6 ring-1 ring-teal-900/10 dark:ring-teal-400/10 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100">Optimization Results</h3>
          </div>
          {description && (
            <p className="mt-2 text-sm text-teal-700 dark:text-teal-300 font-medium">
              {description}
            </p>
          )}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{totalDaysOff}</div>
              <div className="text-sm font-medium text-teal-700 dark:text-teal-300">Total Days Off</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{ctoDays}</div>
                <div className="text-xs font-medium text-teal-700 dark:text-teal-300">CTO Days</div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{extendedWeekends}</div>
                <div className="text-xs font-medium text-teal-700 dark:text-teal-300">Weekend Days</div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{holidays}</div>
                <div className="text-xs font-medium text-teal-700 dark:text-teal-300">Holidays</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Break Summaries */}
      {breaks && breaks.length > 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/40 dark:to-violet-900/20 rounded-xl p-6 ring-1 ring-violet-900/10 dark:ring-violet-400/10 shadow-sm">
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-violet-900 dark:text-violet-100">Break Details</h3>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {breaks.map((breakItem, index) => (
              <div key={index} className="bg-white dark:bg-gray-800/50 rounded-lg p-4 ring-1 ring-violet-900/5 dark:ring-violet-400/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-violet-900 dark:text-violet-100">
                      {format(parse(breakItem.startDate, 'yyyy-MM-dd', new Date()), 'MMMM d')} - {format(parse(breakItem.endDate, 'yyyy-MM-dd', new Date()), 'MMMM d')}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-violet-700 dark:text-violet-300">
                        {breakItem.length} days total ({breakItem.ctoDaysUsed} CTO days)
                      </p>
                      {breakItem.holidaysIncluded.length > 0 && (
                        <p className="text-violet-600 dark:text-violet-400">
                          Including: {breakItem.holidaysIncluded.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    breakItem.type === 'longWeekend' && 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
                    breakItem.type === 'weekBreak' && 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
                    breakItem.type === 'extendedBreak' && 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  )}>
                    {breakItem.type === 'longWeekend' ? 'Long Weekend' : 
                     breakItem.type === 'weekBreak' ? 'Week Break' : 
                     'Extended Break'}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-xs text-violet-600 dark:text-violet-400">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="capitalize">{breakItem.season}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives Section */}
      {alternatives && alternatives.length > 0 && (
        <AlternativesSection alternatives={alternatives} />
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm p-4 ring-1 ring-gray-900/5 dark:ring-white/10">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Calendar Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700" />
            <span className="text-sm text-gray-700 dark:text-gray-300">CTO Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 relative">
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
            </div>
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

      {/* Calendar Grid */}
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
    </div>
  )
} 