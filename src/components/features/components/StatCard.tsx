import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import { COLOR_SCHEMES } from '@/constants';
import { ColorScheme } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  return (
    <div
      className={clsx(
        'w-full bg-white dark:bg-gray-800/60',
        'rounded-2xl p-5',
        'ring-1',
        colors.card.ring,
      )}
      role="article"
      aria-label={`${(props.label)}: ${(props.value)}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={clsx(
            'h-11 w-11 rounded-xl flex items-center justify-center ring-2',
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
        {props.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={clsx(
                  'rounded-full p-1',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                )}
                aria-label={`Show information about ${(props.label)}`}
              >
                <svg
                  className={clsx(
                    'h-5 w-5',
                    colors.tooltip.icon
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{props.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
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
            <span
              className={clsx(
                'text-sm font-medium',
                isIncrease ? colors.value.increase : colors.value.decrease,
              )}
            >
              {isIncrease ? '↑' : '↓'} {Math.abs(changeAmount)}
              <span className="text-xs ml-1">
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