import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PossibleColors } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isProd = () => process.env.NODE_ENV === 'production';

// Utility function to get day type colors
export type DayType = 'cto' | 'publicHoliday' | 'companyDayOff' | 'weekend' | 'default';

// Mapping from day types to color schemes
export const dayTypeToColorScheme: Record<DayType, PossibleColors> = {
  cto: 'gray',
  publicHoliday: 'amber',
  companyDayOff: 'violet',
  weekend: 'orange',
  default: 'transparent'
};

// Custom utility functions for common Tailwind patterns
export const linkStyles = (variant?: 'primary' | 'secondary' | 'ghost') => {
  const baseStyles = "inline-flex items-center transition-colors"
  
  const variantStyles = {
    primary: "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
    secondary: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
    ghost: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
  }
  
  return cn(baseStyles, variant ? variantStyles[variant] : variantStyles.primary)
}

export const containerStyles = "mx-auto max-w-7xl px-3 sm:px-4 lg:px-6"

// Text size utilities with responsive variants
export const textSize = (variant: 'heading' | 'subheading' | 'body' | 'small' | 'tiny') => {
  const variants = {
    heading: "text-xl sm:text-2xl md:text-3xl font-bold",
    subheading: "text-lg sm:text-xl font-semibold",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm",
    tiny: "text-xs"
  }
  
  return variants[variant]
}

// Spacing utilities
export const spacing = {
  section: "py-6 sm:py-8 md:py-12",
  container: "px-3 sm:px-4 lg:px-6",
  stack: "space-y-4 sm:space-y-6",
  inline: "space-x-2 sm:space-x-4"
}

// Accessibility utilities
export const a11y = {
  // Focus styles
  focus: {
    // Standard focus ring
    ring: "focus:outline-none focus:ring-2 focus:ring-offset-2",
    // Focus ring colors
    ringColors: {
      primary: "focus:ring-blue-500 dark:focus:ring-blue-400",
      secondary: "focus:ring-violet-500 dark:focus:ring-violet-400",
      neutral: "focus:ring-gray-500 dark:focus:ring-gray-400",
      destructive: "focus:ring-red-500 dark:focus:ring-red-400"
    },
    // Within container focus
    within: "focus-within:ring-2 focus-within:ring-offset-2",
    // Visible only on focus (for skip links, etc.)
    visible: "sr-only focus:not-sr-only focus:absolute focus:z-50"
  },
  
  // Screen reader only content
  srOnly: "sr-only",
  notSrOnly: "not-sr-only",
  
  // Interactive elements
  interactive: {
    // Make non-interactive elements keyboard accessible
    keyboard: "cursor-pointer focus:outline-none tabindex-0",
    // Disable pointer events but keep accessible
    disabled: "pointer-events-none opacity-50",
    // Visually hidden but accessible
    hidden: "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
  },
  
  // Reduced motion preferences
  motion: {
    // Respect reduced motion preferences
    safe: "motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none",
    // Only animate when reduced motion is not preferred
    reduced: "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none"
  },
  
  // Contrast and color adjustments
  contrast: {
    // High contrast mode adjustments
    high: "contrast-more:border-gray-900 contrast-more:text-gray-900 dark:contrast-more:border-gray-50 dark:contrast-more:text-gray-50",
    // Ensure text is readable on various backgrounds
    text: "contrast-more:font-bold contrast-more:text-current"
  }
} 