'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { PossibleColors } from '@/types';
import { cn } from '@/lib/utils';
import { COLOR_SCHEMES } from '@/constants';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md',
      'border border-gray-200 dark:border-gray-700',
      'bg-white dark:bg-gray-800',
      'px-3 py-1.5 text-sm',
      'text-gray-900 dark:text-gray-100',
      'shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Custom tooltip content component for stat cards that takes a color scheme
interface StatTooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  colorScheme: PossibleColors;
}

const StatTooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  StatTooltipContentProps
>(({ className, sideOffset = 4, colorScheme, ...props }, ref) => {
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md',
        'border border-gray-200 dark:border-gray-700',
        'px-3 py-1.5 text-sm',
        'text-gray-900 dark:text-gray-100',
        'shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        COLOR_SCHEMES[colorScheme].tooltip.bg,
        className,
      )}
      {...props}
    />
  );
});
StatTooltipContent.displayName = 'StatTooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, StatTooltipContent, TooltipProvider };
