import { ReactNode, useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

interface StatCardProps {
  icon: ReactNode
  value: number
  label: string
  tooltip: string
  colorScheme: 'blue' | 'violet' | 'amber' | 'emerald'
  previousValue?: number
  animate?: boolean
}

const COLOR_SCHEMES = {
  blue: {
    icon: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-300',
      ring: 'ring-blue-400/20 dark:ring-blue-300/20'
    },
    tooltip: {
      icon: 'text-blue-500/70 dark:text-blue-300/70',
      bg: 'bg-blue-50 dark:bg-blue-900/90'
    },
    card: {
      hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/30',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10'
    },
    value: {
      text: 'text-blue-900 dark:text-blue-50',
      increase: 'text-blue-600',
      decrease: 'text-blue-500'
    }
  },
  violet: {
    icon: {
      bg: 'bg-violet-100 dark:bg-violet-900/50',
      text: 'text-violet-600 dark:text-violet-300',
      ring: 'ring-violet-400/20 dark:ring-violet-300/20'
    },
    tooltip: {
      icon: 'text-violet-500/70 dark:text-violet-300/70',
      bg: 'bg-violet-50 dark:bg-violet-900/90'
    },
    card: {
      hover: 'hover:bg-violet-50/50 dark:hover:bg-violet-900/30',
      ring: 'ring-violet-900/5 dark:ring-violet-300/10'
    },
    value: {
      text: 'text-violet-900 dark:text-violet-50',
      increase: 'text-violet-600',
      decrease: 'text-violet-500'
    }
  },
  amber: {
    icon: {
      bg: 'bg-amber-100 dark:bg-amber-900/50',
      text: 'text-amber-600 dark:text-amber-300',
      ring: 'ring-amber-400/20 dark:ring-amber-300/20'
    },
    tooltip: {
      icon: 'text-amber-500/70 dark:text-amber-300/70',
      bg: 'bg-amber-50 dark:bg-amber-900/90'
    },
    card: {
      hover: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/30',
      ring: 'ring-amber-900/5 dark:ring-amber-300/10'
    },
    value: {
      text: 'text-amber-900 dark:text-amber-50',
      increase: 'text-amber-600',
      decrease: 'text-amber-500'
    }
  },
  emerald: {
    icon: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-300',
      ring: 'ring-emerald-400/20 dark:ring-emerald-300/20'
    },
    tooltip: {
      icon: 'text-emerald-500/70 dark:text-emerald-300/70',
      bg: 'bg-emerald-50 dark:bg-emerald-900/90'
    },
    card: {
      hover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30',
      ring: 'ring-emerald-900/5 dark:ring-emerald-300/10'
    },
    value: {
      text: 'text-emerald-900 dark:text-emerald-50',
      increase: 'text-emerald-600',
      decrease: 'text-emerald-500'
    }
  }
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  tooltip, 
  colorScheme,
  previousValue,
  animate = true 
}: StatCardProps) {
  const colors = COLOR_SCHEMES[colorScheme]
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  // Calculate value change for animation and display
  const hasChanged = previousValue !== undefined && previousValue !== value
  const isIncrease = previousValue !== undefined && value > previousValue
  const changeAmount = previousValue !== undefined ? value - previousValue : 0
  const changePercentage = previousValue ? ((value - previousValue) / previousValue) * 100 : 0

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={clsx(
        'relative w-full bg-white dark:bg-gray-800/60',
        'rounded-2xl p-5',
        'ring-1 transition-colors duration-200 ease-in-out',
        colors.card.ring,
        colors.card.hover
      )}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className={clsx(
            'h-11 w-11 rounded-xl flex items-center justify-center ring-2 transition-shadow',
            colors.icon.bg,
            colors.icon.ring
          )}
          role="img"
          aria-hidden="true"
        >
          <div className={colors.icon.text}>
            {icon}
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full p-1"
            aria-label={`Show information about ${label}`}
            aria-expanded={isTooltipVisible}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            onFocus={() => setIsTooltipVisible(true)}
            onBlur={() => setIsTooltipVisible(false)}
          >
            <svg 
              className={clsx(
                'h-5 w-5 transition-colors',
                colors.tooltip.icon,
                'group-hover:opacity-80'
              )} 
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
                  'absolute right-0 bottom-full mb-2',
                  'w-[220px] px-4 py-3',
                  'text-sm font-medium text-gray-900 dark:text-gray-50',
                  'rounded-xl shadow-lg backdrop-blur-sm',
                  'z-50',
                  colors.tooltip.bg
                )}
                role="tooltip"
              >
                <div className="relative">
                  {tooltip}
                  <div className="absolute right-4 bottom-0 translate-y-full">
                    <div className="w-0 h-0 border-8 border-transparent border-t-current" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={value}
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className={clsx(
          'text-sm font-medium',
          'text-gray-600 dark:text-gray-300'
        )}>
          {label}
        </p>
        <div className="flex items-baseline gap-3">
          <p className={clsx(
            'text-3xl font-bold tracking-tight',
            colors.value.text
          )}>
            {value}
          </p>
          {hasChanged && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={clsx(
                'text-sm font-medium',
                isIncrease ? colors.value.increase : colors.value.decrease
              )}
            >
              {isIncrease ? '↑' : '↓'} {Math.abs(changeAmount)}
              <span className="text-xs ml-1">
                ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
              </span>
            </motion.span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 