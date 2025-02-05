import { FC, ReactNode, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { COLOR_SCHEMES } from '@/constants';
import { ColorScheme } from '@/types';

export interface StatCardProps {
  value: number;
  label: string;
  tooltip?: string;
  colorScheme?: ColorScheme;
  icon?: ReactNode;
  previousValue?: number;
  animate?: boolean;
}

const StatCard: FC<StatCardProps> = (props) => {
  const colorScheme = props.colorScheme === undefined ? 'blue' : props.colorScheme;
  const animate = props.animate === undefined ? true : props.animate;
  const colors = COLOR_SCHEMES[colorScheme];
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Calculate value change for animation and display
  const hasChanged = props.previousValue !== undefined && props.previousValue !== props.value;
  const isIncrease = props.previousValue !== undefined && props.value > props.previousValue;
  const changeAmount = props.previousValue !== undefined ? props.value - props.previousValue : 0;
  const changePercentage = props.previousValue ? ((props.value - props.previousValue) / props.previousValue) * 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={clsx(
        'relative w-full bg-white dark:bg-gray-800/60',
        'rounded-2xl p-5',
        'ring-1 transition-colors duration-200 ease-in-out',
        colors.card.ring,
        colors.card.hover,
      )}
      role="article"
      aria-label={`${(props.label)}: ${(props.value)}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={clsx(
            'h-11 w-11 rounded-xl flex items-center justify-center ring-2 transition-shadow',
            colors.icon.bg,
            colors.icon.ring,
          )}
          role="img"
          aria-hidden="true"
        >
          <div className={colors.icon.text}>
            {props.icon}
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full p-1"
            aria-label={`Show information about ${(props.label)}`}
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
                'group-hover:opacity-80',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  colors.tooltip.bg,
                )}
                role="tooltip"
              >
                <div className="relative">
                  {props.tooltip}
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
        key={props.value}
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className={clsx(
          'text-sm font-medium',
          'text-gray-600 dark:text-gray-300',
        )}>
          {props.label}
        </p>
        <div className="flex items-baseline gap-3">
          <p className={clsx(
            'text-3xl font-bold tracking-tight',
            colors.value.text,
          )}>
            {props.value}
          </p>
          {hasChanged && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={clsx(
                'text-sm font-medium',
                isIncrease ? colors.value.increase : colors.value.decrease,
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
  );
};

export default StatCard;