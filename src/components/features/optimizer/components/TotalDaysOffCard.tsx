import clsx from 'clsx'

interface TotalDaysOffCardProps {
  totalDays: number
}

export function TotalDaysOffCard({ totalDays }: TotalDaysOffCardProps) {
  const percentageOfYear = (totalDays / 365) * 100

  return (
    <div className="md:col-span-2 bg-white dark:bg-gray-800/60 rounded-xl p-6 ring-1 ring-teal-900/5 dark:ring-teal-300/10 relative overflow-visible">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/20 dark:to-transparent rounded-xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1 group/tooltip relative">
              <p className="text-sm font-medium text-teal-600 dark:text-teal-300">Total Days Off</p>
              <svg className="h-4 w-4 text-teal-500/70 dark:text-teal-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 text-xs font-medium bg-gray-900/95 dark:bg-gray-800 text-white rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Total number of days you'll be off work,<br />including CTO days, public holidays, and weekends
                <div className="absolute bottom-0 left-4 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900/95 dark:border-t-gray-800" />
              </div>
            </div>
            <p className="mt-2 text-4xl font-bold text-teal-900 dark:text-teal-50">{totalDays}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-teal-100 dark:bg-teal-900/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 dark:bg-teal-400 rounded-full" 
            style={{ width: `${percentageOfYear}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-teal-600 dark:text-teal-300">
          {percentageOfYear.toFixed(1)}% of the year
        </p>
      </div>
    </div>
  )
} 