import { FC, ReactNode } from 'react';
import { COLOR_SCHEMES } from '@/constants';
import { ColorScheme } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, a11y, darkMode } from '@/lib/utils';

export interface StatCardProps {
  value: number;
  label: string;
  tooltip?: string;
  colorScheme?: ColorScheme;
  icon?: ReactNode;
  previousValue?: number;
}

const StatCard: FC<StatCardProps> = (props) => {
  const colorScheme = props.colorScheme === undefined ? 'blue' : props.colorScheme;
  const colors = COLOR_SCHEMES[colorScheme];

  // Calculate value change
  const hasChanged = props.previousValue !== undefined && props.previousValue !== props.value;
  const isIncrease = props.previousValue !== undefined && props.value > props.previousValue;
  const changeAmount = props.previousValue !== undefined ? props.value - props.previousValue : 0;
  const changePercentage = props.previousValue ? ((props.value - props.previousValue) / props.previousValue) * 100 : 0;

  // Custom color mapping for specific stat cards
  const getCustomColors = () => {
    const customColors: Record<ColorScheme, { card: string; icon: string; value: string }> = {
      // Total Days Off (purple)
      purple: {
        card: "bg-purple-50/30 dark:bg-gray-800/60 ring-purple-900/5 dark:ring-purple-300/10",
        icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 ring-purple-400/20 dark:ring-purple-300/20",
        value: "text-purple-900 dark:text-purple-50"
      },
      // CTO Days (green)
      blue: {
        card: "bg-blue-50/30 dark:bg-gray-800/60 ring-blue-900/5 dark:ring-blue-300/10",
        icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 ring-blue-400/20 dark:ring-blue-300/20",
        value: "text-blue-900 dark:text-blue-50"
      },
      // Public Holidays (amber)
      amber: {
        card: "bg-amber-50/30 dark:bg-gray-800/60 ring-amber-900/5 dark:ring-amber-300/10",
        icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 ring-amber-400/20 dark:ring-amber-300/20",
        value: "text-amber-900 dark:text-amber-50"
      },
      // Extended Weekends (teal)
      green: {
        card: "bg-green-50/30 dark:bg-gray-800/60 ring-green-900/5 dark:ring-green-300/10",
        icon: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 ring-green-400/20 dark:ring-green-300/20",
        value: "text-green-900 dark:text-green-50"
      },
      // Company Days Off (violet)
      emerald: {
        card: "bg-emerald-50/30 dark:bg-gray-800/60 ring-emerald-900/5 dark:ring-emerald-300/10",
        icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 ring-emerald-400/20 dark:ring-emerald-300/20",
        value: "text-emerald-900 dark:text-emerald-50"
      },
      // Additional color (pink)
      pink: {
        card: "bg-pink-50/30 dark:bg-gray-800/60 ring-pink-900/5 dark:ring-pink-300/10",
        icon: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 ring-pink-400/20 dark:ring-pink-300/20",
        value: "text-pink-900 dark:text-pink-50"
      },
      // Violet (for Company Days Off)
      violet: {
        card: "bg-violet-50/30 dark:bg-gray-800/60 ring-violet-900/5 dark:ring-violet-300/10",
        icon: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 ring-violet-400/20 dark:ring-violet-300/20",
        value: "text-violet-900 dark:text-violet-50"
      },
      // Teal (for Extended Weekends)
      teal: {
        card: "bg-teal-50/30 dark:bg-gray-800/60 ring-teal-900/5 dark:ring-teal-300/10",
        icon: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 ring-teal-400/20 dark:ring-teal-300/20",
        value: "text-teal-900 dark:text-teal-50"
      }
    };
    
    return customColors[colorScheme];
  };
  
  const customColors = getCustomColors();

  return (
    <div
      className={cn(
        'w-full',
        customColors.card,
        'rounded-lg p-3',
        'ring-1 shadow-sm',
        'transition-all duration-200'
      )}
      role="article"
      aria-label={`${props.label}: ${props.value}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-2.5">
        <div
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            'ring-1',
            customColors.icon
          )}
          role="img"
          aria-hidden="true"
        >
          <div>
            {props.icon}
          </div>
        </div>
        {props.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-full p-0.5',
                  a11y.focus.ring,
                  a11y.focus.ringColors.primary
                )}
                aria-label={`Show information about ${props.label}`}
              >
                <svg
                  className="h-4 w-4 text-gray-500/70 dark:text-gray-400/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{props.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {props.label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className={cn(
            'text-2xl font-bold tracking-tight leading-none',
            customColors.value
          )}>
            {props.value}
          </p>
          {hasChanged && (
            <span
              className={cn(
                'text-xs font-medium',
                isIncrease 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {isIncrease ? '↑' : '↓'} {Math.abs(changeAmount)}
              <span className="text-xs ml-0.5">
                ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;