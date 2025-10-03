import {
  Break,
  OptimizationParams,
  OptimizationResult,
  OptimizationStats,
  OptimizationStrategy,
  OptimizedDay,
  WeekdayNumber,
} from '@/types';
import { DEFAULT_WEEKEND_DAYS } from '@/constants';

type StrategyConfig = {
  spacing: number;
  lengthRanges: Array<[number, number]>;
};

const STRATEGY_CONFIG: Record<OptimizationStrategy, StrategyConfig> = {
  balanced: {
    spacing: 21,
    lengthRanges: [
      [3, 4],
      [5, 6],
      [7, 9],
      [10, 15],
    ],
  },
  longWeekends: { spacing: 7, lengthRanges: [[3, 4]] },
  miniBreaks: { spacing: 14, lengthRanges: [[5, 6]] },
  weekLongBreaks: { spacing: 21, lengthRanges: [[7, 9]] },
  extendedVacations: { spacing: 30, lengthRanges: [[10, 15]] },
};

/* -----------------------------
   Helper Functions
----------------------------- */

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const getWeekendDaysSet = (weekendDays?: WeekdayNumber[]): Set<WeekdayNumber> => {
  if (!Array.isArray(weekendDays)) {
    return new Set(DEFAULT_WEEKEND_DAYS);
  }

  const normalized = weekendDays.filter(day => Number.isInteger(day) && day >= 0 && day <= 6);

  if (normalized.length === 0) {
    return new Set(DEFAULT_WEEKEND_DAYS);
  }

  return new Set(normalized as WeekdayNumber[]);
};

const isFixedOff = (day: OptimizedDay): boolean =>
  day.isWeekend || day.isPublicHoliday || day.isCompanyDayOff;

/* -----------------------------
   Calendar Construction
----------------------------- */

const buildCalendar = (params: OptimizationParams): OptimizedDay[] => {
  const targetYear = params.year ?? new Date().getFullYear();
  const now = new Date();
  const startOfYear =
    targetYear === now.getFullYear()
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31);

  const calendar: OptimizedDay[] = [];

  const holidays = params.holidays ?? [];
  const companyDays = params.companyDaysOff ?? [];
  const weekendDays = getWeekendDaysSet(params.weekendDays);

  for (let date = new Date(startOfYear); date <= endOfYear; date = addDays(date, 1)) {
    const iso = formatDate(date);
    const dayOfWeek = date.getDay() as WeekdayNumber;
    const isWeekend = weekendDays.has(dayOfWeek);

    const holiday = holidays.find(h => h.date === iso);
    const companyDay = companyDays.find(dayOff => {
      if (
        dayOff.isRecurring &&
        dayOff.startDate &&
        dayOff.endDate &&
        dayOff.weekday !== undefined
      ) {
        const start = new Date(dayOff.startDate);
        const end = new Date(dayOff.endDate);
        return date >= start && date <= end && date.getDay() === dayOff.weekday;
      }
      return dayOff.date === iso;
    });

    calendar.push({
      date: iso,
      isWeekend,
      isPublicHoliday: Boolean(holiday),
      publicHolidayName: holiday?.name,
      isCompanyDayOff: Boolean(companyDay),
      companyDayName: companyDay?.name,
      isPTO: false,
      isPartOfBreak: false,
    });
  }

  return calendar;
};

/* -----------------------------
   Core Optimizer
----------------------------- */

type Choice = {
  end: number;
  ptoUsed: number;
  nextIndex: number;
};

type MemoEntry = {
  total: number;
  choice: Choice | null;
};

export const optimizeDays = (params: OptimizationParams): OptimizationResult => {
  const strategy: OptimizationStrategy = params.strategy ?? 'balanced';
  const config = STRATEGY_CONFIG[strategy] ?? STRATEGY_CONFIG.balanced;

  const availablePTO = Math.max(0, params.numberOfDays);
  const calendar = buildCalendar(params);
  const totalDays = calendar.length;

  if (totalDays === 0 || availablePTO === 0) {
    const emptyStats: OptimizationStats = {
      totalPTODays: 0,
      totalPublicHolidays: 0,
      totalNormalWeekends: 0,
      totalCompanyDaysOff: 0,
      totalDaysOff: 0,
      totalExtendedWeekends: 0,
    };

    return { days: calendar, breaks: [], stats: emptyStats };
  }

  const workdayPrefix = new Array<number>(totalDays + 1).fill(0);
  for (let i = 0; i < totalDays; i++) {
    workdayPrefix[i + 1] = workdayPrefix[i] + (isFixedOff(calendar[i]) ? 0 : 1);
  }

  const spacing = Math.max(1, config.spacing);
  const maxAllowedLength = Math.max(...config.lengthRanges.map(([, max]) => max));
  const isLengthAllowed = (length: number) =>
    config.lengthRanges.some(([min, max]) => length >= min && length <= max);

  const memo = new Map<string, MemoEntry>();
  const memoKey = (idx: number, ptoLeft: number) => `${idx}-${ptoLeft}`;

  const solve = (idx: number, ptoLeft: number): number => {
    if (idx >= totalDays || ptoLeft <= 0) {
      return 0;
    }

    const key = memoKey(idx, ptoLeft);
    const cached = memo.get(key);
    if (cached) {
      return cached.total;
    }

    const skip = solve(idx + 1, ptoLeft);
    let best = skip;
    let bestChoice: Choice | null = null;

    const maxLengthFromIdx = Math.min(totalDays - idx, maxAllowedLength);

    for (let length = 1; length <= maxLengthFromIdx; length++) {
      const end = idx + length - 1;
      const ptoUsed = workdayPrefix[end + 1] - workdayPrefix[idx];

      if (ptoUsed > ptoLeft) {
        break;
      }

      if (ptoUsed === 0 || !isLengthAllowed(length)) {
        continue;
      }

      const nextIndex = Math.min(totalDays, Math.max(end + 1, end + spacing));
      const candidateTotal = length + solve(nextIndex, ptoLeft - ptoUsed);

      if (candidateTotal > best) {
        best = candidateTotal;
        bestChoice = { end, ptoUsed, nextIndex };
      }
    }

    memo.set(key, { total: best, choice: bestChoice });
    return best;
  };

  solve(0, availablePTO);

  const breaks: Break[] = [];

  const reconstruct = (idx: number, ptoLeft: number) => {
    if (idx >= totalDays || ptoLeft <= 0) {
      return;
    }

    const entry = memo.get(memoKey(idx, ptoLeft));
    if (!entry) {
      return;
    }

    const { choice } = entry;
    if (!choice) {
      reconstruct(idx + 1, ptoLeft);
      return;
    }

    const { end, ptoUsed, nextIndex } = choice;
    const segmentDays = calendar.slice(idx, end + 1);

    segmentDays.forEach(day => {
      day.isPartOfBreak = true;
      day.isPTO = !isFixedOff(day);
    });

    breaks.push({
      startDate: segmentDays[0].date,
      endDate: segmentDays[segmentDays.length - 1].date,
      days: [...segmentDays],
      totalDays: segmentDays.length,
      ptoDays: ptoUsed,
      publicHolidays: segmentDays.filter(day => day.isPublicHoliday).length,
      weekends: segmentDays.filter(day => day.isWeekend).length,
      companyDaysOff: segmentDays.filter(day => day.isCompanyDayOff).length,
    });

    reconstruct(nextIndex, ptoLeft - ptoUsed);
  };

  reconstruct(0, availablePTO);

  breaks.sort((a, b) => a.startDate.localeCompare(b.startDate));

  const sumBreakValues = (selector: (br: Break) => number) =>
    breaks.reduce((total, brk) => total + selector(brk), 0);

  const stats: OptimizationStats = {
    totalPTODays: sumBreakValues(br => br.ptoDays),
    totalPublicHolidays: sumBreakValues(br => br.publicHolidays),
    totalNormalWeekends: sumBreakValues(br => br.weekends),
    totalCompanyDaysOff: sumBreakValues(br => br.companyDaysOff),
    totalDaysOff: sumBreakValues(br => br.totalDays),
    totalExtendedWeekends: sumBreakValues(br => br.ptoDays),
  };

  return {
    days: calendar,
    breaks,
    stats,
  };
};

export const optimizeDaysAsync = (params: OptimizationParams): Promise<OptimizationResult> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(optimizeDays(params));
    }, 0);
  });
};
