import { ColorSchemes, StrategyOption } from '@/types';
import { isProd } from '@/shared/lib/utils';

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
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-300',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
    tooltip: {
      icon: 'text-blue-500/70 dark:text-blue-300/70',
      bg: 'bg-blue-50 dark:bg-blue-900/90',
    },
    card: {
      hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/30',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
    calendar: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-300',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
  },
  green: {
    icon: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-600 dark:text-green-300',
      ring: 'ring-green-900/5 dark:ring-green-300/10',
    },
    tooltip: {
      icon: 'text-green-500/70 dark:text-green-300/70',
      bg: 'bg-green-50 dark:bg-green-900/90',
    },
    card: {
      hover: 'hover:bg-green-50/50 dark:hover:bg-green-900/30',
      ring: 'ring-green-900/5 dark:ring-green-300/10',
    },
    calendar: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-600 dark:text-green-300',
      ring: 'ring-green-900/5 dark:ring-green-300/10',
    },
  },
  amber: {
    icon: {
      bg: 'bg-amber-100 dark:bg-amber-900/50',
      text: 'text-amber-600 dark:text-amber-300',
      ring: 'ring-amber-900/5 dark:ring-amber-300/10',
    },
    tooltip: {
      icon: 'text-amber-500/70 dark:text-amber-300/70',
      bg: 'bg-amber-50 dark:bg-amber-900/90',
    },
    card: {
      hover: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/30',
      ring: 'ring-amber-900/5 dark:ring-amber-300/10',
    },
    calendar: {
      bg: 'bg-amber-100 dark:bg-amber-900/50',
      text: 'text-amber-600 dark:text-amber-300',
      ring: 'ring-amber-900/5 dark:ring-amber-300/10',
    },
  },
  emerald: {
    icon: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-300',
      ring: 'ring-emerald-900/5 dark:ring-emerald-300/10',
    },
    tooltip: {
      icon: 'text-emerald-500/70 dark:text-emerald-300/70',
      bg: 'bg-emerald-50 dark:bg-emerald-900/90',
    },
    card: {
      hover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30',
      ring: 'ring-emerald-900/5 dark:ring-emerald-300/10',
    },
    calendar: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-300',
      ring: 'ring-emerald-900/5 dark:ring-emerald-300/10',
    },
  },
  purple: {
    icon: {
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-600 dark:text-purple-300',
      ring: 'ring-purple-900/5 dark:ring-purple-300/10',
    },
    tooltip: {
      icon: 'text-purple-500/70 dark:text-purple-300/70',
      bg: 'bg-purple-50 dark:bg-purple-900/90',
    },
    card: {
      hover: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/30',
      ring: 'ring-purple-900/5 dark:ring-purple-300/10',
    },
    calendar: {
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-600 dark:text-purple-300',
      ring: 'ring-purple-900/5 dark:ring-purple-300/10',
    },
  },
  pink: {
    icon: {
      bg: 'bg-pink-100 dark:bg-pink-900/50',
      text: 'text-pink-600 dark:text-pink-300',
      ring: 'ring-pink-900/5 dark:ring-pink-300/10',
    },
    tooltip: {
      icon: 'text-pink-500/70 dark:text-pink-300/70',
      bg: 'bg-pink-50 dark:bg-pink-900/90',
    },
    card: {
      hover: 'hover:bg-pink-50/50 dark:hover:bg-pink-900/30',
      ring: 'ring-pink-900/5 dark:ring-pink-300/10',
    },
    calendar: {
      bg: 'bg-pink-100 dark:bg-pink-900/50',
      text: 'text-pink-600 dark:text-pink-300',
      ring: 'ring-pink-900/5 dark:ring-pink-300/10',
    },
  },
  violet: {
    icon: {
      bg: 'bg-violet-100 dark:bg-violet-900/50',
      text: 'text-violet-600 dark:text-violet-300',
      ring: 'ring-violet-900/5 dark:ring-violet-300/10',
    },
    tooltip: {
      icon: 'text-violet-500/70 dark:text-violet-300/70',
      bg: 'bg-violet-50 dark:bg-violet-900/90',
    },
    card: {
      hover: 'hover:bg-violet-50/50 dark:hover:bg-violet-900/30',
      ring: 'ring-violet-900/5 dark:ring-violet-300/10',
    },
    calendar: {
      bg: 'bg-violet-100 dark:bg-violet-900/50',
      text: 'text-violet-600 dark:text-violet-300',
      ring: 'ring-violet-900/5 dark:ring-violet-300/10',
    },
  },
  teal: {
    icon: {
      bg: 'bg-teal-100 dark:bg-teal-900/50',
      text: 'text-teal-600 dark:text-teal-300',
      ring: 'ring-teal-900/5 dark:ring-teal-300/10',
    },
    tooltip: {
      icon: 'text-teal-500/70 dark:text-teal-300/70',
      bg: 'bg-teal-50 dark:bg-teal-900/90',
    },
    card: {
      hover: 'hover:bg-teal-50/50 dark:hover:bg-teal-900/30',
      ring: 'ring-teal-900/5 dark:ring-teal-300/10',
    },
    calendar: {
      bg: 'bg-teal-100 dark:bg-teal-900/50',
      text: 'text-teal-600 dark:text-teal-300',
      ring: 'ring-teal-900/5 dark:ring-teal-300/10',
    },
  },
  gray: {
    icon: {
      bg: 'bg-gray-100 dark:bg-gray-900/50',
      text: 'text-gray-600 dark:text-gray-300',
      ring: 'ring-gray-900/5 dark:ring-gray-300/10',
    },
    tooltip: {
      icon: 'text-gray-500/70 dark:text-gray-300/70',
      bg: 'bg-gray-50 dark:bg-gray-900/90',
    },
    card: {
      hover: 'hover:bg-gray-50/50 dark:hover:bg-gray-900/30',
      ring: 'ring-gray-900/5 dark:ring-gray-300/10',
    },
    calendar: {
      bg: 'bg-gray-100 dark:bg-gray-900/50',
      text: 'text-gray-600 dark:text-gray-300',
      ring: 'ring-gray-900/5 dark:ring-gray-300/10',
    },
  },
  neutral: {
    icon: {
      bg: 'bg-gray-100 dark:bg-gray-900/50',
      text: 'text-gray-600 dark:text-gray-300',
      ring: 'ring-neutral-900/5 dark:ring-neutral-300/10',
    },
    tooltip: {
      icon: 'text-gray-500/70 dark:text-gray-300/70',
      bg: 'bg-gray-50 dark:bg-gray-900/90',
    },
    card: {
      hover: 'hover:bg-gray-50/50 dark:hover:bg-gray-900/30',
      ring: 'ring-neutral-900/5 dark:ring-neutral-300/10',
    },
    calendar: {
      bg: 'bg-gray-100 dark:bg-gray-900/50',
      text: 'text-gray-600 dark:text-gray-300',
      ring: 'ring-neutral-900/5 dark:ring-neutral-300/10',
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
      bg: 'bg-slate-100 dark:bg-slate-900/50',
      text: 'text-slate-600 dark:text-slate-300',
      ring: 'ring-slate-900/5 dark:ring-slate-300/10',
    },
    tooltip: {
      icon: 'text-slate-500/70 dark:text-slate-300/70',
      bg: 'bg-slate-50 dark:bg-slate-900/90',
    },
    card: {
      hover: 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30',
      ring: 'ring-slate-900/5 dark:ring-slate-300/10',
    },
    calendar: {
      bg: 'bg-slate-100 dark:bg-slate-900/50',
      text: 'text-slate-600 dark:text-slate-300',
      ring: 'ring-slate-900/5 dark:ring-slate-300/10',
    },
  },
  zinc: {
    icon: {
      bg: 'bg-zinc-100 dark:bg-zinc-900/50',
      text: 'text-zinc-600 dark:text-zinc-300',
      ring: 'ring-zinc-900/5 dark:ring-zinc-300/10',
    },
    tooltip: {
      icon: 'text-zinc-500/70 dark:text-zinc-300/70',
      bg: 'bg-zinc-50 dark:bg-zinc-900/90',
    },
    card: {
      hover: 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30',
      ring: 'ring-zinc-900/5 dark:ring-zinc-300/10',
    },
    calendar: {
      bg: 'bg-zinc-100 dark:bg-zinc-900/50',
      text: 'text-zinc-600 dark:text-zinc-300',
      ring: 'ring-zinc-900/5 dark:ring-zinc-300/10',
    },
  },
  stone: {
    icon: {
      bg: 'bg-stone-100 dark:bg-stone-900/50',
      text: 'text-stone-600 dark:text-stone-300',
      ring: 'ring-stone-900/5 dark:ring-stone-300/10',
    },
    tooltip: {
      icon: 'text-stone-500/70 dark:text-stone-300/70',
      bg: 'bg-stone-50 dark:bg-stone-900/90',
    },
    card: {
      hover: 'hover:bg-stone-50/50 dark:hover:bg-stone-900/30',
      ring: 'ring-stone-900/5 dark:ring-stone-300/10',
    },
    calendar: {
      bg: 'bg-stone-100 dark:bg-stone-900/50',
      text: 'text-stone-600 dark:text-stone-300',
      ring: 'ring-stone-900/5 dark:ring-stone-300/10',
    },
  },
  red: {
    icon: {
      bg: 'bg-red-100 dark:bg-red-900/50',
      text: 'text-red-600 dark:text-red-300',
      ring: 'ring-red-900/5 dark:ring-red-300/10',
    },
    tooltip: {
      icon: 'text-red-500/70 dark:text-red-300/70',
      bg: 'bg-red-50 dark:bg-red-900/90',
    },
    card: {
      hover: 'hover:bg-red-50/50 dark:hover:bg-red-900/30',
      ring: 'ring-red-900/5 dark:ring-red-300/10',
    },
    calendar: {
      bg: 'bg-red-100 dark:bg-red-900/50',
      text: 'text-red-600 dark:text-red-300',
      ring: 'ring-red-900/5 dark:ring-red-300/10',
    },
  },
  orange: {
    icon: {
      bg: 'bg-orange-100 dark:bg-orange-900/50',
      text: 'text-orange-600 dark:text-orange-300',
      ring: 'ring-orange-900/5 dark:ring-orange-300/10',
    },
    tooltip: {
      icon: 'text-orange-500/70 dark:text-orange-300/70',
      bg: 'bg-orange-50 dark:bg-orange-900/90',
    },
    card: {
      hover: 'hover:bg-orange-50/50 dark:hover:bg-orange-900/30',
      ring: 'ring-orange-900/5 dark:ring-orange-300/10',
    },
    calendar: {
      bg: 'bg-orange-100 dark:bg-orange-900/50',
      text: 'text-orange-600 dark:text-orange-300',
      ring: 'ring-orange-900/5 dark:ring-orange-300/10',
    },
  },
  yellow: {
    icon: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/50',
      text: 'text-yellow-600 dark:text-yellow-300',
      ring: 'ring-yellow-900/5 dark:ring-yellow-300/10',
    },
    tooltip: {
      icon: 'text-yellow-500/70 dark:text-yellow-300/70',
      bg: 'bg-yellow-50 dark:bg-yellow-900/90',
    },
    card: {
      hover: 'hover:bg-yellow-50/50 dark:hover:bg-yellow-900/30',
      ring: 'ring-yellow-900/5 dark:ring-yellow-300/10',
    },
    calendar: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/50',
      text: 'text-yellow-600 dark:text-yellow-300',
      ring: 'ring-yellow-900/5 dark:ring-yellow-300/10',
    },
  },
  lime: {
    icon: {
      bg: 'bg-lime-100 dark:bg-lime-900/50',
      text: 'text-lime-600 dark:text-lime-300',
      ring: 'ring-lime-900/5 dark:ring-lime-300/10',
    },
    tooltip: {
      icon: 'text-lime-500/70 dark:text-lime-300/70',
      bg: 'bg-lime-50 dark:bg-lime-900/90',
    },
    card: {
      hover: 'hover:bg-lime-50/50 dark:hover:bg-lime-900/30',
      ring: 'ring-lime-900/5 dark:ring-lime-300/10',
    },
    calendar: {
      bg: 'bg-lime-100 dark:bg-lime-900/50',
      text: 'text-lime-600 dark:text-lime-300',
      ring: 'ring-lime-900/5 dark:ring-lime-300/10',
    },
  },
  indigo: {
    icon: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/50',
      text: 'text-indigo-600 dark:text-indigo-300',
      ring: 'ring-indigo-900/5 dark:ring-indigo-300/10',
    },
    tooltip: {
      icon: 'text-indigo-500/70 dark:text-indigo-300/70',
      bg: 'bg-indigo-50 dark:bg-indigo-900/90',
    },
    card: {
      hover: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30',
      ring: 'ring-indigo-900/5 dark:ring-indigo-300/10',
    },
    calendar: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/50',
      text: 'text-indigo-600 dark:text-indigo-300',
      ring: 'ring-indigo-900/5 dark:ring-indigo-300/10',
    },
  },
  sky: {
    icon: {
      bg: 'bg-sky-100 dark:bg-sky-900/50',
      text: 'text-sky-600 dark:text-sky-300',
      ring: 'ring-sky-900/5 dark:ring-sky-300/10',
    },
    tooltip: {
      icon: 'text-sky-500/70 dark:text-sky-300/70',
      bg: 'bg-sky-50 dark:bg-sky-900/90',
    },
    card: {
      hover: 'hover:bg-sky-50/50 dark:hover:bg-sky-900/30',
      ring: 'ring-sky-900/5 dark:ring-sky-300/10',
    },
    calendar: {
      bg: 'bg-sky-100 dark:bg-sky-900/50',
      text: 'text-sky-600 dark:text-sky-300',
      ring: 'ring-sky-900/5 dark:ring-sky-300/10',
    },
  },
  cyan: {
    icon: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/50',
      text: 'text-cyan-600 dark:text-cyan-300',
      ring: 'ring-cyan-900/5 dark:ring-cyan-300/10',
    },
    tooltip: {
      icon: 'text-cyan-500/70 dark:text-cyan-300/70',
      bg: 'bg-cyan-50 dark:bg-cyan-900/90',
    },
    card: {
      hover: 'hover:bg-cyan-50/50 dark:hover:bg-cyan-900/30',
      ring: 'ring-cyan-900/5 dark:ring-cyan-300/10',
    },
    calendar: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/50',
      text: 'text-cyan-600 dark:text-cyan-300',
      ring: 'ring-cyan-900/5 dark:ring-cyan-300/10',
    },
  },
  fuchsia: {
    icon: {
      bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
      text: 'text-fuchsia-600 dark:text-fuchsia-300',
      ring: 'ring-fuchsia-900/5 dark:ring-fuchsia-300/10',
    },
    tooltip: {
      icon: 'text-fuchsia-500/70 dark:text-fuchsia-300/70',
      bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/90',
    },
    card: {
      hover: 'hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/30',
      ring: 'ring-fuchsia-900/5 dark:ring-fuchsia-300/10',
    },
    calendar: {
      bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
      text: 'text-fuchsia-600 dark:text-fuchsia-300',
      ring: 'ring-fuchsia-900/5 dark:ring-fuchsia-300/10',
    },
  },
  rose: {
    icon: {
      bg: 'bg-rose-100 dark:bg-rose-900/50',
      text: 'text-rose-600 dark:text-rose-300',
      ring: 'ring-rose-900/5 dark:ring-rose-300/10',
    },
    tooltip: {
      icon: 'text-rose-500/70 dark:text-rose-300/70',
      bg: 'bg-rose-50 dark:bg-rose-900/90',
    },
    card: {
      hover: 'hover:bg-rose-50/50 dark:hover:bg-rose-900/30',
      ring: 'ring-rose-900/5 dark:ring-rose-300/10',
    },
    calendar: {
      bg: 'bg-rose-100 dark:bg-rose-900/50',
      text: 'text-rose-600 dark:text-rose-300',
      ring: 'ring-rose-900/5 dark:ring-rose-300/10',
    },
  },
  // Basic colors
  black: {
    icon: {
      bg: 'bg-black/5 dark:bg-white/10',
      text: 'text-black dark:text-white',
      ring: 'ring-black/5 dark:ring-white/10',
    },
    tooltip: {
      icon: 'text-black/70 dark:text-white/70',
      bg: 'bg-black/5 dark:bg-white/5',
    },
    card: {
      hover: 'hover:bg-black/5 dark:hover:bg-white/5',
      ring: 'ring-black/5 dark:ring-white/10',
    },
    calendar: {
      bg: 'bg-black/10 dark:bg-white/10',
      text: 'text-black dark:text-white',
      ring: 'ring-black/5 dark:ring-white/10',
    },
  },
  white: {
    icon: {
      bg: 'bg-white dark:bg-black',
      text: 'text-gray-800 dark:text-gray-200',
      ring: 'ring-gray-200 dark:ring-gray-700',
    },
    tooltip: {
      icon: 'text-gray-600 dark:text-gray-300',
      bg: 'bg-white dark:bg-black',
    },
    card: {
      hover: 'hover:bg-gray-50 dark:hover:bg-gray-900',
      ring: 'ring-gray-200 dark:ring-gray-700',
    },
    calendar: {
      bg: 'bg-white dark:bg-black',
      text: 'text-gray-800 dark:text-gray-200',
      ring: 'ring-gray-200 dark:ring-gray-700',
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
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-300',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
    tooltip: {
      icon: 'text-blue-500/70 dark:text-blue-300/70',
      bg: 'bg-blue-50 dark:bg-blue-900/90',
    },
    card: {
      hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/30',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
    calendar: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-300 font-bold',
      ring: 'ring-blue-900/5 dark:ring-blue-300/10',
    },
  },
  past: {
    icon: {
      bg: 'bg-gray-100 dark:bg-gray-900/50',
      text: 'text-gray-400 dark:text-gray-500',
      ring: 'ring-gray-900/5 dark:ring-gray-300/10',
    },
    tooltip: {
      icon: 'text-gray-400/70 dark:text-gray-500/70',
      bg: 'bg-gray-50 dark:bg-gray-900/90',
    },
    card: {
      hover: 'hover:bg-gray-50/50 dark:hover:bg-gray-900/30',
      ring: 'ring-gray-900/5 dark:ring-gray-300/10',
    },
    calendar: {
      bg: 'bg-gray-100 dark:bg-gray-800/30',
      text: 'text-gray-400 dark:text-gray-500',
      ring: 'ring-gray-300 dark:ring-gray-600',
    },
  },
};

export const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const PROJECT_NAME = 'Holiday Optimizer';

export const UMAMI_WEBSITE_ID = isProd() ? '7b755cde-abc3-42cd-a004-d0f012ec1757' : '89a9e611-e052-4f9a-aaea-754e67065d3f';

export const GITHUB_URL = "https://github.com/waqarkalim/holiday-optimizer"