'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { PossibleColors } from '@/types';
import { cn } from '@/lib/utils';
import { COLOR_SCHEMES } from '@/constants';

const TooltipProvider = ({ children, ...props }: TooltipPrimitive.TooltipProviderProps) => (
  <TooltipPrimitive.Provider 
    delayDuration={100} 
    skipDelayDuration={300}
    {...props}
  >
    {children}
  </TooltipPrimitive.Provider>
);

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[9999] max-w-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
        className
      )}
      forceMount
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Custom tooltip content component for stat cards that takes a color scheme
interface StatTooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  colorScheme: PossibleColors;
}

const StatTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  StatTooltipContentProps
>(({ className, sideOffset = 4, colorScheme, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[9999] max-w-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-md border px-2 py-2 shadow-md',
        COLOR_SCHEMES[colorScheme].tooltip.bg,
        className
      )}
      forceMount
      {...props}
    />
  </TooltipPrimitive.Portal>
));
StatTooltipContent.displayName = 'StatTooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, StatTooltipContent, TooltipProvider };
