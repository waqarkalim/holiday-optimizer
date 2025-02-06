import { StrategyOption } from '@/types';
import { BREAK_LENGTHS } from './services/optimizer.constants';

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
};

export const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;