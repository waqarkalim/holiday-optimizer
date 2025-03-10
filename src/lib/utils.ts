import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PossibleColors } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isProd = () => process.env.NODE_ENV === 'production';

// Utility function to get day type colors
export type DayType = 'pto' | 'publicHoliday' | 'companyDayOff' | 'weekend' | 'extendedWeekend' | 'default';

// Mapping from day types to color schemes
export const dayTypeToColorScheme: Record<DayType, PossibleColors> = {
  pto: 'fuchsia',
  publicHoliday: 'amber',
  companyDayOff: 'violet',
  weekend: 'orange',
  extendedWeekend: 'red',
  default: 'transparent'
};

// Custom utility functions for common Tailwind patterns
export const linkStyles = (variant: 'primary' | 'secondary' | 'ghost') => {
  const baseStyles = "inline-flex items-center transition-colors"
  
  const variantStyles = {
    primary: "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
    secondary: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
    ghost: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
  }
  
  return cn(baseStyles, variantStyles[variant])
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
