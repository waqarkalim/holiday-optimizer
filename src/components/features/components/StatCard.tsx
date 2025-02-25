/**
 * StatCard Component
 *
 * Displays a card with a statistic value, label, icon, and optional tooltip.
 * Uses a consistent color scheme system for styling.
 */
import { ReactNode } from 'react';
import { COLOR_SCHEMES } from '@/constants';
import { ColorScheme } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { a11y, cn } from '@/lib/utils';

export interface StatCardProps {
  value: number;
  label: string;
  tooltip?: string;
  colorScheme?: ColorScheme;
  icon?: ReactNode;
}

/**
 * InfoIcon Component
 *
 * Displays an information icon with a tooltip
 */
interface InfoIconProps {
  tooltip: string;
  label: string;
}

const InfoIcon = ({ tooltip, label }: InfoIconProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        className={cn(
          'rounded-full p-0.5',
          a11y.focus.ring,
          a11y.focus.ringColors.primary,
        )}
        aria-label={`Show information about ${label}`}
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
      <p className="text-xs">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

/**
 * IconContainer Component
 *
 * Displays an icon with the appropriate color scheme
 */
interface IconContainerProps {
  icon: ReactNode;
  colorScheme: ColorScheme;
}

const IconContainer = ({ icon, colorScheme }: IconContainerProps) => (
  <div
    className={cn(
      'h-8 w-8 rounded-lg flex items-center justify-center',
      'ring-1',
      COLOR_SCHEMES[colorScheme].icon.bg,
      COLOR_SCHEMES[colorScheme].icon.text,
      COLOR_SCHEMES[colorScheme].icon.ring,
    )}
    role="img"
    aria-hidden="true"
  >
    <div>{icon}</div>
  </div>
);

/**
 * ValueDisplay Component
 *
 * Displays the statistic value
 */
interface ValueDisplayProps {
  value: number;
  colorScheme: ColorScheme;
}

const ValueDisplay = ({ value, colorScheme }: ValueDisplayProps) => {
  return (
    <div className="flex items-baseline gap-2">
      <p className={cn(
        'text-2xl font-bold tracking-tight leading-none',
        COLOR_SCHEMES[colorScheme].value.text,
      )}>
        {value}
      </p>
    </div>
  );
};

/**
 * StatCard Component
 *
 * Main component that assembles all the sub-components
 */
const StatCard = ({
  value,
  label,
  tooltip,
  colorScheme = 'blue',
  icon,
}: StatCardProps) => {
  return (
    <article
      className={cn(
        'w-full',
        `bg-${colorScheme}-50/30 dark:bg-gray-800/60`,
        `ring-${colorScheme}-900/5 dark:ring-${colorScheme}-300/10`,
        'rounded-lg p-3',
        'ring-1 shadow-sm',
        'transition-all duration-200',
      )}
      aria-label={`${label}: ${value}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-2.5">
        {icon && <IconContainer icon={icon} colorScheme={colorScheme} />}
        {tooltip && <InfoIcon tooltip={tooltip} label={label} />}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}
        </p>
        <ValueDisplay
          value={value}
          colorScheme={colorScheme}
        />
      </div>
    </article>
  );
};

export default StatCard;