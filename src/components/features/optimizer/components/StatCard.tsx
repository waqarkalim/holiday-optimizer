import { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  icon: ReactNode
  value: number
  label: string
  tooltip: string
  colorScheme: 'blue' | 'violet' | 'amber'
}

const COLOR_SCHEMES = {
  blue: {
    icon: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-300'
    },
    tooltip: {
      icon: 'text-blue-500/70 dark:text-blue-300/70'
    },
    ring: 'ring-teal-900/5 dark:ring-blue-300/10'
  },
  violet: {
    icon: {
      bg: 'bg-violet-100 dark:bg-violet-900/50',
      text: 'text-violet-600 dark:text-violet-300'
    },
    tooltip: {
      icon: 'text-violet-500/70 dark:text-violet-300/70'
    },
    ring: 'ring-teal-900/5 dark:ring-violet-300/10'
  },
  amber: {
    icon: {
      bg: 'bg-amber-100 dark:bg-amber-900/50',
      text: 'text-amber-600 dark:text-amber-300'
    },
    tooltip: {
      icon: 'text-amber-500/70 dark:text-amber-300/70'
    },
    ring: 'ring-teal-900/5 dark:ring-amber-300/10'
  }
}

export function StatCard({ icon, value, label, tooltip, colorScheme }: StatCardProps) {
  const colors = COLOR_SCHEMES[colorScheme]

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800/60 rounded-xl p-4 ring-1',
      colors.ring
    )}>
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <div className="flex items-center space-x-1 group/tooltip relative">
            <div className={clsx(
              'h-8 w-8 rounded-lg flex items-center justify-center',
              colors.icon.bg
            )}>
              <div className={colors.icon.text}>
                {icon}
              </div>
            </div>
            <svg className={clsx(
              'h-4 w-4',
              colors.tooltip.icon
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute left-0 bottom-full mb-2 px-3 py-2 text-xs font-medium bg-gray-900/95 dark:bg-gray-800 text-white rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
              {tooltip}
              <div className="absolute bottom-0 left-4 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900/95 dark:border-t-gray-800" />
            </div>
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
      </div>
    </div>
  )
} 