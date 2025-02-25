/**
 * StatCard Component
 *
 * Displays a card with a statistic value, label, icon, and optional tooltip.
 * Uses a consistent color scheme system for styling.
 */
import { ReactNode } from 'react';
import { COLOR_SCHEMES } from '@/constants';
import { PossibleColors } from '@/types';
import { Tooltip, TooltipTrigger, StatTooltipContent } from '@/components/ui/tooltip';
import { a11y, cn } from '@/lib/utils';

export interface StatCardProps {
  value: number;
  label: string;
  tooltip?: string;
  colorScheme?: PossibleColors;
  icon?: ReactNode;
}

/**
 * Helper function to ensure dynamic color classes are applied correctly 
 * by using a lookup approach that forces Tailwind to recognize the classes
 */
const getColorClasses = (colorScheme: PossibleColors, type: 'bg' | 'text' | 'ring') => {
  const colorMap = {
    // Explicitly define classes for colors that might be purged
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/50',
      text: 'text-orange-600 dark:text-orange-300',
      ring: 'ring-orange-400/20 dark:ring-orange-300/20',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/50',
      text: 'text-indigo-600 dark:text-indigo-300',
      ring: 'ring-indigo-400/20 dark:ring-indigo-300/20',
    },
  };
  
  // Return from explicit map if available, otherwise use COLOR_SCHEMES
  return colorMap[colorScheme as keyof typeof colorMap]?.[type] || 
         COLOR_SCHEMES[colorScheme].icon[type === 'bg' ? 'bg' : type === 'text' ? 'text' : 'ring'];
};

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
          className={cn(
            "h-4 w-4",
            COLOR_SCHEMES[colorScheme].tooltip.icon
          )}
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
      'h-8 w-8 rounded-lg flex items-center justify-center',
      'ring-1',
      getColorClasses(colorScheme, 'bg'),
      getColorClasses(colorScheme, 'text'),
      getColorClasses(colorScheme, 'ring'),
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
  colorScheme: PossibleColors;
}

const ValueDisplay = ({ value, colorScheme }: ValueDisplayProps) => {
  return (
    <div className="flex items-baseline gap-2">
      <p className={cn(
        'text-2xl font-bold tracking-tight leading-none',
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
const StatCard = ({ 
  value, 
  label, 
  tooltip, 
  colorScheme = 'blue', 
  icon,
}: StatCardProps) => {
  // Define card background by directly referencing the styles to ensure Tailwind preserves them
  const getCardBgClass = () => {
    switch (colorScheme) {
      case 'orange': return 'bg-orange-50/30 dark:bg-gray-800/60';
      case 'indigo': return 'bg-indigo-50/30 dark:bg-gray-800/60';
      case 'red': return 'bg-red-50/30 dark:bg-gray-800/60';
      case 'amber': return 'bg-amber-50/30 dark:bg-gray-800/60';
      case 'green': return 'bg-green-50/30 dark:bg-gray-800/60';
      case 'blue': return 'bg-blue-50/30 dark:bg-gray-800/60';
      case 'violet': return 'bg-violet-50/30 dark:bg-gray-800/60';
      // Add other colors as needed
      default: return `bg-${colorScheme}-50/30 dark:bg-gray-800/60`;
    }
  };
  
  const cardBgClass = getCardBgClass();
  
  return (
    <article
      className={cn(
        'w-full',
        cardBgClass,
        COLOR_SCHEMES[colorScheme].card.ring,
        'rounded-lg p-3',
        'ring-1 shadow-sm',
        'transition-all duration-200',
      )}
      aria-label={`${label}: ${value}`}
    >
      {/* Header with icon and tooltip */}
      <div className="flex items-center justify-between mb-2.5">
        {icon && <IconContainer icon={icon} colorScheme={colorScheme} />}
        {tooltip && <InfoIcon tooltip={tooltip} label={label} colorScheme={colorScheme} />}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className={cn(
          "text-xs font-medium",
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