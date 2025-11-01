import { ColorSchemes, StrategyOption, WeekdayNumber } from '@/types';
import { isProd } from '@/shared/lib/utils';

// Constants for break lengths and scoring
export const BREAK_LENGTHS = {
  // Long weekends: 3-4 days (e.g., Friday-Monday)
  LONG_WEEKEND: {
    MIN: 3,
    MAX: 4, // Reduced from 5 to ensure true "long weekend" feel
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
    description: 'A smart blend of short breaks and longer vacations',
  },
  {
    id: 'longWeekends',
    label: 'Long Weekends',
    description: `More ${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} day weekends throughout the year`,
  },
  {
    id: 'miniBreaks',
    label: 'Mini Breaks',
    description: `Several shorter ${BREAK_LENGTHS.MINI_BREAK.MIN}-${BREAK_LENGTHS.MINI_BREAK.MAX} day breaks spread across the year`,
  },
  {
    id: 'weekLongBreaks',
    label: 'Week-long Breaks',
    description: `Focused on ${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} day breaks for more substantial time off`,
  },
  {
    id: 'extendedVacations',
    label: 'Extended Vacations',
    description: `Longer ${BREAK_LENGTHS.EXTENDED.MIN}-${BREAK_LENGTHS.EXTENDED.MAX} day vacations for deeper relaxation`,
  },
];

export const COLOR_SCHEMES: ColorSchemes = {
  blue: {
    icon: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      ring: 'ring-blue-900/5',
    },
    tooltip: {
      icon: 'text-blue-500/70',
      bg: 'bg-blue-50',
    },
    card: {
      hover: 'hover:bg-blue-50/50',
      ring: 'ring-blue-900/5',
    },
    calendar: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      ring: 'ring-blue-900/5',
    },
  },
  green: {
    icon: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      ring: 'ring-green-900/5',
    },
    tooltip: {
      icon: 'text-green-500/70',
      bg: 'bg-green-50',
    },
    card: {
      hover: 'hover:bg-green-50/50',
      ring: 'ring-green-900/5',
    },
    calendar: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      ring: 'ring-green-900/5',
    },
  },
  amber: {
    icon: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      ring: 'ring-amber-900/5',
    },
    tooltip: {
      icon: 'text-amber-500/70',
      bg: 'bg-amber-50',
    },
    card: {
      hover: 'hover:bg-amber-50/50',
      ring: 'ring-amber-900/5',
    },
    calendar: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      ring: 'ring-amber-900/5',
    },
  },
  emerald: {
    icon: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      ring: 'ring-emerald-900/5',
    },
    tooltip: {
      icon: 'text-emerald-500/70',
      bg: 'bg-emerald-50',
    },
    card: {
      hover: 'hover:bg-emerald-50/50',
      ring: 'ring-emerald-900/5',
    },
    calendar: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      ring: 'ring-emerald-900/5',
    },
  },
  purple: {
    icon: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      ring: 'ring-purple-900/5',
    },
    tooltip: {
      icon: 'text-purple-500/70',
      bg: 'bg-purple-50',
    },
    card: {
      hover: 'hover:bg-purple-50/50',
      ring: 'ring-purple-900/5',
    },
    calendar: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      ring: 'ring-purple-900/5',
    },
  },
  pink: {
    icon: {
      bg: 'bg-pink-100',
      text: 'text-pink-600',
      ring: 'ring-pink-900/5',
    },
    tooltip: {
      icon: 'text-pink-500/70',
      bg: 'bg-pink-50',
    },
    card: {
      hover: 'hover:bg-pink-50/50',
      ring: 'ring-pink-900/5',
    },
    calendar: {
      bg: 'bg-pink-100',
      text: 'text-pink-600',
      ring: 'ring-pink-900/5',
    },
  },
  violet: {
    icon: {
      bg: 'bg-violet-100',
      text: 'text-violet-600',
      ring: 'ring-violet-900/5',
    },
    tooltip: {
      icon: 'text-violet-500/70',
      bg: 'bg-violet-50',
    },
    card: {
      hover: 'hover:bg-violet-50/50',
      ring: 'ring-violet-900/5',
    },
    calendar: {
      bg: 'bg-violet-100',
      text: 'text-violet-600',
      ring: 'ring-violet-900/5',
    },
  },
  teal: {
    icon: {
      bg: 'bg-teal-100',
      text: 'text-teal-600',
      ring: 'ring-teal-900/5',
    },
    tooltip: {
      icon: 'text-teal-500/70',
      bg: 'bg-teal-50',
    },
    card: {
      hover: 'hover:bg-teal-50/50',
      ring: 'ring-teal-900/5',
    },
    calendar: {
      bg: 'bg-teal-100',
      text: 'text-teal-600',
      ring: 'ring-teal-900/5',
    },
  },
  gray: {
    icon: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      ring: 'ring-gray-900/5',
    },
    tooltip: {
      icon: 'text-gray-500/70',
      bg: 'bg-gray-50',
    },
    card: {
      hover: 'hover:bg-gray-50/50',
      ring: 'ring-gray-900/5',
    },
    calendar: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      ring: 'ring-gray-900/5',
    },
  },
  neutral: {
    icon: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      ring: 'ring-neutral-900/5',
    },
    tooltip: {
      icon: 'text-gray-500/70',
      bg: 'bg-gray-50',
    },
    card: {
      hover: 'hover:bg-gray-50/50',
      ring: 'ring-neutral-900/5',
    },
    calendar: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      ring: 'ring-neutral-900/5',
    },
  },
  transparent: {
    icon: {
      bg: 'bg-transparent',
      text: 'text-transparent',
      ring: 'ring-transparent',
    },
    tooltip: {
      icon: 'text-transparent',
      bg: 'bg-transparent',
    },
    card: {
      hover: 'hover:bg-transparent',
      ring: 'ring-transparent',
    },
    calendar: {
      bg: 'bg-transparent',
      text: 'text-transparent',
      ring: 'ring-transparent',
    },
  },

  // New color schemes from Tailwind CSS
  slate: {
    icon: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      ring: 'ring-slate-900/5',
    },
    tooltip: {
      icon: 'text-slate-500/70',
      bg: 'bg-slate-50',
    },
    card: {
      hover: 'hover:bg-slate-50/50',
      ring: 'ring-slate-900/5',
    },
    calendar: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      ring: 'ring-slate-900/5',
    },
  },
  zinc: {
    icon: {
      bg: 'bg-zinc-100',
      text: 'text-zinc-600',
      ring: 'ring-zinc-900/5',
    },
    tooltip: {
      icon: 'text-zinc-500/70',
      bg: 'bg-zinc-50',
    },
    card: {
      hover: 'hover:bg-zinc-50/50',
      ring: 'ring-zinc-900/5',
    },
    calendar: {
      bg: 'bg-zinc-100',
      text: 'text-zinc-600',
      ring: 'ring-zinc-900/5',
    },
  },
  stone: {
    icon: {
      bg: 'bg-stone-100',
      text: 'text-stone-600',
      ring: 'ring-stone-900/5',
    },
    tooltip: {
      icon: 'text-stone-500/70',
      bg: 'bg-stone-50',
    },
    card: {
      hover: 'hover:bg-stone-50/50',
      ring: 'ring-stone-900/5',
    },
    calendar: {
      bg: 'bg-stone-100',
      text: 'text-stone-600',
      ring: 'ring-stone-900/5',
    },
  },
  red: {
    icon: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      ring: 'ring-red-900/5',
    },
    tooltip: {
      icon: 'text-red-500/70',
      bg: 'bg-red-50',
    },
    card: {
      hover: 'hover:bg-red-50/50',
      ring: 'ring-red-900/5',
    },
    calendar: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      ring: 'ring-red-900/5',
    },
  },
  orange: {
    icon: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      ring: 'ring-orange-900/5',
    },
    tooltip: {
      icon: 'text-orange-500/70',
      bg: 'bg-orange-50',
    },
    card: {
      hover: 'hover:bg-orange-50/50',
      ring: 'ring-orange-900/5',
    },
    calendar: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      ring: 'ring-orange-900/5',
    },
  },
  yellow: {
    icon: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      ring: 'ring-yellow-900/5',
    },
    tooltip: {
      icon: 'text-yellow-500/70',
      bg: 'bg-yellow-50',
    },
    card: {
      hover: 'hover:bg-yellow-50/50',
      ring: 'ring-yellow-900/5',
    },
    calendar: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      ring: 'ring-yellow-900/5',
    },
  },
  lime: {
    icon: {
      bg: 'bg-lime-100',
      text: 'text-lime-600',
      ring: 'ring-lime-900/5',
    },
    tooltip: {
      icon: 'text-lime-500/70',
      bg: 'bg-lime-50',
    },
    card: {
      hover: 'hover:bg-lime-50/50',
      ring: 'ring-lime-900/5',
    },
    calendar: {
      bg: 'bg-lime-100',
      text: 'text-lime-600',
      ring: 'ring-lime-900/5',
    },
  },
  indigo: {
    icon: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      ring: 'ring-indigo-900/5',
    },
    tooltip: {
      icon: 'text-indigo-500/70',
      bg: 'bg-indigo-50',
    },
    card: {
      hover: 'hover:bg-indigo-50/50',
      ring: 'ring-indigo-900/5',
    },
    calendar: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      ring: 'ring-indigo-900/5',
    },
  },
  sky: {
    icon: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      ring: 'ring-sky-900/5',
    },
    tooltip: {
      icon: 'text-sky-500/70',
      bg: 'bg-sky-50',
    },
    card: {
      hover: 'hover:bg-sky-50/50',
      ring: 'ring-sky-900/5',
    },
    calendar: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      ring: 'ring-sky-900/5',
    },
  },
  cyan: {
    icon: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-600',
      ring: 'ring-cyan-900/5',
    },
    tooltip: {
      icon: 'text-cyan-500/70',
      bg: 'bg-cyan-50',
    },
    card: {
      hover: 'hover:bg-cyan-50/50',
      ring: 'ring-cyan-900/5',
    },
    calendar: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-600',
      ring: 'ring-cyan-900/5',
    },
  },
  fuchsia: {
    icon: {
      bg: 'bg-fuchsia-100',
      text: 'text-fuchsia-600',
      ring: 'ring-fuchsia-900/5',
    },
    tooltip: {
      icon: 'text-fuchsia-500/70',
      bg: 'bg-fuchsia-50',
    },
    card: {
      hover: 'hover:bg-fuchsia-50/50',
      ring: 'ring-fuchsia-900/5',
    },
    calendar: {
      bg: 'bg-fuchsia-100',
      text: 'text-fuchsia-600',
      ring: 'ring-fuchsia-900/5',
    },
  },
  rose: {
    icon: {
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      ring: 'ring-rose-900/5',
    },
    tooltip: {
      icon: 'text-rose-500/70',
      bg: 'bg-rose-50',
    },
    card: {
      hover: 'hover:bg-rose-50/50',
      ring: 'ring-rose-900/5',
    },
    calendar: {
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      ring: 'ring-rose-900/5',
    },
  },
  // Basic colors
  black: {
    icon: {
      bg: 'bg-black/5',
      text: 'text-black',
      ring: 'ring-black/5',
    },
    tooltip: {
      icon: 'text-black/70',
      bg: 'bg-black/5',
    },
    card: {
      hover: 'hover:bg-black/5',
      ring: 'ring-black/5',
    },
    calendar: {
      bg: 'bg-black/10',
      text: 'text-black',
      ring: 'ring-black/5',
    },
  },
  white: {
    icon: {
      bg: 'bg-white',
      text: 'text-gray-800',
      ring: 'ring-gray-200',
    },
    tooltip: {
      icon: 'text-gray-600',
      bg: 'bg-white',
    },
    card: {
      hover: 'hover:bg-gray-50',
      ring: 'ring-gray-200',
    },
    calendar: {
      bg: 'bg-white',
      text: 'text-gray-800',
      ring: 'ring-gray-200',
    },
  },
  // Special colors
  current: {
    icon: {
      bg: 'bg-current bg-opacity-10',
      text: 'text-current',
      ring: 'ring-current/5',
    },
    tooltip: {
      icon: 'text-current text-opacity-70',
      bg: 'bg-current bg-opacity-5',
    },
    card: {
      hover: 'hover:bg-current hover:bg-opacity-5',
      ring: 'ring-current/5',
    },
    calendar: {
      bg: 'bg-current bg-opacity-10',
      text: 'text-current',
      ring: 'ring-current/5',
    },
  },
  today: {
    icon: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      ring: 'ring-blue-900/5',
    },
    tooltip: {
      icon: 'text-blue-500/70',
      bg: 'bg-blue-50',
    },
    card: {
      hover: 'hover:bg-blue-50/50',
      ring: 'ring-blue-900/5',
    },
    calendar: {
      bg: 'bg-blue-50',
      text: 'text-blue-600 font-bold',
      ring: 'ring-blue-900/5',
    },
  },
  past: {
    icon: {
      bg: 'bg-gray-100',
      text: 'text-gray-400',
      ring: 'ring-gray-900/5',
    },
    tooltip: {
      icon: 'text-gray-400/70',
      bg: 'bg-gray-50',
    },
    card: {
      hover: 'hover:bg-gray-50/50',
      ring: 'ring-gray-900/5',
    },
    calendar: {
      bg: 'bg-gray-100',
      text: 'text-gray-400',
      ring: 'ring-gray-300',
    },
  },
};

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const DEFAULT_WEEKEND_DAYS: WeekdayNumber[] = [0, 6];

export const PROJECT_NAME = 'Holiday Optimizer';

export const UMAMI_WEBSITE_ID = isProd()
  ? '7b755cde-abc3-42cd-a004-d0f012ec1757'
  : '89a9e611-e052-4f9a-aaea-754e67065d3f';

export const GITHUB_URL = 'https://github.com/waqarkalim/holiday-optimizer';
