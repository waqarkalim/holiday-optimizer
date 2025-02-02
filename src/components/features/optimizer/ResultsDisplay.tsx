'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse, getMonth, differenceInDays } from 'date-fns'
import clsx from 'clsx'
import type { OptimizedDay } from '@/services/optimizer'
import { useMemo } from 'react'

interface ResultsDisplayProps {
  optimizedDays: OptimizedDay[]
}

interface Break {
  startDate: string
  endDate: string
  days: OptimizedDay[]
  totalDays: number
  ctoDays: number
  holidays: number
  weekends: number
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
                      'absolute inset-1 rounded-lg transition-colors',
                      day.isCTO && 'bg-teal-100 dark:bg-teal-900/50',
                      day.isHoliday && 'bg-amber-100 dark:bg-amber-900/50',
                      day.isWeekend && day.isPartOfBreak && !day.isHoliday && !day.isCTO && 'bg-violet-100 dark:bg-violet-900/50',
                      !(day.isCTO || day.isHoliday || (day.isWeekend && day.isPartOfBreak)) && 'bg-white dark:bg-gray-800/30'
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

function findBreaks(days: OptimizedDay[]): Break[] {
  const breaks: Break[] = []
  let currentBreak: OptimizedDay[] = []

  for (let i = 0; i < days.length; i++) {
    if (days[i].isPartOfBreak) {
      currentBreak.push(days[i])
    } else if (currentBreak.length > 0) {
      // Process the break
      const ctoDays = currentBreak.filter(d => d.isCTO).length
      const holidays = currentBreak.filter(d => d.isHoliday).length
      const weekends = currentBreak.filter(d => d.isWeekend).length

      breaks.push({
        startDate: currentBreak[0].date,
        endDate: currentBreak[currentBreak.length - 1].date,
        days: currentBreak,
        totalDays: currentBreak.length,
        ctoDays,
        holidays,
        weekends
      })
      currentBreak = []
    }
  }

  // Handle the last break if it exists
  if (currentBreak.length > 0) {
    const ctoDays = currentBreak.filter(d => d.isCTO).length
    const holidays = currentBreak.filter(d => d.isHoliday).length
    const weekends = currentBreak.filter(d => d.isWeekend).length

    breaks.push({
      startDate: currentBreak[0].date,
      endDate: currentBreak[currentBreak.length - 1].date,
      days: currentBreak,
      totalDays: currentBreak.length,
      ctoDays,
      holidays,
      weekends
    })
  }

  return breaks
}

function BreakCard({ breakPeriod }: { breakPeriod: Break }) {
  const startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
  const endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())
  
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
          breakPeriod.totalDays >= 8
            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            : breakPeriod.totalDays >= 5
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        )}>
          {breakPeriod.totalDays >= 8 ? 'Extended Break' : breakPeriod.totalDays >= 5 ? 'Week Break' : 'Long Weekend'}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs font-medium bg-gray-900 dark:bg-gray-700 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
            {breakPeriod.totalDays >= 8 
              ? '8 or more consecutive days off' 
              : breakPeriod.totalDays >= 5 
              ? '5-7 consecutive days off'
              : '3-4 consecutive days off, typically around weekends'}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <svg className="h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.ctoDays}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">CTO Days</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.holidays}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Holidays</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <svg className="h-4 w-4 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{breakPeriod.weekends}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Weekends</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex space-x-1">
          {breakPeriod.days.map((day, index) => (
            <div
              key={day.date}
              className={clsx(
                'h-2 flex-1 rounded-full',
                day.isCTO ? 'bg-blue-500 dark:bg-blue-400' :
                day.isHoliday ? 'bg-amber-500 dark:bg-amber-400' :
                day.isWeekend ? 'bg-violet-500 dark:bg-violet-400' :
                'bg-gray-200 dark:bg-gray-700'
              )}
              title={`${format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMM d')} - ${
                day.isCTO ? 'CTO Day' :
                day.isHoliday ? day.holidayName || 'Holiday' :
                day.isWeekend ? 'Weekend' : 'Work Day'
              }`}
            />
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

  // Calculate statistics
  const totalDays = optimizedDays.length
  const ctoDays = optimizedDays.filter(d => d.isCTO).length
  const breakDays = optimizedDays.filter(d => d.isPartOfBreak).length
  const holidays = optimizedDays.filter(d => d.isHoliday).length

  // Find extended weekends (including those extended by holidays)
  const extendedWeekends = optimizedDays.reduce((count, day, index, arr) => {
    // Skip if not a weekend
    if (!day.isWeekend) return count

    // Check if this weekend is part of a break
    if (!day.isPartOfBreak) {
      // Even if not marked as part of a break, check if it's extended by holidays
      const prevDay = arr[index - 1]
      const nextDay = arr[index + 1]
      const prevDayIsHoliday = prevDay?.isHoliday
      const nextDayIsHoliday = nextDay?.isHoliday
      
      // If not connected to a holiday, skip
      if (!prevDayIsHoliday && !nextDayIsHoliday) return count
    }

    // Only count Saturdays to avoid counting the same weekend twice
    if (parse(day.date, 'yyyy-MM-dd', new Date()).getDay() === 6) {
      return count + 1
    }

    return count
  }, 0)

  const breaks = useMemo(() => findBreaks(optimizedDays), [optimizedDays])

  return (
    <div className="space-y-8">
      {/* Optimization Results */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/40 dark:to-teal-900/20 rounded-xl p-6 ring-1 ring-teal-900/10 dark:ring-teal-400/10 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100">Optimization Results</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{breakDays}</div>
              <div className="text-sm font-medium text-teal-700 dark:text-teal-300">Total Days Off</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{ctoDays}</div>
                <div className="text-xs font-medium text-teal-700 dark:text-teal-300">CTO Days</div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{extendedWeekends}</div>
                <div className="text-xs font-medium text-teal-700 dark:text-teal-300">Extended Weekends</div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-400/5">
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{holidays}</div>
                <div className="text-xs font-medium text-teal-700 dark:text-teal-300">Holidays</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Break Details */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Break Details
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {breaks.length} break{breaks.length !== 1 ? 's' : ''} planned
          </span>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {breaks.map((breakPeriod, index) => (
            <BreakCard key={index} breakPeriod={breakPeriod} />
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-xl p-6 ring-1 ring-blue-900/10 dark:ring-blue-400/10 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Calendar View</h3>
        </div>

        {/* Legend */}
        <div className="mb-6 bg-white dark:bg-gray-800/50 rounded-lg p-4 ring-1 ring-blue-900/5 dark:ring-blue-400/5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700" />
              <span className="text-sm text-gray-700 dark:text-gray-300">CTO Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700">
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Holiday</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Extended Weekend</span>
            </div>
          </div>
        </div>

        {/* Monthly Calendar Grid */}
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
    </div>
  )
} 