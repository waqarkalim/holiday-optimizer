import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DAY_TYPE_COLORS } from "@/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isProd = () => process.env.NODE_ENV === 'production';

// Utility function to get day type colors
export type DayType = 'cto' | 'publicHoliday' | 'companyDayOff' | 'weekend' | 'default';
export type ColorType = 'bg' | 'text' | 'icon' | 'border';

export const getDayTypeColor = (
  dayType: DayType, 
  colorType: ColorType, 
  isDark: boolean = false
): string => {
  const mode = isDark ? 'dark' : 'light';
  return DAY_TYPE_COLORS[dayType][mode][colorType];
};

// Function to get both light and dark mode colors for a day type
export const getDayTypeClasses = (
  dayType: DayType, 
  colorType: ColorType
): string => {
  const lightClass = DAY_TYPE_COLORS[dayType].light[colorType];
  const darkClass = DAY_TYPE_COLORS[dayType].dark[colorType];
  return `${lightClass} dark:${darkClass}`;
};

// Custom utility functions for common Tailwind patterns
export const cardStyles = (variant?: 'primary' | 'secondary' | 'neutral') => {
  const baseStyles = "rounded-lg p-3 ring-1 shadow-sm"
  
  const variantStyles = {
    primary: "bg-teal-50/30 dark:bg-gray-800/60 ring-teal-900/5 dark:ring-teal-300/10",
    secondary: "bg-violet-50/30 dark:bg-gray-800/60 ring-violet-900/5 dark:ring-violet-300/10",
    neutral: "bg-white/90 dark:bg-gray-800/60 ring-blue-900/5 dark:ring-blue-400/5"
  }
  
  return cn(baseStyles, variant ? variantStyles[variant] : variantStyles.neutral)
}

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

// Responsive design utilities
export const responsiveGrid = (columns: {
  default?: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string,
  '2xl'?: string
}) => {
  const baseGrid = "grid gap-4 w-full"
  
  const breakpoints = {
    default: columns.default || "grid-cols-1",
    sm: columns.sm ? `sm:${columns.sm}` : "",
    md: columns.md ? `md:${columns.md}` : "",
    lg: columns.lg ? `lg:${columns.lg}` : "",
    xl: columns.xl ? `xl:${columns.xl}` : "",
    '2xl': columns['2xl'] ? `2xl:${columns['2xl']}` : ""
  }
  
  return cn(
    baseGrid,
    breakpoints.default,
    breakpoints.sm,
    breakpoints.md,
    breakpoints.lg,
    breakpoints.xl,
    breakpoints['2xl']
  )
}

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

// Group interaction utilities
export const groupInteraction = {
  // Container classes
  container: "group",
  
  // Item classes for different states
  item: {
    // Hover states
    hover: {
      opacity: "opacity-80 group-hover:opacity-100",
      scale: "scale-100 group-hover:scale-105",
      color: {
        primary: "text-blue-500/70 group-hover:text-blue-500 dark:text-blue-400/70 dark:group-hover:text-blue-400",
        secondary: "text-violet-500/70 group-hover:text-violet-500 dark:text-violet-400/70 dark:group-hover:text-violet-400",
        neutral: "text-gray-500/70 group-hover:text-gray-700 dark:text-gray-400/70 dark:group-hover:text-gray-300"
      },
      bg: {
        primary: "bg-blue-50/50 group-hover:bg-blue-50 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50",
        secondary: "bg-violet-50/50 group-hover:bg-violet-50 dark:bg-violet-900/30 dark:group-hover:bg-violet-900/50",
        neutral: "bg-gray-50/50 group-hover:bg-gray-100 dark:bg-gray-800/30 dark:group-hover:bg-gray-800/50"
      }
    },
    
    // Focus states
    focus: {
      ring: "focus-within:ring-2 focus-within:ring-offset-2",
      ringColor: {
        primary: "focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50",
        secondary: "focus-within:ring-violet-500/50 dark:focus-within:ring-violet-400/50",
        neutral: "focus-within:ring-gray-500/50 dark:focus-within:ring-gray-400/50"
      }
    }
  }
}

// Dark mode utilities
export const darkMode = {
  // Text colors
  text: {
    primary: "text-gray-900 dark:text-gray-100",
    secondary: "text-gray-700 dark:text-gray-300",
    muted: "text-gray-500 dark:text-gray-400",
    accent: {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      red: "text-red-600 dark:text-red-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      purple: "text-purple-600 dark:text-purple-400",
      teal: "text-teal-600 dark:text-teal-400",
      violet: "text-violet-600 dark:text-violet-400"
    }
  },
  
  // Background colors
  bg: {
    primary: "bg-white dark:bg-gray-900",
    secondary: "bg-gray-50 dark:bg-gray-800",
    muted: "bg-gray-100 dark:bg-gray-800/60",
    accent: {
      blue: "bg-blue-50 dark:bg-blue-900/30",
      green: "bg-green-50 dark:bg-green-900/30",
      red: "bg-red-50 dark:bg-red-900/30",
      yellow: "bg-yellow-50 dark:bg-yellow-900/30",
      purple: "bg-purple-50 dark:bg-purple-900/30",
      teal: "bg-teal-50 dark:bg-teal-900/30",
      violet: "bg-violet-50 dark:bg-violet-900/30"
    }
  },
  
  // Border colors
  border: {
    primary: "border-gray-200 dark:border-gray-700",
    secondary: "border-gray-100 dark:border-gray-800",
    muted: "border-gray-200/60 dark:border-gray-700/30",
    accent: {
      blue: "border-blue-200 dark:border-blue-700",
      green: "border-green-200 dark:border-green-700",
      red: "border-red-200 dark:border-red-700",
      yellow: "border-yellow-200 dark:border-yellow-700",
      purple: "border-purple-200 dark:border-purple-700",
      teal: "border-teal-200 dark:border-teal-700",
      violet: "border-violet-200 dark:border-violet-700"
    }
  },
  
  // Ring colors
  ring: {
    primary: "ring-gray-200 dark:ring-gray-700",
    secondary: "ring-gray-100 dark:ring-gray-800",
    muted: "ring-gray-200/60 dark:ring-gray-700/30",
    accent: {
      blue: "ring-blue-500/50 dark:ring-blue-400/50",
      green: "ring-green-500/50 dark:ring-green-400/50",
      red: "ring-red-500/50 dark:ring-red-400/50",
      yellow: "ring-yellow-500/50 dark:ring-yellow-400/50",
      purple: "ring-purple-500/50 dark:ring-purple-400/50",
      teal: "ring-teal-500/50 dark:ring-teal-400/50",
      violet: "ring-violet-500/50 dark:ring-violet-400/50"
    }
  }
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