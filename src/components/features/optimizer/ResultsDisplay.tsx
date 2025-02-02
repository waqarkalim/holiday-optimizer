'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse, getMonth } from 'date-fns'
import clsx from 'clsx'
import type { OptimizedDay } from '@/services/optimizer'
import { useMemo } from 'react'
import { StatCard } from './components/StatCard'
import { TotalDaysOffCard } from './components/TotalDaysOffCard'
import { CalendarLegend } from './components/CalendarLegend'
import { countExtendedWeekends, findBreaks, type Break } from './utils/breaks'
import { BreakCard } from './components/BreakCard'
import { MonthCalendar } from './components/MonthCalendar'

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
] as const

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

interface ResultsDisplayProps {
  optimizedDays: OptimizedDay[]
}

export function ResultsDisplay({ optimizedDays }: ResultsDisplayProps) {
  // Calculate statistics
  const ctoDays = optimizedDays.filter(d => d.isCTO).length
  const breakDays = optimizedDays.filter(d => d.isPartOfBreak).length
  const holidays = optimizedDays.filter(d => d.isHoliday).length
  const extendedWeekends = countExtendedWeekends(optimizedDays)
  const breaks = useMemo(() => findBreaks(optimizedDays), [optimizedDays])

  return (
    <div className="space-y-8">
      {/* Optimization Results */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-gray-800/80 dark:to-gray-800/40 rounded-xl p-6 ring-1 ring-teal-900/10 dark:ring-teal-300/10 shadow-sm overflow-visible">
        <div>
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100">Optimization Results</h3>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <TotalDaysOffCard totalDays={breakDays} />

            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <StatCard
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                value={ctoDays}
                label={ctoDays === 1 ? 'CTO Day' : 'CTO Days'}
                tooltip="Number of CTO (paid time off) days you'll be using in this plan"
                colorScheme="blue"
              />
              <StatCard
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                value={extendedWeekends}
                label="Extended Weekends"
                tooltip="Number of weekends that are extended by CTO days or public holidays"
                colorScheme="violet"
              />
              <StatCard
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
                value={holidays}
                label={holidays === 1 ? 'Public Holiday' : 'Public Holidays'}
                tooltip="Number of public holidays that fall within the calendar year"
                colorScheme="amber"
              />
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

        <CalendarLegend />

        {/* Monthly Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MONTHS.map((_, index) => (
            <MonthCalendar
              key={index}
              month={index}
              year={(new Date()).getFullYear()}
              days={optimizedDays}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 