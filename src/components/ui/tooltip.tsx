"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { PossibleColors } from "@/types"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Custom tooltip content component for stat cards that takes a color scheme
interface StatTooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  colorScheme: PossibleColors;
}

const StatTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  StatTooltipContentProps
>(({ className, sideOffset = 4, colorScheme, ...props }, ref) => {
  // Create explicit background styles based on color scheme
  const getBgStyle = () => {
    switch (colorScheme) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/90';
      case 'green': return 'bg-green-50 dark:bg-green-900/90';
      case 'amber': return 'bg-amber-50 dark:bg-amber-900/90';
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-900/90';
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/90';
      case 'pink': return 'bg-pink-50 dark:bg-pink-900/90';
      case 'violet': return 'bg-violet-50 dark:bg-violet-900/90';
      case 'teal': return 'bg-teal-50 dark:bg-teal-900/90';
      case 'gray': return 'bg-gray-50 dark:bg-gray-900/90';
      case 'neutral': return 'bg-gray-50 dark:bg-gray-900/90';
      case 'slate': return 'bg-slate-50 dark:bg-slate-900/90';
      case 'zinc': return 'bg-zinc-50 dark:bg-zinc-900/90';
      case 'stone': return 'bg-stone-50 dark:bg-stone-900/90';
      case 'red': return 'bg-red-50 dark:bg-red-900/90';
      case 'orange': return 'bg-orange-50 dark:bg-orange-900/90';
      case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/90';
      case 'lime': return 'bg-lime-50 dark:bg-lime-900/90';
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-900/90';
      case 'sky': return 'bg-sky-50 dark:bg-sky-900/90';
      case 'cyan': return 'bg-cyan-50 dark:bg-cyan-900/90';
      case 'fuchsia': return 'bg-fuchsia-50 dark:bg-fuchsia-900/90';
      case 'rose': return 'bg-rose-50 dark:bg-rose-900/90';
      case 'black': return 'bg-black/5 dark:bg-white/5';
      case 'white': return 'bg-white dark:bg-black';
      case 'current': return 'bg-current bg-opacity-5';
      case 'today': return 'bg-blue-50 dark:bg-blue-900/90';
      case 'past': return 'bg-gray-50 dark:bg-gray-900/90';
      default: return 'bg-gray-50 dark:bg-gray-900/90';
    }
  };

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md",
        "border border-gray-200 dark:border-gray-700",
        "px-3 py-1.5 text-sm",
        "text-gray-900 dark:text-gray-100",
        "shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        getBgStyle(), // Apply background directly
        className
      )}
      {...props}
    />
  )
})
StatTooltipContent.displayName = "StatTooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, StatTooltipContent, TooltipProvider }
