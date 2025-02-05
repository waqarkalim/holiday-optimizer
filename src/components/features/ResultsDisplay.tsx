'use client';

import { motion } from 'framer-motion';
import StatCard from './components/StatCard';
import { TotalDaysOffCard } from './components/TotalDaysOffCard';
import { CalendarLegend } from './components/CalendarLegend';
import { BreakCard } from './components/BreakCard';
import { MonthCalendar } from './components/MonthCalendar';
import { Break, OptimizationStats, OptimizedDay } from '@/types';
import { MONTHS } from '@/constants';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Component Props Types
interface ResultsDisplayProps {
  optimizedDays: OptimizedDay[];
  breaks: Break[];
  stats: OptimizationStats;
}

export function ResultsDisplay({ optimizedDays, breaks, stats }: ResultsDisplayProps) {
  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Summary Section */}
      <motion.div
        variants={item}
        className="relative overflow-visible"
      >
        {/* Background decorative elements */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-950/20 dark:to-transparent rounded-3xl" />
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl" />

        {/* Main content */}
        <div className="relative rounded-3xl p-8 ring-1 ring-teal-900/10 dark:ring-teal-300/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
                <svg className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100">
                  Optimization Results
                </h3>
                <p className="text-sm text-teal-600/80 dark:text-teal-300/80">
                  Your optimized time off schedule for maximum enjoyment
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-900/70 transition-colors"
            >
              Export Schedule
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Total Days Off Card - Spans 4 columns */}
            <div className="md:col-span-4">
              <TotalDaysOffCard totalDays={stats.totalDaysOff} />
            </div>

            {/* Stats Grid - Spans 8 columns */}
            <div className="md:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  value={stats.totalCTODays}
                  label={stats.totalCTODays === 1 ? 'CTO Day' : 'CTO Days'}
                  tooltip="Number of CTO (paid time off) days you'll be using in this plan"
                  colorScheme="blue"
                />
                <StatCard
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  value={stats.totalExtendedWeekends}
                  label="Extended Weekends"
                  tooltip="Number of weekends that are extended by CTO days or public holidays"
                  colorScheme="violet"
                />
                <StatCard
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                  value={stats.totalPublicHolidays}
                  label={stats.totalPublicHolidays === 1 ? 'Public Holiday' : 'Public Holidays'}
                  tooltip="Number of public holidays that fall within the calendar year"
                  colorScheme="amber"
                />
                {stats.totalCustomDaysOff > 0 && (
                  <StatCard
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    }
                    value={stats.totalCustomDaysOff}
                    label={stats.totalCustomDaysOff === 1 ? 'Custom Day Off' : 'Custom Days Off'}
                    tooltip="Number of custom days off provided by your organization"
                    colorScheme="emerald"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Break Details */}
      <motion.div
        variants={item}
        className="relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent rounded-3xl" />
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl" />

        <div className="relative rounded-3xl p-8 ring-1 ring-violet-900/10 dark:ring-violet-300/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
                <svg className="h-6 w-6 text-violet-600 dark:text-violet-300" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-violet-900 dark:text-violet-100">
                  Break Details
                </h2>
                <p className="text-sm text-violet-600/80 dark:text-violet-300/80">
                  Your optimized breaks throughout the year
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-4 py-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg text-sm font-medium text-violet-700 dark:text-violet-300">
                {breaks.length} break{breaks.length !== 1 ? 's' : ''} planned
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/70 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {breaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-xl mb-4">
                <svg className="h-8 w-8 text-violet-600 dark:text-violet-300" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-2">
                No Breaks Planned Yet
              </h3>
              <p className="text-sm text-violet-600/80 dark:text-violet-300/80 max-w-md">
                Adjust your CTO days and preferences to see optimized break suggestions
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-fr">
              {breaks.map((breakPeriod, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="h-full"
                >
                  <BreakCard breakPeriod={breakPeriod} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Calendar View */}
      <motion.div
        variants={item}
        className="relative overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent rounded-3xl" />
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl" />

        <div className="relative rounded-3xl p-8 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Calendar View
              </h3>
              <p className="text-sm text-blue-600/80 dark:text-blue-300/80">
                Your year at a glance
              </p>
            </div>
          </div>

          <CalendarLegend
            hasCTODays={stats.totalCTODays > 0}
            hasHolidays={stats.totalPublicHolidays > 0}
            hasCustomDaysOff={stats.totalCustomDaysOff > 0}
            hasExtendedWeekends={stats.totalExtendedWeekends > 0}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {MONTHS.map((_, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <MonthCalendar
                  month={index}
                  year={(new Date()).getFullYear()}
                  days={optimizedDays}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 