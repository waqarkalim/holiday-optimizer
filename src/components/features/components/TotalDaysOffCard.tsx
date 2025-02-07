import { useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

interface TotalDaysOffCardProps {
  totalDays: number
  previousTotalDays?: number
}

export function TotalDaysOffCard({ totalDays, previousTotalDays }: TotalDaysOffCardProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const percentageOfYear = (totalDays / 365) * 100
  const previousPercentage = previousTotalDays ? (previousTotalDays / 365) * 100 : null
  const hasChanged = previousTotalDays !== undefined && previousTotalDays !== totalDays
  const isIncrease = previousTotalDays !== undefined && totalDays > previousTotalDays
  const changeAmount = previousTotalDays !== undefined ? totalDays - previousTotalDays : 0

  return (
    <motion.div 
      className="md:col-span-2 bg-white dark:bg-gray-800/60 rounded-xl p-6 ring-1 ring-teal-900/5 dark:ring-teal-300/10 relative overflow-visible"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      role="article"
      aria-label={`Total Days Off: ${totalDays} days (${percentageOfYear.toFixed(1)}% of the year)`}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/20 dark:to-transparent rounded-xl"
        animate={{
          opacity: [0.5, 0.8, 0.5],
          transition: { duration: 3, repeat: Infinity }
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div 
              className="flex items-center space-x-2"
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
              onFocus={() => setIsTooltipVisible(true)}
              onBlur={() => setIsTooltipVisible(false)}
            >
              <p className="text-sm font-medium text-teal-600 dark:text-teal-300">Total Days Off</p>
              <button
                type="button"
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 rounded-full"
                aria-label="Show information about total days off"
                aria-expanded={isTooltipVisible}
              >
                <svg 
                  className="h-5 w-5 text-teal-500/70 dark:text-teal-300/70 transition-opacity group-hover:opacity-80" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <AnimatePresence>
                {isTooltipVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                      'absolute left-1/2 -translate-x-1/2 bottom-full mb-2',
                      'px-4 py-2.5 min-w-[240px]',
                      'text-sm font-medium text-gray-900 dark:text-gray-50',
                      'rounded-lg shadow-lg backdrop-blur-sm',
                      'z-20 bg-teal-50 dark:bg-teal-900/90'
                    )}
                    role="tooltip"
                  >
                    <div className="relative">
                      Total number of days you&apos;ll be off work, including CTO days, public holidays, and weekends
                      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full">
                        <div className="w-0 h-0 border-8 border-transparent border-t-teal-50 dark:border-t-teal-900/90" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-2 flex items-baseline space-x-3">
              <motion.p 
                key={totalDays}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-teal-900 dark:text-teal-50"
              >
                {totalDays}
              </motion.p>
              {hasChanged && (
                <span className={clsx(
                  'text-sm font-medium',
                  isIncrease ? 'text-teal-600 dark:text-teal-400' : 'text-teal-500 dark:text-teal-500'
                )}>
                  {isIncrease ? '↑' : '↓'} {Math.abs(changeAmount)}
                </span>
              )}
            </div>
          </div>
          <motion.div 
            className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-2 w-full bg-teal-100 dark:bg-teal-900/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-teal-500 dark:bg-teal-400 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ width: `${percentageOfYear}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <motion.p 
              className="font-medium text-teal-600 dark:text-teal-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {percentageOfYear.toFixed(1)}% of the year
            </motion.p>
            {previousPercentage && (
              <p className="text-teal-500/70 dark:text-teal-400/70">
                Previous: {previousPercentage.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 