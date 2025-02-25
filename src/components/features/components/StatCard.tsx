import { FC, ReactNode } from 'react';
import { COLOR_SCHEMES, DAY_TYPE_COLORS } from '@/constants';
import { ColorScheme } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, a11y, darkMode, DayType } from '@/lib/utils';

export interface StatCardProps {
  value: number;
  label: string;
  tooltip?: string;
  colorScheme?: ColorScheme;
  icon?: ReactNode;
  previousValue?: number;
}

// Map color schemes to day types for consistency
const colorSchemeToDayType: Record<ColorScheme, DayType> = {
  blue: 'cto',
  green: 'cto',
  amber: 'publicHoliday',
  emerald: 'companyDayOff',
  violet: 'companyDayOff',
  teal: 'weekend',
  purple: 'default',
  pink: 'default'
};

const StatCard: FC<StatCardProps> = (props) => {
  const colorScheme = props.colorScheme === undefined ? 'blue' : props.colorScheme;

  // Get the corresponding day type for this color scheme
  const dayType = colorSchemeToDayType[colorScheme];

  // Calculate value change
  const hasChanged = props.previousValue !== undefined && props.previousValue !== props.value;
  const isIncrease = props.previousValue !== undefined && props.value > props.previousValue;
  const changeAmount = props.previousValue !== undefined ? props.value - props.previousValue : 0;
  const changePercentage = props.previousValue ? ((props.value - props.previousValue) / props.previousValue) * 100 : 0;

  // Get colors from the centralized system
  const getCardClasses = () => {
    return {
      card: `bg-${colorScheme}-50/30 dark:bg-gray-800/60 ring-${colorScheme}-900/5 dark:ring-${colorScheme}-300/10`,
      icon: cn(
        DAY_TYPE_COLORS[dayType].light.bg,
        DAY_TYPE_COLORS[dayType].dark.bg,
        DAY_TYPE_COLORS[dayType].light.text,
        DAY_TYPE_COLORS[dayType].dark.text,
        `ring-${colorScheme}-400/20 dark:ring-${colorScheme}-300/20`
      ),
      value: `text-${colorScheme}-900 dark:text-${colorScheme}-50`
    };
  };

  const customColors = getCardClasses();

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