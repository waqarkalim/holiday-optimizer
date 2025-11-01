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
import { parse } from 'date-fns';

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
  day.isWeekend || day.isPublicHoliday || day.isCompanyDayOff || day.isPreBooked === true;

const getRemoteWorkDaysSet = (remoteDays?: WeekdayNumber[]): Set<WeekdayNumber> => {
  if (!Array.isArray(remoteDays)) {
    return new Set();
  }

  const sanitized = remoteDays.filter(day => Number.isInteger(day) && day >= 0 && day <= 6);
  return new Set(sanitized as WeekdayNumber[]);
};

// Check if a day range contains or is adjacent to any pre-booked days
const isNearPreBookedDays = (calendar: OptimizedDay[], start: number, end: number): boolean => {
  // Check if any day in the range is pre-booked
  for (let i = start; i <= end; i++) {
    if (calendar[i]?.isPreBooked) {
      return true;
    }
  }

  // Check if day before range is pre-booked
  if (start > 0 && calendar[start - 1]?.isPreBooked) {
    return true;
  }

  // Check if day after range is pre-booked
  if (end < calendar.length - 1 && calendar[end + 1]?.isPreBooked) {
    return true;
  }

  return false;
};

const countExtendedWeekendGroups = (days: OptimizedDay[]): number => {
  let count = 0;
  let index = 0;

  while (index < days.length) {
    const current = days[index];

    if (!current.isWeekend) {
      index += 1;
      continue;
    }

    const groupStart = index;
    while (index + 1 < days.length && days[index + 1].isWeekend) {
      index += 1;
    }

    const groupEnd = index;
    const beforeGroup = groupStart > 0 ? days[groupStart - 1] : undefined;
    const afterGroup = groupEnd + 1 < days.length ? days[groupEnd + 1] : undefined;
    const touchesBreakday =
      (beforeGroup && !beforeGroup.isWeekend) || (afterGroup && !afterGroup.isWeekend);

    if (touchesBreakday) {
      count += 1;
    }

    index += 1;
  }

  return count;
};

/* -----------------------------
   Calendar Construction
----------------------------- */

const parseDate = (value?: string) => {
  if (!value) return null;
  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildCalendar = (params: OptimizationParams): OptimizedDay[] => {
  const targetYear = params.year ?? new Date().getFullYear();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const defaultStart =
    targetYear === now.getFullYear()
      ? today
      : new Date(targetYear, 0, 1);
  const defaultEnd = new Date(targetYear, 11, 31);

  const calendar: OptimizedDay[] = [];

  const holidays = params.holidays ?? [];
  const companyDays = params.companyDaysOff ?? [];
  const preBookedDays = params.preBookedDays ?? [];
  const weekendDays = getWeekendDaysSet(params.weekendDays);
  const remoteWorkDays = getRemoteWorkDaysSet(params.remoteWorkDays);

  const startOverride = parseDate(params.startDate);
  const endOverride = parseDate(params.endDate);

  let rangeStart = startOverride ?? defaultStart;
  const rangeEnd = endOverride ?? defaultEnd;

  // Forward-looking: If the start date is in the past, adjust it to today
  // But only if the end date is today or in the future (i.e., the range is still relevant)
  if (rangeStart < today && rangeEnd >= today) {
    rangeStart = today;
  }

  if (rangeEnd < rangeStart) {
    return [];
  }

  const startDate = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
  const endDate = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());

  // Create a set of pre-booked dates for O(1) lookup
  const preBookedDatesSet = new Set(preBookedDays.map(day => day.date));

  for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
    const iso = formatDate(date);
    const dayOfWeek = date.getDay() as WeekdayNumber;
    const isWeekend = weekendDays.has(dayOfWeek);
    const isRemoteWorkDay = !isWeekend && remoteWorkDays.has(dayOfWeek);

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

    const isPreBooked = preBookedDatesSet.has(iso);

    calendar.push({
      date: iso,
      isWeekend,
      isPublicHoliday: Boolean(holiday),
      publicHolidayName: holiday?.name,
      isCompanyDayOff: Boolean(companyDay),
      companyDayName: companyDay?.name,
      isPTO: isPreBooked, // Pre-booked days are already PTO
      isPartOfBreak: false,
      isPreBooked: isPreBooked,
      isRemoteWorkDay,
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

  const calendar = buildCalendar(params);
  const totalDays = calendar.length;

  // Use the PTO days as provided - user enters days they want to optimize
  const availablePTO = Math.max(0, params.numberOfDays);

  if (totalDays === 0 || availablePTO === 0) {
    const emptyStats: OptimizationStats = {
      totalPTODays: 0,
      totalPublicHolidays: 0,
      totalNormalWeekends: 0,
      totalCompanyDaysOff: 0,
      totalRemoteWorkDays: 0,
      totalDaysOff: 0,
      totalExtendedWeekends: 0,
    };

    return { days: calendar, breaks: [], stats: emptyStats };
  }

  const workdayPrefix = new Array<number>(totalDays + 1).fill(0);
  for (let i = 0; i < totalDays; i++) {
    const day = calendar[i];
    const isChargeable = !isFixedOff(day) && !day.isRemoteWorkDay;
    workdayPrefix[i + 1] = workdayPrefix[i] + (isChargeable ? 1 : 0);
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

      // Skip this break if it's near any pre-booked days
      if (isNearPreBookedDays(calendar, idx, end)) {
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
      day.isPTO = !isFixedOff(day) && !day.isRemoteWorkDay;
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
      remoteWorkDays: segmentDays.filter(day => day.isRemoteWorkDay).length,
    });

    reconstruct(nextIndex, ptoLeft - ptoUsed);
  };

  reconstruct(0, availablePTO);

  breaks.sort((a, b) => a.startDate.localeCompare(b.startDate));

  const sumBreakValues = (selector: (br: Break) => number) =>
    breaks.reduce((total, brk) => total + selector(brk), 0);
  const extendedWeekendCount = breaks.reduce(
    (total, brk) => total + countExtendedWeekendGroups(brk.days),
    0
  );

  const stats: OptimizationStats = {
    totalPTODays: sumBreakValues(br => br.ptoDays),
    totalPublicHolidays: sumBreakValues(br => br.publicHolidays),
    totalNormalWeekends: sumBreakValues(br => br.weekends),
    totalCompanyDaysOff: sumBreakValues(br => br.companyDaysOff),
    totalRemoteWorkDays: sumBreakValues(br => br.remoteWorkDays),
    totalDaysOff: sumBreakValues(br => br.totalDays - br.remoteWorkDays),
    totalExtendedWeekends: extendedWeekendCount,
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
