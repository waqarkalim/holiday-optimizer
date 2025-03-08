/**
 * StatCard Component
 *
 * Displays a card with a statistic value, label, icon, and optional tooltip.
 * Uses a consistent color scheme system for styling.
 */
import { ReactNode } from 'react';
import { COLOR_SCHEMES } from '@/constants';
import { PossibleColors } from '@/types';
import { StatTooltipContent, Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { InfoIcon as Icon_InfoIcon } from 'lucide-react';

export interface StatCardProps {
  value: number;
  label: string;
  tooltip: string;
  colorScheme: PossibleColors;
  icon: ReactNode;
}

/**
 * Helper function to ensure dynamic color classes are applied correctly
 * by using a lookup approach that forces Tailwind to recognize the classes
 */
const getColorClasses = (colorScheme: PossibleColors, type: 'bg' | 'text' | 'ring') => COLOR_SCHEMES[colorScheme].icon[type];

/**
 * InfoIcon Component
 *
 * Displays an information icon with a tooltip
 */
interface InfoIconProps {
  tooltip: string;
  label: string;
  colorScheme: PossibleColors;
}

const InfoIcon = ({ tooltip, label, colorScheme }: InfoIconProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button aria-label={`Show information about ${label}`} tabIndex={0}>
        <Icon_InfoIcon
          className="h-3.5 w-3.5 cursor-help"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        />
      </button>
    </TooltipTrigger>
    <StatTooltipContent colorScheme={colorScheme}>
      <p className="text-xs">{tooltip}</p>
    </StatTooltipContent>
  </Tooltip>
);

/**
 * IconContainer Component
 *
 * Displays an icon with the appropriate color scheme
 */
interface IconContainerProps {
  icon: ReactNode;
  colorScheme: PossibleColors;
}

const IconContainer = ({ icon, colorScheme }: IconContainerProps) => (
  <div
    className={cn(
      'h-10 w-10 rounded-lg flex items-center justify-center',
      'ring-1',
      getColorClasses(colorScheme, 'bg'),
      getColorClasses(colorScheme, 'text'),
      getColorClasses(colorScheme, 'ring'),
    )}
    role="img"
    aria-hidden="true"
  >
    <div className="p-0.5">{icon}</div>
  </div>
);

/**
 * ValueDisplay Component
 *
 * Displays the statistic value
 */
interface ValueDisplayProps {
  value: number;
  colorScheme: PossibleColors;
}

const ValueDisplay = ({ value, colorScheme }: ValueDisplayProps) => {
  return (
    <div className="flex items-baseline gap-2">
      <p className={cn(
        'text-3xl font-bold tracking-tight leading-none',
        getColorClasses(colorScheme, 'text'),
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
const StatCard = ({ value, label, tooltip, colorScheme, icon }: StatCardProps) => {
  return (
    <article
      className={cn(
        'w-full',
        'rounded-lg p-4',
        'ring-1',
        COLOR_SCHEMES[colorScheme].icon.ring,
        'transition-all duration-200',
        'bg-white dark:bg-gray-800/60',
        'shadow-sm',
      )}
      aria-label={`${label}: ${value}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-3">
        <IconContainer icon={icon} colorScheme={colorScheme} />
        <InfoIcon tooltip={tooltip} label={label} colorScheme={colorScheme} />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <p className={cn(
          'text-sm font-medium',
          getColorClasses(colorScheme, 'text'),
        )}>
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