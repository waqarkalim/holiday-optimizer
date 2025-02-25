import { StrategyOption } from '@/types';
import { isProd } from '@/lib/utils';

// Constants for break lengths and scoring
export const BREAK_LENGTHS = {
  // Long weekends: 3-4 days (e.g., Friday-Monday)
  LONG_WEEKEND: {
    MIN: 3,
    MAX: 4,  // Reduced from 5 to ensure true "long weekend" feel
  },
  // Mini breaks: 5-6 days (perfect for short trips)
  MINI_BREAK: {
    MIN: 5,
    MAX: 6,
  },
  // Week-long breaks: 7-9 days (full week plus weekends)
  WEEK_LONG: {
    MIN: 7,
    MAX: 9,
  },
  // Extended breaks: 10-15 days (two weeks including weekends)
  EXTENDED: {
    MIN: 10,
    MAX: 15,
  },
} as const;
export const OPTIMIZATION_STRATEGIES: StrategyOption[] = [
  {
    id: 'balanced',
    label: 'Balanced Mix',
    description: 'A balanced mix of long weekends and longer breaks',
  },
  {
    id: 'longWeekends',
    label: 'Long Weekends',
    description: `Maximize the number of ${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} day weekends`,
  },
  {
    id: 'miniBreaks',
    label: 'Mini Breaks',
    description: `Spread out days into shorter ${BREAK_LENGTHS.MINI_BREAK.MIN}-${BREAK_LENGTHS.MINI_BREAK.MAX} day breaks`,
  },
  {
    id: 'weekLongBreaks',
    label: 'Week-long Breaks',
    description: `Focus on creating ${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} day breaks`,
  },
  {
    id: 'extendedVacations',
    label: 'Extended Vacations',
    description: `Combine days for longer vacations (${BREAK_LENGTHS.EXTENDED.MIN}-${BREAK_LENGTHS.EXTENDED.MAX} days)`,
  },
];

export const COLOR_SCHEMES = {
  blue: {
    icon: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-300',
      ring: 'ring-blue-400/20 dark:ring-blue-300/20',
    },
    tooltip: {
      icon: 'text-blue-500/70 dark:text-blue-300/70',
      bg: 'bg-blue-50 dark:bg-blue-900/90',
    },
    card: {
      hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/30',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
    value: {
      text: 'text-blue-900 dark:text-blue-50',
      increase: 'text-blue-600',
      decrease: 'text-blue-500',
    },
  },
  green: {
    icon: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-600 dark:text-green-300',
      ring: 'ring-green-400/20 dark:ring-green-300/20',
    },
    tooltip: {
      icon: 'text-green-500/70 dark:text-green-300/70',
      bg: 'bg-green-50 dark:bg-green-900/90',
    },
    card: {
      hover: 'hover:bg-green-50/50 dark:hover:bg-green-900/30',
      ring: 'ring-green-900/5 dark:ring-green-300/10',
    },
    value: {
      text: 'text-green-900 dark:text-green-50',
      increase: 'text-green-600',
      decrease: 'text-green-500',
    },
  },
  amber: {
    icon: {
      bg: 'bg-amber-100 dark:bg-amber-900/50',
      text: 'text-amber-600 dark:text-amber-300',
      ring: 'ring-amber-400/20 dark:ring-amber-300/20',
    },
    tooltip: {
      icon: 'text-amber-500/70 dark:text-amber-300/70',
      bg: 'bg-amber-50 dark:bg-amber-900/90',
    },
    card: {
      hover: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/30',
      ring: 'ring-amber-900/5 dark:ring-amber-300/10',
    },
    value: {
      text: 'text-amber-900 dark:text-amber-50',
      increase: 'text-amber-600',
      decrease: 'text-amber-500',
    },
  },
  emerald: {
    icon: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-300',
      ring: 'ring-emerald-400/20 dark:ring-emerald-300/20',
    },
    tooltip: {
      icon: 'text-emerald-500/70 dark:text-emerald-300/70',
      bg: 'bg-emerald-50 dark:bg-emerald-900/90',
    },
    card: {
      hover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30',
      ring: 'ring-emerald-900/5 dark:ring-emerald-300/10',
    },
    value: {
      text: 'text-emerald-900 dark:text-emerald-50',
      increase: 'text-emerald-600',
      decrease: 'text-emerald-500',
    },
  },
  purple: {
    icon: {
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-600 dark:text-purple-300',
      ring: 'ring-purple-400/20 dark:ring-purple-300/20',
    },
    tooltip: {
      icon: 'text-purple-500/70 dark:text-purple-300/70',
      bg: 'bg-purple-50 dark:bg-purple-900/90',
    },
    card: {
      hover: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/30',
      ring: 'ring-purple-900/5 dark:ring-purple-300/10',
    },
    value: {
      text: 'text-purple-900 dark:text-purple-50',
      increase: 'text-purple-600',
      decrease: 'text-purple-500',
    },
  },
  pink: {
    icon: {
      bg: 'bg-pink-100 dark:bg-pink-900/50',
      text: 'text-pink-600 dark:text-pink-300',
      ring: 'ring-pink-400/20 dark:ring-pink-300/20',
    },
    tooltip: {
      icon: 'text-pink-500/70 dark:text-pink-300/70',
      bg: 'bg-pink-50 dark:bg-pink-900/90',
    },
    card: {
      hover: 'hover:bg-pink-50/50 dark:hover:bg-pink-900/30',
      ring: 'ring-pink-900/5 dark:ring-pink-300/10',
    },
    value: {
      text: 'text-pink-900 dark:text-pink-50',
      increase: 'text-pink-600',
      decrease: 'text-pink-500',
    },
  },
  violet: {
    icon: {
      bg: 'bg-violet-100 dark:bg-violet-900/50',
      text: 'text-violet-600 dark:text-violet-300',
      ring: 'ring-violet-400/20 dark:ring-violet-300/20',
    },
    tooltip: {
      icon: 'text-violet-500/70 dark:text-violet-300/70',
      bg: 'bg-violet-50 dark:bg-violet-900/90',
    },
    card: {
      hover: 'hover:bg-violet-50/50 dark:hover:bg-violet-900/30',
      ring: 'ring-violet-900/5 dark:ring-violet-300/10',
    },
    value: {
      text: 'text-violet-900 dark:text-violet-50',
      increase: 'text-violet-600',
      decrease: 'text-violet-500',
    },
  },
  teal: {
    icon: {
      bg: 'bg-teal-100 dark:bg-teal-900/50',
      text: 'text-teal-600 dark:text-teal-300',
      ring: 'ring-teal-400/20 dark:ring-teal-300/20',
    },
    tooltip: {
      icon: 'text-teal-500/70 dark:text-teal-300/70',
      bg: 'bg-teal-50 dark:bg-teal-900/90',
    },
    card: {
      hover: 'hover:bg-teal-50/50 dark:hover:bg-teal-900/30',
      ring: 'ring-teal-900/5 dark:ring-teal-300/10',
    },
    value: {
      text: 'text-teal-900 dark:text-teal-50',
      increase: 'text-teal-600',
      decrease: 'text-teal-500',
    },
  },
};

// Centralized color definitions for day types
export const DAY_TYPE_COLORS = {
  cto: {
    light: {
      bg: 'bg-green-100',
      text: 'text-gray-500',
      icon: 'text-green-500',
      border: 'border-green-200',
    },
    dark: {
      bg: 'bg-green-900/50',
      text: 'text-gray-400',
      icon: 'text-green-400',
      border: 'border-green-700',
    }
  },
  publicHoliday: {
    light: {
      bg: 'bg-amber-100',
      text: 'text-gray-500',
      icon: 'text-amber-500',
      border: 'border-amber-200',
    },
    dark: {
      bg: 'bg-amber-900/50',
      text: 'text-gray-400',
      icon: 'text-amber-400',
      border: 'border-amber-700',
    }
  },
  companyDayOff: {
    light: {
      bg: 'bg-violet-100',
      text: 'text-gray-500',
      icon: 'text-violet-500',
      border: 'border-violet-200',
    },
    dark: {
      bg: 'bg-violet-900/50',
      text: 'text-gray-400',
      icon: 'text-violet-400',
      border: 'border-violet-700',
    }
  },
  weekend: {
    light: {
      bg: 'bg-teal-100',
      text: 'text-gray-500',
      icon: 'text-teal-500',
      border: 'border-teal-200',
    },
    dark: {
      bg: 'bg-teal-900/50',
      text: 'text-gray-400',
      icon: 'text-teal-400',
      border: 'border-teal-700',
    }
  },
  default: {
    light: {
      bg: 'bg-gray-0',
      text: 'text-gray-500',
      icon: 'text-gray-500',
      border: 'border-gray-200',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-gray-400',
      icon: 'text-gray-400',
      border: 'border-gray-700',
    }
  }
};

export const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const PROJECT_NAME = 'Holiday Planner';

export const UMAMI_WEBSITE_ID = isProd() ? '7b755cde-abc3-42cd-a004-d0f012ec1757' : '89a9e611-e052-4f9a-aaea-754e67065d3f';