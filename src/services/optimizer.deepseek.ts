import {
  eachDayOfInterval,
  endOfYear,
  formatISO,
  getDay,
  isSameDay,
  isSaturday,
  isSunday,
  isWeekend,
  parseISO,
  startOfYear,
} from 'date-fns';
import {
  BALANCED_DISTRIBUTION,
  BALANCED_STRATEGY,
  BREAK_LENGTHS,
  BREAK_THRESHOLDS,
  DISTRIBUTION_WEIGHTS,
  EFFICIENCY_SCORING,
  POSITION_BONUSES,
  SCORING_MULTIPLIERS,
  SEASONAL_WEIGHTS,
  SPACING_REQUIREMENTS,
} from './optimizer.constants';
import { Break, CustomDayOff, OptimizationParams, OptimizationResult, OptimizationStats, OptimizedDay } from '@/types';

const DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

const MONTHS = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
} as const;

// Internal interfaces (not exported)
interface Holiday {
  date: Date;
  name: string;
}

interface DayInfo {
  date: Date;
  dateStr: string;
  isWeekend: boolean;
  isPublicHoliday: boolean;
  publicHolidayName?: string;
  isCTO: boolean;
  isPartOfBreak: boolean;
  isCustomDayOff: boolean;
  customDayName?: string;
}

interface BreakCandidate {
  type: 'extension' | 'bridge' | 'standalone';
  days: number[];
  ctoDaysUsed: number;
  efficiency: number;
  length: number;
}

interface BreakPeriod {
  start: number;
  end: number;
  days?: number[];
}

interface BreakDistribution {
  longWeekends: number;
  miniBreaks: number;
  weekLongBreaks: number;
  extendedBreaks: number;
}

function getBreakLength(allDates: DayInfo[], index: number): number {
  let length = 1;
  let start = index;
  let end = index;

  // Look backwards
  while (start > 0 && allDates[start - 1].isPartOfBreak) {
    start--;
    length++;
  }

  // Look forwards
  while (end < allDates.length - 1 && allDates[end + 1].isPartOfBreak) {
    end++;
    length++;
  }

  return length;
}

function updateBreakStatus(allDates: DayInfo[], index: number): void {
  const day = allDates[index];
  if (!day.isCTO && !day.isPublicHoliday && !day.isWeekend) {
    day.isPartOfBreak = false;

    // Check if this breaks a continuous break
    let start = index;
    let end = index;

    // Find break boundaries
    while (start > 0 && allDates[start - 1].isPartOfBreak) start--;
    while (end < allDates.length - 1 && allDates[end + 1].isPartOfBreak) end++;

    // If this day was in the middle, we need to check both sides
    if (start < index && end > index) {
      validateBreakContinuity(allDates, start, index - 1);
      validateBreakContinuity(allDates, index + 1, end);
    }
  }
}

function validateBreakContinuity(allDates: DayInfo[], start: number, end: number): void {
  for (let i = start; i <= end; i++) {
    const day = allDates[i];
    if (!day.isCTO && !day.isPublicHoliday && !day.isWeekend) {
      day.isPartOfBreak = false;
    }
  }
}

function findOptimalCTOPositions(allDates: DayInfo[]): number[] {
  const candidates: Array<{ index: number; score: number }> = [];

  for (let i = 0; i < allDates.length; i++) {
    const day = allDates[i];
    if (!day.isCTO && !day.isPublicHoliday && !day.isWeekend) {
      const score = calculatePositionScore(allDates, i);
      if (score > 0) {
        candidates.push({ index: i, score });
      }
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .map(c => c.index);
}

function calculatePositionScore(allDates: DayInfo[], index: number): number {
  let score = 1;

  // Check adjacent days
  const prevDay = index > 0 ? allDates[index - 1] : null;
  const nextDay = index < allDates.length - 1 ? allDates[index + 1] : null;

  // Bonus for connecting to existing breaks
  if (prevDay?.isPartOfBreak) score *= EFFICIENCY_SCORING.WEEKEND_BONUS;
  if (nextDay?.isPartOfBreak) score *= EFFICIENCY_SCORING.WEEKEND_BONUS;

  // Bonus for specific day combinations
  const dayOfWeek = allDates[index].date.getDay();
  if (dayOfWeek === DAYS.MONDAY || dayOfWeek === DAYS.FRIDAY) {
    score *= POSITION_BONUSES.MONDAY_FRIDAY;
  } else if (dayOfWeek === DAYS.THURSDAY && nextDay?.isPartOfBreak) {
    score *= POSITION_BONUSES.THURSDAY_FRIDAY;
  } else if (dayOfWeek === DAYS.MONDAY && prevDay?.isPartOfBreak) {
    score *= POSITION_BONUSES.MONDAY_TUESDAY;
  }

  // Bonus for being near holidays
  const nearbyHolidays = countNearbyHolidays(allDates, index, POSITION_BONUSES.NEAR_HOLIDAY_RANGE);
  if (nearbyHolidays > 0) {
    score *= EFFICIENCY_SCORING.HOLIDAY_BONUS;
  }

  // Penalty for consecutive CTO days
  const consecutiveCTODays = countConsecutiveCTODays(allDates, index);
  if (consecutiveCTODays > 2) {
    score *= Math.pow(EFFICIENCY_SCORING.CONSECUTIVE_PENALTY, consecutiveCTODays - 2);
  }

  return score;
}

function countNearbyHolidays(allDates: DayInfo[], index: number, range: number): number {
  let count = 0;
  const start = Math.max(0, index - range);
  const end = Math.min(allDates.length - 1, index + range);

  for (let i = start; i <= end; i++) {
    if (allDates[i].isPublicHoliday) count++;
  }

  return count;
}

function countConsecutiveCTODays(allDates: DayInfo[], index: number): number {
  let count = 1;
  let currentIndex = index - 1;

  // Count backwards
  while (currentIndex >= 0 && allDates[currentIndex].isCTO) {
    count++;
    currentIndex--;
  }

  // Count forwards
  currentIndex = index + 1;
  while (currentIndex < allDates.length && allDates[currentIndex].isCTO) {
    count++;
    currentIndex++;
  }

  return count;
}

function splitDiscontinuousBreak(allDates: DayInfo[], breakPeriod: Break): void {
  const breakDays = breakPeriod.days;
  let currentBreakStart = 0;

  for (let i = 1; i < breakDays.length; i++) {
    const prevDate = parseISO(breakDays[i - 1].date);
    const currDate = parseISO(breakDays[i].date);
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff > 1) {
      // End current break
      const currentBreakDays = breakDays.slice(currentBreakStart, i);
      updateBreakDays(allDates, currentBreakDays);

      // Start new break
      currentBreakStart = i;
    }
  }

  // Handle last break segment
  if (currentBreakStart < breakDays.length) {
    const lastBreakDays = breakDays.slice(currentBreakStart);
    updateBreakDays(allDates, lastBreakDays);
  }
}

function updateBreakDays(allDates: DayInfo[], breakDays: OptimizedDay[]): void {
  breakDays.forEach(breakDay => {
    const date = parseISO(breakDay.date);
    const dayIndex = allDates.findIndex(d => isSameDay(d.date, date));
    if (dayIndex !== -1) {
      allDates[dayIndex].isPartOfBreak = true;
    }
  });
}

function fixWeekendPairIntegrity(allDates: DayInfo[], saturdayIndex: number): void {
  const saturday = allDates[saturdayIndex];
  const sunday = allDates[saturdayIndex + 1];

  // If either day is part of a break, make both part of the break
  if (saturday.isPartOfBreak || sunday.isPartOfBreak) {
    saturday.isPartOfBreak = true;
    sunday.isPartOfBreak = true;
  } else {
    saturday.isPartOfBreak = false;
    sunday.isPartOfBreak = false;
  }
}

function expandCustomDaysOff(customDaysOff: Array<CustomDayOff>, year: number): Array<{ date: Date, name: string }> {
  const expandedDays: Array<{ date: Date, name: string }> = [];

  customDaysOff.forEach(customDay => {
    if (customDay.isRecurring && customDay.startDate && customDay.endDate && customDay.weekday !== undefined) {
      // For recurring days, find all matching weekdays in the date range
      const start = parseISO(customDay.startDate);
      const end = parseISO(customDay.endDate);

      // Get all days in the interval
      const daysInRange = eachDayOfInterval({ start, end });

      // Filter for matching weekdays
      daysInRange.forEach(date => {
        if (getDay(date) === customDay.weekday) {
          expandedDays.push({
            date,
            name: customDay.name,
          });
        }
      });
    } else {
      // For non-recurring days, just add the single date
      expandedDays.push({
        date: parseISO(customDay.date),
        name: customDay.name,
      });
    }
  });

  return expandedDays;
}

function optimizeCTODays({
                           numberOfDays,
                           strategy = 'balanced',
                           year = new Date().getFullYear(),
                           holidays = [],
                           customDaysOff = [],
                         }: OptimizationParams): OptimizationResult {
  // Preprocess all dates for the year
  const startDate = startOfYear(new Date(year, 0));
  const endDate = endOfYear(new Date(year, 0));
  const allDates: DayInfo[] = eachDayOfInterval({ start: startDate, end: endDate }).map(d => ({
    date: d,
    dateStr: formatISO(d, { representation: 'date' }),
    isWeekend: isWeekend(d),
    isPublicHoliday: false,
    publicHolidayName: undefined,
    isCTO: false,
    isPartOfBreak: false,
    isCustomDayOff: false,
    customDayName: undefined,
  }));

  // Mark public holidays
  const PUBLIC_HOLIDAYS: Holiday[] = [
    { date: parseISO(`${year}-01-01`), name: 'New Year\'s Day' },
    { date: parseISO(`${year}-02-17`), name: 'Family Day' },
    { date: parseISO(`${year}-04-18`), name: 'Good Friday' },
    { date: parseISO(`${year}-05-19`), name: 'Victoria Day' },
    { date: parseISO(`${year}-07-01`), name: 'Canada Day' },
    { date: parseISO(`${year}-09-01`), name: 'Labour Day' },
    { date: parseISO(`${year}-10-13`), name: 'Thanksgiving Day' },
    { date: parseISO(`${year}-11-11`), name: 'Remembrance Day' },
    { date: parseISO(`${year}-12-25`), name: 'Christmas Day' },
    { date: parseISO(`${year}-12-26`), name: 'Boxing Day' },
    ...holidays.map(h => ({ date: parseISO(h.date), name: h.name })),
  ];

  // Expand and mark custom days off
  const expandedCustomDays = expandCustomDaysOff(customDaysOff, year);

  allDates.forEach(day => {
    const publicHoliday = PUBLIC_HOLIDAYS.find(h => isSameDay(h.date, day.date));
    const customDay = expandedCustomDays.find(d => isSameDay(d.date, day.date));

    if (publicHoliday) {
      day.isPublicHoliday = true;
      day.publicHolidayName = publicHoliday.name;
    }
    if (customDay) {
      day.isCustomDayOff = true;
      day.customDayName = customDay.name;
      day.isPartOfBreak = true; // Custom days off should be part of breaks by default
    }
  });

  // First optimization pass
  const initialResult = performInitialOptimization(allDates, numberOfDays, strategy);

  // Validation and correction passes
  let currentResult = initialResult;
  let iterationCount = 0;
  const MAX_ITERATIONS = 3;

  while (iterationCount < MAX_ITERATIONS) {
    // Count current CTO days
    const currentCTOCount = currentResult.days.filter(d => d.isCTO).length;

    // Validate break continuity and weekend pairs
    let needsCorrection = false;

    // Check break continuity
    currentResult.breaks.forEach((breakPeriod: Break, index: number) => {
      const breakDays = breakPeriod.days;
      for (let i = 1; i < breakDays.length; i++) {
        const prevDate = parseISO(breakDays[i - 1].date);
        const currDate = parseISO(breakDays[i].date);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dayDiff !== 1) {
          console.log(`Break discontinuity found in break ${index + 1}, fixing...`);
          needsCorrection = true;
          // Convert to working dates for correction
          const workingDates = currentResult.days.map((d: OptimizedDay) => ({
            date: parseISO(d.date),
            dateStr: d.date,
            isWeekend: d.isWeekend,
            isPublicHoliday: d.isPublicHoliday,
            publicHolidayName: d.publicHolidayName,
            isCTO: d.isCTO,
            isPartOfBreak: d.isPartOfBreak,
            isCustomDayOff: d.isCustomDayOff,
            customDayName: d.customDayName,
          }));
          splitDiscontinuousBreak(workingDates, breakPeriod);

          // Recalculate breaks and stats
          const breaks = calculateBreaks(workingDates);
          const stats = calculateStats(workingDates);

          currentResult = {
            days: workingDates.map(d => ({
              date: d.dateStr,
              isWeekend: d.isWeekend,
              isCTO: d.isCTO,
              isPartOfBreak: d.isPartOfBreak,
              isPublicHoliday: d.isPublicHoliday,
              publicHolidayName: d.publicHolidayName,
              isCustomDayOff: d.isCustomDayOff,
              customDayName: d.customDayName,
            })),
            breaks,
            stats,
          };
        }
      }
    });

    // Check weekend pair integrity
    const workingDates = currentResult.days.map((d: OptimizedDay) => ({
      date: parseISO(d.date),
      dateStr: d.date,
      isWeekend: d.isWeekend,
      isPublicHoliday: d.isPublicHoliday,
      publicHolidayName: d.publicHolidayName,
      isCTO: d.isCTO,
      isPartOfBreak: d.isPartOfBreak,
      isCustomDayOff: d.isCustomDayOff,
      customDayName: d.customDayName,
    }));

    for (let i = 0; i < workingDates.length - 1; i++) {
      const day = workingDates[i];
      const nextDay = workingDates[i + 1];
      if (isSaturday(day.date) && isSunday(nextDay.date)) {
        if (day.isPartOfBreak !== nextDay.isPartOfBreak) {
          console.log(`Weekend pair integrity violation found at ${day.dateStr}, fixing...`);
          needsCorrection = true;
          fixWeekendPairIntegrity(workingDates, i);
        }
      }
    }

    if (needsCorrection) {
      // Recalculate breaks and stats after weekend fixes
      const breaks = calculateBreaks(workingDates);
      const stats = calculateStats(workingDates);

      currentResult = {
        days: workingDates.map(d => ({
          date: d.dateStr,
          isWeekend: d.isWeekend,
          isCTO: d.isCTO,
          isPartOfBreak: d.isPartOfBreak,
          isPublicHoliday: d.isPublicHoliday,
          publicHolidayName: d.publicHolidayName,
          isCustomDayOff: d.isCustomDayOff,
          customDayName: d.customDayName,
        })),
        breaks,
        stats,
      };
      continue; // Restart the loop to check if more fixes are needed
    }

    // Original CTO count correction logic continues here...
    if (currentCTOCount === numberOfDays) {
      break;
    } else if (currentCTOCount > numberOfDays) {
      // We have too many CTO days, need to remove some
      console.log(`Too many CTO days (${currentCTOCount}/${numberOfDays}), removing excess...`);
      const daysToRemove = currentCTOCount - numberOfDays;

      // Convert back to DayInfo array for processing
      const workingDates = currentResult.days.map((d: OptimizedDay) => ({
        date: parseISO(d.date),
        dateStr: d.date,
        isWeekend: d.isWeekend,
        isPublicHoliday: d.isPublicHoliday,
        publicHolidayName: d.publicHolidayName,
        isCTO: d.isCTO,
        isPartOfBreak: d.isPartOfBreak,
        isCustomDayOff: d.isCustomDayOff,
        customDayName: d.customDayName,
      }));

      // Remove CTO days that have the least impact
      removeLeastEffectiveCTODays(workingDates, daysToRemove);

      // Recalculate breaks and stats
      const breaks = calculateBreaks(workingDates);
      const stats = calculateStats(workingDates);

      currentResult = {
        days: workingDates.map(d => ({
          date: d.dateStr,
          isWeekend: d.isWeekend,
          isCTO: d.isCTO,
          isPartOfBreak: d.isPartOfBreak,
          isPublicHoliday: d.isPublicHoliday,
          publicHolidayName: d.publicHolidayName,
          isCustomDayOff: d.isCustomDayOff,
          customDayName: d.customDayName,
        })),
        breaks,
        stats,
      };
    } else {
      // We have too few CTO days, need to add more
      console.log(`Too few CTO days (${currentCTOCount}/${numberOfDays}), adding more...`);
      const daysToAdd = numberOfDays - currentCTOCount;

      // Convert back to DayInfo array for processing
      const workingDates = currentResult.days.map((d: OptimizedDay) => ({
        date: parseISO(d.date),
        dateStr: d.date,
        isWeekend: d.isWeekend,
        isPublicHoliday: d.isPublicHoliday,
        publicHolidayName: d.publicHolidayName,
        isCTO: d.isCTO,
        isPartOfBreak: d.isPartOfBreak,
        isCustomDayOff: d.isCustomDayOff,
        customDayName: d.customDayName,
      }));

      // Add CTO days in optimal positions
      addOptimalCTODays(workingDates, daysToAdd, strategy);

      // Recalculate breaks and stats
      const breaks = calculateBreaks(workingDates);
      const stats = calculateStats(workingDates);

      currentResult = {
        days: workingDates.map(d => ({
          date: d.dateStr,
          isWeekend: d.isWeekend,
          isCTO: d.isCTO,
          isPartOfBreak: d.isPartOfBreak,
          isPublicHoliday: d.isPublicHoliday,
          publicHolidayName: d.publicHolidayName,
          isCustomDayOff: d.isCustomDayOff,
          customDayName: d.customDayName,
        })),
        breaks,
        stats,
      };
    }

    iterationCount++;
  }

  // Final validation
  const finalCTOCount = currentResult.days.filter(d => d.isCTO).length;
  if (finalCTOCount !== numberOfDays) {
    console.warn(`Warning: Could not achieve exact CTO day count. Requested: ${numberOfDays}, Actual: ${finalCTOCount}`);
  }

  return currentResult;
}

function removeLeastEffectiveCTODays(allDates: DayInfo[], count: number): void {
  // Score each CTO day based on its effectiveness
  const ctoDays = allDates
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => day.isCTO)
    .map(({ day, index }) => ({
      index,
      score: calculateCTODayEffectiveness(allDates, index),
    }))
    .sort((a, b) => a.score - b.score); // Sort by ascending score (remove least effective first)

  // Remove the specified number of CTO days
  for (let i = 0; i < Math.min(count, ctoDays.length); i++) {
    const { index } = ctoDays[i];
    allDates[index].isCTO = false;
    updateBreakStatus(allDates, index);
  }
}

function calculateCTODayEffectiveness(allDates: DayInfo[], index: number): number {
  let score = 0;
  const day = allDates[index];

  // Check if this CTO day is part of a longer break
  const breakLength = getBreakLength(allDates, index);
  score += breakLength * SCORING_MULTIPLIERS.BREAK_LENGTH_BONUS;

  // Check if it's adjacent to weekends or holidays
  const prevDay = index > 0 ? allDates[index - 1] : null;
  const nextDay = index < allDates.length - 1 ? allDates[index + 1] : null;

  if (prevDay?.isWeekend || prevDay?.isPublicHoliday || prevDay?.isCustomDayOff) {
    score += SCORING_MULTIPLIERS.ADJACENT_DAY_BONUS;
  }
  if (nextDay?.isWeekend || nextDay?.isPublicHoliday || nextDay?.isCustomDayOff) {
    score += SCORING_MULTIPLIERS.ADJACENT_DAY_BONUS;
  }

  // Check if it's on a Monday or Friday
  const dayOfWeek = day.date.getDay();
  if (dayOfWeek === DAYS.MONDAY || dayOfWeek === DAYS.FRIDAY) {
    score += SCORING_MULTIPLIERS.OPTIMAL_DAY_BONUS;
  }

  // Consider seasonal weights
  const month = day.date.getMonth();
  if (month >= MONTHS.JUNE && month <= MONTHS.AUGUST) score *= SEASONAL_WEIGHTS.SUMMER;
  else if (month === MONTHS.DECEMBER || month === MONTHS.JANUARY) score *= SEASONAL_WEIGHTS.WINTER_HOLIDAY;

  return score;
}

function addOptimalCTODays(allDates: DayInfo[], count: number, strategy: string): void {
  // Find all potential positions for new CTO days
  const candidates = findOptimalCTOPositions(allDates)
    .filter(index => !allDates[index].isCTO) // Filter out existing CTO days
    .slice(0, count); // Take only as many as we need

  // Add CTO days in the optimal positions
  candidates.forEach(index => {
    allDates[index].isCTO = true;
    allDates[index].isPartOfBreak = true;
    updateBreakStatus(allDates, index);
  });

  // If we couldn't add all requested days, try to find suboptimal positions
  if (candidates.length < count) {
    const remaining = count - candidates.length;
    const suboptimalCandidates = findSuboptimalCTOPositions(allDates, strategy)
      .filter(index => !allDates[index].isCTO)
      .slice(0, remaining);

    suboptimalCandidates.forEach(index => {
      allDates[index].isCTO = true;
      allDates[index].isPartOfBreak = true;
      updateBreakStatus(allDates, index);
    });
  }
}

function findSuboptimalCTOPositions(allDates: DayInfo[], strategy: string): number[] {
  // Find all workdays that aren't already used
  return allDates
    .map((day, index) => ({ day, index }))
    .filter(({ day }) =>
      !day.isWeekend &&
      !day.isPublicHoliday &&
      !day.isCustomDayOff &&
      !day.isCTO,
    )
    .map(({ index }) => ({
      index,
      score: calculateSuboptimalPositionScore(allDates, index, strategy),
    }))
    .sort((a, b) => b.score - a.score) // Sort by descending score
    .map(({ index }) => index);
}

function calculateSuboptimalPositionScore(allDates: DayInfo[], index: number, strategy: string): number {
  let score = 1;
  const day = allDates[index];
  const dayOfWeek = day.date.getDay();

  // Strategy-specific scoring
  switch (strategy) {
    case 'longWeekends':
      if (dayOfWeek === DAYS.MONDAY || dayOfWeek === DAYS.FRIDAY) score *= 2;
      break;
    case 'weekLongBreaks':
      // Prefer days that could potentially connect to other breaks
      const nearbyBreak = hasNearbyBreak(allDates, index, 3);
      if (nearbyBreak) score *= 1.5;
      break;
    case 'extendedVacations':
      // Prefer days that could extend existing breaks
      const adjacentBreak = hasAdjacentBreak(allDates, index);
      if (adjacentBreak) score *= 2;
      break;
  }

  return score;
}

function hasNearbyBreak(allDates: DayInfo[], index: number, range: number): boolean {
  const start = Math.max(0, index - range);
  const end = Math.min(allDates.length - 1, index + range);

  for (let i = start; i <= end; i++) {
    if (allDates[i].isPartOfBreak) return true;
  }
  return false;
}

function hasAdjacentBreak(allDates: DayInfo[], index: number): boolean {
  const prev = index > 0 ? allDates[index - 1].isPartOfBreak : false;
  const next = index < allDates.length - 1 ? allDates[index + 1].isPartOfBreak : false;
  return prev || next;
}

function performInitialOptimization(
  allDates: DayInfo[],
  numberOfDays: number,
  strategy: string,
): OptimizationResult {
  const offBlocks = generateOffBlocks(allDates);
  const candidates = generateCandidates(allDates, offBlocks);
  const selectedBreaks = selectCandidates(candidates, numberOfDays, strategy, allDates);

  applySelectedBreaks(allDates, selectedBreaks);

  const breaks = calculateBreaks(allDates);
  const stats = calculateStats(allDates);

  return {
    days: allDates.map(d => ({
      date: d.dateStr,
      isWeekend: d.isWeekend,
      isCTO: d.isCTO,
      isPartOfBreak: d.isPartOfBreak,
      isPublicHoliday: d.isPublicHoliday,
      publicHolidayName: d.publicHolidayName,
      isCustomDayOff: d.isCustomDayOff,
      customDayName: d.customDayName,
    })),
    breaks,
    stats,
  };
}

function calculateBreaks(allDates: DayInfo[]): Break[] {
  const breaks: BreakPeriod[] = [];
  let currentBreak: BreakPeriod | null = null;
  let hasCTOInCurrentBreak = false;

  allDates.forEach((day, index) => {
    const isOffDay = day.isWeekend || day.isPublicHoliday || day.isCTO || day.isCustomDayOff;
    if (isOffDay) {
      if (!currentBreak) {
        currentBreak = { start: index, end: index };
        hasCTOInCurrentBreak = day.isCTO;
      } else {
        currentBreak.end = index;
        hasCTOInCurrentBreak = hasCTOInCurrentBreak || day.isCTO;
      }
    } else {
      if (currentBreak && hasCTOInCurrentBreak) {
        breaks.push(currentBreak);
      }
      currentBreak = null;
      hasCTOInCurrentBreak = false;
    }
  });

  if (currentBreak && hasCTOInCurrentBreak) {
    breaks.push(currentBreak);
  }

  return breaks.map(br => {
    const daysInBreak = allDates.slice(br.start, br.end + 1);
    const ctoDays = daysInBreak.filter(d => d.isCTO).length;
    const publicHolidays = daysInBreak.filter(d => d.isPublicHoliday).length;
    const weekends = daysInBreak.filter(d => d.isWeekend).length;
    const customDaysOff = daysInBreak.filter(d => d.isCustomDayOff).length;

    return {
      startDate: allDates[br.start].dateStr,
      endDate: allDates[br.end].dateStr,
      days: daysInBreak.map(d => ({
        date: d.dateStr,
        isWeekend: d.isWeekend,
        isCTO: d.isCTO,
        isPartOfBreak: true,
        isPublicHoliday: d.isPublicHoliday,
        publicHolidayName: d.publicHolidayName,
        isCustomDayOff: d.isCustomDayOff,
        customDayName: d.customDayName,
      })),
      totalDays: daysInBreak.length,
      ctoDays,
      publicHolidays,
      weekends,
      customDaysOff,
    };
  });
}

function calculateStats(
  allDates: DayInfo[],
): OptimizationStats {
  // Find all breaks (sequences with at least one CTO day)
  const breaks: { start: number; end: number }[] = [];
  let currentBreak: { start: number; end: number } | null = null;
  let hasCTOInCurrentBreak = false;

  allDates.forEach((day, index) => {
    const isOffDay = day.isWeekend || day.isPublicHoliday || day.isCTO || day.isCustomDayOff;
    if (isOffDay) {
      if (!currentBreak) {
        currentBreak = { start: index, end: index };
        hasCTOInCurrentBreak = day.isCTO;
      } else {
        currentBreak.end = index;
        hasCTOInCurrentBreak = hasCTOInCurrentBreak || day.isCTO;
      }
    } else {
      if (currentBreak && hasCTOInCurrentBreak) {
        breaks.push(currentBreak);
      }
      currentBreak = null;
      hasCTOInCurrentBreak = false;
    }
  });

  if (currentBreak && hasCTOInCurrentBreak) {
    breaks.push(currentBreak);
  }

  // Count CTO days that are part of breaks
  const totalCTODays = breaks.reduce((total, br) => {
    return total + allDates.slice(br.start, br.end + 1).filter(d => d.isCTO).length;
  }, 0);

  // Count all public holidays in the year
  const totalPublicHolidays = allDates.filter(d => d.isPublicHoliday).length;

  // Count all custom days off regardless of breaks
  const totalCustomDaysOff = allDates.filter(d => d.isCustomDayOff).length;

  // Count total days off (sum of days in each break)
  const totalDaysOff = breaks.reduce((total, br) => {
    return total + (br.end - br.start + 1);
  }, 0);

  // Weekend classification
  let totalNormalWeekends = 0;
  let totalExtendedWeekends = 0;

  for (let i = 0; i < allDates.length; i++) {
    if (isSaturday(allDates[i].date)) {
      const sundayIndex = i + 1;
      if (sundayIndex < allDates.length && isSunday(allDates[sundayIndex].date)) {
        // Count all weekends
        totalNormalWeekends++;

        // Check if this weekend is part of a break
        const isInBreak = breaks.some(br =>
          (i >= br.start && i <= br.end) || // Saturday in break
          (sundayIndex >= br.start && sundayIndex <= br.end), // Sunday in break
        );

        if (isInBreak) {
          totalExtendedWeekends++;
          totalNormalWeekends--; // Subtract from normal weekends if it's extended
        }

        i++; // Skip Sunday
      }
    }
  }

  return {
    totalCTODays,
    totalPublicHolidays,
    totalNormalWeekends,
    totalExtendedWeekends,
    totalCustomDaysOff,
    totalDaysOff,
  };
}

// Helper functions for performInitialOptimization
function generateCandidates(allDates: DayInfo[], offBlocks: BreakPeriod[]): BreakCandidate[] {
  const candidates: BreakCandidate[] = [];

  // Extension candidates
  offBlocks.forEach(block => {
    // Extend before
    if (block.start > 0) {
      const prevDay = block.start - 1;
      if (!allDates[prevDay].isWeekend && !allDates[prevDay].isPublicHoliday && !allDates[prevDay].isCustomDayOff) {
        const ctoDays = 1;
        const totalDays = (block.end - prevDay + 1);
        candidates.push({
          type: 'extension',
          days: Array.from({ length: totalDays }, (_, i) => prevDay + i),
          ctoDaysUsed: ctoDays,
          efficiency: totalDays / ctoDays,
          length: totalDays,
        });
      }
    }
    // Extend after
    if (block.end < allDates.length - 1) {
      const nextDay = block.end + 1;
      if (!allDates[nextDay].isWeekend && !allDates[nextDay].isPublicHoliday && !allDates[nextDay].isCustomDayOff) {
        const ctoDays = 1;
        const totalDays = (nextDay - block.start + 1);
        candidates.push({
          type: 'extension',
          days: Array.from({ length: totalDays }, (_, i) => block.start + i),
          ctoDaysUsed: ctoDays,
          efficiency: totalDays / ctoDays,
          length: totalDays,
        });
      }
    }
  });

  // Bridge candidates
  for (let i = 0; i < offBlocks.length - 1; i++) {
    const currentBlock = offBlocks[i];
    const nextBlock = offBlocks[i + 1];
    const gapStart = currentBlock.end + 1;
    const gapEnd = nextBlock.start - 1;

    if (gapStart > gapEnd) continue;

    let isAllWorkdays = true;
    for (let j = gapStart; j <= gapEnd; j++) {
      if (allDates[j].isWeekend || allDates[j].isPublicHoliday || allDates[j].isCustomDayOff) {
        isAllWorkdays = false;
        break;
      }
    }
    if (!isAllWorkdays) continue;

    const ctoDaysUsed = gapEnd - gapStart + 1;
    const totalDays = (nextBlock.end - currentBlock.start + 1);
    candidates.push({
      type: 'bridge',
      days: [
        ...(currentBlock.days || []),
        ...Array.from({ length: ctoDaysUsed }, (_, i) => gapStart + i),
        ...(nextBlock.days || []),
      ],
      ctoDaysUsed,
      efficiency: totalDays / ctoDaysUsed,
      length: totalDays,
    });
  }

  return candidates;
}

function selectCandidates(
  candidates: BreakCandidate[],
  numberOfDays: number,
  strategy: string = 'balanced',
  allDates: DayInfo[],
): BreakCandidate[] {
  const selectedBreaks: BreakCandidate[] = [];
  let remainingCTO = numberOfDays;
  const usedDays = new Set<number>();

  // Sort candidates by adjusted score (efficiency * strategy multiplier)
  candidates.sort((a, b) => {
    const aScore = calculateStrategyScore(a, strategy) * calculateSpacingScore(a, selectedBreaks, allDates);
    const bScore = calculateStrategyScore(b, strategy) * calculateSpacingScore(b, selectedBreaks, allDates);
    return bScore - aScore;
  });

  // Apply distribution weights based on strategy
  const targetDistribution = calculateTargetDistribution(numberOfDays, strategy);
  const currentDistribution = {
    longWeekends: 0,
    miniBreaks: 0,
    weekLongBreaks: 0,
    extendedBreaks: 0,
  };

  for (const candidate of candidates) {
    if (remainingCTO <= 0) break;
    if (candidate.ctoDaysUsed > remainingCTO) continue;

    // Check if candidate days are available
    let canTake = true;
    for (const day of candidate.days) {
      if (usedDays.has(day)) {
        canTake = false;
        break;
      }
    }
    if (!canTake) continue;

    // Check if this break type fits within our distribution targets
    const breakType = getBreakType(candidate.length);
    if (currentDistribution[breakType] >= targetDistribution[breakType]) {
      continue;
    }

    // Mark days as used
    candidate.days.forEach(day => usedDays.add(day));
    selectedBreaks.push(candidate);
    remainingCTO -= candidate.ctoDaysUsed;
    currentDistribution[breakType]++;
  }

  // If we still have remaining CTO days, try to allocate them according to strategy
  if (remainingCTO > 0) {
    const additionalBreaks = allocateRemainingDays(remainingCTO, usedDays, strategy, allDates);
    selectedBreaks.push(...additionalBreaks);
  }

  return selectedBreaks;
}

function calculateSpacingScore(
  candidate: BreakCandidate,
  selectedBreaks: BreakCandidate[],
  allDates: DayInfo[],
): number {
  if (selectedBreaks.length === 0) return 1;

  let score = 1;
  const candidateStart = Math.min(...candidate.days);
  const candidateEnd = Math.max(...candidate.days);
  const breakLength = candidateEnd - candidateStart + 1;

  // Check spacing from other breaks
  for (const existingBreak of selectedBreaks) {
    const existingStart = Math.min(...existingBreak.days);
    const existingEnd = Math.max(...existingBreak.days);
    const existingLength = existingEnd - existingStart + 1;

    // Calculate workdays between breaks
    const workdaysBetween = countWorkdaysBetween(
      allDates,
      Math.min(candidateStart, existingEnd),
      Math.max(candidateEnd, existingStart),
    );

    // Apply spacing requirements based on break lengths
    if (breakLength >= BREAK_LENGTHS.EXTENDED.MIN || existingLength >= BREAK_LENGTHS.EXTENDED.MIN) {
      if (workdaysBetween < SPACING_REQUIREMENTS.EXTENDED_MIN_DAYS) {
        score *= SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.EXTENDED;
      }
    } else if (breakLength >= BREAK_LENGTHS.WEEK_LONG.MIN || existingLength >= BREAK_LENGTHS.WEEK_LONG.MIN) {
      if (workdaysBetween < SPACING_REQUIREMENTS.WEEK_LONG_MIN_DAYS) {
        score *= SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.WEEK_LONG;
      }
    } else if (breakLength >= BREAK_LENGTHS.MINI_BREAK.MIN || existingLength >= BREAK_LENGTHS.MINI_BREAK.MIN) {
      if (workdaysBetween < SPACING_REQUIREMENTS.MINI_BREAK_MIN_DAYS) {
        score *= SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.MINI_BREAK;
      }
    } else {
      if (workdaysBetween < SPACING_REQUIREMENTS.LONG_WEEKEND_MIN_DAYS) {
        score *= SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.LONG_WEEKEND;
      }
    }

    // Apply penalty for similar break types too close together
    if (breakLength === existingLength && workdaysBetween < SPACING_REQUIREMENTS.EXTENDED_MIN_DAYS) {
      score *= SPACING_REQUIREMENTS.SIMILAR_BREAK_PENALTY;
    }

    // Apply bonus for optimal spacing
    const optimalSpacing = Math.max(
      SPACING_REQUIREMENTS.EXTENDED_MIN_DAYS,
      Math.floor(365 / (selectedBreaks.length + 1)),
    );
    if (Math.abs(workdaysBetween - optimalSpacing) <= 5) {
      score *= SPACING_REQUIREMENTS.OPTIMAL_SPACING_BONUS;
    }
  }

  return score;
}

function countWorkdaysBetween(allDates: DayInfo[], start: number, end: number): number {
  let count = 0;
  for (let i = start; i <= end; i++) {
    if (!allDates[i].isWeekend && !allDates[i].isPublicHoliday && !allDates[i].isCustomDayOff) {
      count++;
    }
  }
  return count;
}

function calculateTargetDistribution(numberOfDays: number, strategy: string): BreakDistribution {
  const weights = { ...DISTRIBUTION_WEIGHTS };

  // Adjust weights based on strategy
  switch (strategy) {
    case 'longWeekends':
      weights.LONG_WEEKENDS *= SCORING_MULTIPLIERS.STRONG_PREFERENCE;
      weights.WEEK_LONG_BREAKS *= SCORING_MULTIPLIERS.MODERATE_PENALTY;
      weights.EXTENDED_BREAKS *= SCORING_MULTIPLIERS.HEAVY_PENALTY;
      break;
    case 'weekLongBreaks':
      weights.WEEK_LONG_BREAKS *= SCORING_MULTIPLIERS.STRONG_PREFERENCE;
      weights.LONG_WEEKENDS *= SCORING_MULTIPLIERS.MODERATE_PENALTY;
      weights.EXTENDED_BREAKS *= SCORING_MULTIPLIERS.LIGHT_PENALTY;
      break;
    case 'extendedVacations':
      weights.EXTENDED_BREAKS *= SCORING_MULTIPLIERS.STRONG_PREFERENCE;
      weights.LONG_WEEKENDS *= SCORING_MULTIPLIERS.HEAVY_PENALTY;
      weights.WEEK_LONG_BREAKS *= SCORING_MULTIPLIERS.LIGHT_PENALTY;
      break;
    case 'balanced':
      // Apply balanced weight to all categories
      weights.LONG_WEEKENDS *= weights.BALANCED;
      weights.MINI_BREAKS *= weights.BALANCED;
      weights.WEEK_LONG_BREAKS *= weights.BALANCED;
      weights.EXTENDED_BREAKS *= weights.BALANCED;
      break;
  }

  // Normalize weights
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights = Object.entries(weights).reduce((acc, [key, value]) => {
    if (key !== 'BALANCED') { // Skip the BALANCED weight in normalization
      acc[key.toLowerCase()] = value / totalWeight;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate target numbers
  return {
    longWeekends: Math.round(numberOfDays * normalizedWeights.long_weekends),
    miniBreaks: Math.round(numberOfDays * normalizedWeights.mini_breaks),
    weekLongBreaks: Math.round(numberOfDays * normalizedWeights.week_long_breaks),
    extendedBreaks: Math.round(numberOfDays * normalizedWeights.extended_breaks),
  };
}

function getBreakType(length: number): keyof BreakDistribution {
  if (length >= BREAK_LENGTHS.EXTENDED.MIN) return 'extendedBreaks';
  if (length >= BREAK_LENGTHS.WEEK_LONG.MIN) return 'weekLongBreaks';
  if (length >= BREAK_LENGTHS.MINI_BREAK.MIN) return 'miniBreaks';
  return 'longWeekends';
}

function calculateStrategyScore(candidate: BreakCandidate, strategy: string): number {
  let score = candidate.efficiency * EFFICIENCY_SCORING.MAX_MULTIPLIER;
  const length = candidate.length;

  // Base length-based scoring
  if (length >= BREAK_LENGTHS.EXTENDED.MIN && length <= BREAK_LENGTHS.EXTENDED.MAX) {
    score *= BREAK_LENGTHS.EXTENDED.SCORE_MULTIPLIER;
    if (length > BREAK_LENGTHS.EXTENDED.MAX) {
      score *= Math.pow(BREAK_LENGTHS.EXTENDED.PENALTY_MULTIPLIER, length - BREAK_LENGTHS.EXTENDED.MAX);
    }
  } else if (length >= BREAK_LENGTHS.WEEK_LONG.MIN && length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
    score *= BREAK_LENGTHS.WEEK_LONG.SCORE_MULTIPLIER;
    if (length > BREAK_LENGTHS.WEEK_LONG.MAX) {
      score *= Math.pow(BREAK_LENGTHS.WEEK_LONG.PENALTY_MULTIPLIER, length - BREAK_LENGTHS.WEEK_LONG.MAX);
    }
  } else if (length >= BREAK_LENGTHS.MINI_BREAK.MIN && length <= BREAK_LENGTHS.MINI_BREAK.MAX) {
    score *= BREAK_LENGTHS.MINI_BREAK.SCORE_MULTIPLIER;
    if (length > BREAK_LENGTHS.MINI_BREAK.MAX) {
      score *= Math.pow(BREAK_LENGTHS.MINI_BREAK.PENALTY_MULTIPLIER, length - BREAK_LENGTHS.MINI_BREAK.MAX);
    }
  } else if (length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
    score *= BREAK_LENGTHS.LONG_WEEKEND.SCORE_MULTIPLIER;
    if (length > BREAK_LENGTHS.LONG_WEEKEND.MAX) {
      score *= Math.pow(BREAK_LENGTHS.LONG_WEEKEND.PENALTY_MULTIPLIER, length - BREAK_LENGTHS.LONG_WEEKEND.MAX);
    }
  }

  // Strategy-specific scoring adjustments
  switch (strategy) {
    case 'longWeekends':
      // Strongly favor long weekends, penalize longer breaks
      if (length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
        score *= SCORING_MULTIPLIERS.STRONG_PREFERENCE;
      } else {
        score *= SCORING_MULTIPLIERS.HEAVY_PENALTY;
      }
      break;

    case 'weekLongBreaks':
      // Strongly favor week-long breaks, moderately penalize others
      if (length >= BREAK_LENGTHS.WEEK_LONG.MIN && length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
        score *= SCORING_MULTIPLIERS.STRONG_PREFERENCE;
      } else if (length >= BREAK_LENGTHS.MINI_BREAK.MIN && length <= BREAK_LENGTHS.MINI_BREAK.MAX) {
        score *= SCORING_MULTIPLIERS.MODERATE_PENALTY;
      } else {
        score *= SCORING_MULTIPLIERS.HEAVY_PENALTY;
      }
      break;

    case 'extendedVacations':
      // Strongly favor extended breaks, heavily penalize shorter breaks
      if (length >= BREAK_LENGTHS.EXTENDED.MIN) {
        score *= SCORING_MULTIPLIERS.VERY_STRONG_PREFERENCE;
        if (length >= BREAK_THRESHOLDS.TWO_WEEK_MINIMUM) {
          score *= SCORING_MULTIPLIERS.TWO_WEEK_BONUS;
        }
      } else if (length >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        score *= SCORING_MULTIPLIERS.MODERATE_PENALTY;
      } else {
        score *= SCORING_MULTIPLIERS.SEVERE_PENALTY;
      }
      break;

    case 'balanced':
      // Apply balanced strategy multipliers with slight adjustments
      if (length >= BREAK_LENGTHS.EXTENDED.MIN) {
        score *= BALANCED_STRATEGY.EXTENDED_MULTIPLIER;
      } else if (length >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        score *= BALANCED_STRATEGY.WEEK_LONG_MULTIPLIER;
      } else if (length >= BREAK_LENGTHS.MINI_BREAK.MIN) {
        score *= BALANCED_STRATEGY.MINI_BREAK_MULTIPLIER;
      } else if (length >= BREAK_LENGTHS.LONG_WEEKEND.MIN) {
        score *= BALANCED_STRATEGY.LONG_WEEKEND_MULTIPLIER;
      }

      // Apply distribution weights
      if (length >= BREAK_LENGTHS.EXTENDED.MIN) {
        score *= BALANCED_DISTRIBUTION.EXTENDED_BREAKS;
      } else if (length >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        score *= BALANCED_DISTRIBUTION.WEEK_BREAKS;
      } else if (length >= BREAK_LENGTHS.MINI_BREAK.MIN) {
        score *= BALANCED_DISTRIBUTION.MINI_BREAKS;
      } else if (length >= BREAK_LENGTHS.LONG_WEEKEND.MIN) {
        score *= BALANCED_DISTRIBUTION.LONG_WEEKENDS;
      }
      break;
  }

  // Apply position bonuses
  if (candidate.type === 'bridge') {
    score *= POSITION_BONUSES.HOLIDAY_MULTIPLIER;
  }

  // Apply seasonal weights based on the date
  const month = new Date(candidate.days[0]).getMonth();
  if (month >= MONTHS.JUNE && month <= MONTHS.AUGUST) { // Summer
    score *= SEASONAL_WEIGHTS.SUMMER;
  } else if (month === MONTHS.DECEMBER || month === MONTHS.JANUARY) { // Winter holiday
    score *= SEASONAL_WEIGHTS.WINTER_HOLIDAY;
  } else if (month >= MONTHS.SEPTEMBER && month <= MONTHS.OCTOBER) { // Fall
    score *= SEASONAL_WEIGHTS.FALL;
  } else if (month >= MONTHS.MARCH && month <= MONTHS.MAY) { // Spring
    score *= SEASONAL_WEIGHTS.SPRING;
  } else {
    score *= SEASONAL_WEIGHTS.WINTER;
  }

  return score;
}

function allocateRemainingDays(
  remainingDays: number,
  usedDays: Set<number>,
  strategy: string,
  allDates: DayInfo[],
): BreakCandidate[] {
  const additionalBreaks: BreakCandidate[] = [];
  let daysToAllocate = remainingDays;

  // Strategy-specific allocation of remaining days
  switch (strategy) {
    case 'longWeekends':
      // Prioritize creating as many long weekends as possible
      while (daysToAllocate >= BREAK_LENGTHS.LONG_WEEKEND.MIN) {
        const break_ = createLongWeekend(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }
      break;

    case 'weekLongBreaks':
      // First try to create full week-long breaks
      while (daysToAllocate >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        const break_ = createWeekLongBreak(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }

      // Then try for mini breaks with remaining days
      while (daysToAllocate >= BREAK_LENGTHS.MINI_BREAK.MIN) {
        const break_ = createMiniBreak(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }
      break;

    case 'extendedVacations':
      // Try to create the longest possible extended breaks
      while (daysToAllocate >= BREAK_LENGTHS.EXTENDED.MIN) {
        const maxLength = Math.min(
          Math.max(BREAK_LENGTHS.EXTENDED.MAX, daysToAllocate),
          15, // Hard cap at 15 days for reasonable extended breaks
        );

        const break_ = createExtendedBreak(usedDays, maxLength, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }

      // If we have enough days left, try for a week-long break
      if (daysToAllocate >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        const break_ = createWeekLongBreak(usedDays, allDates);
        if (break_) {
          additionalBreaks.push(break_);
          daysToAllocate -= break_.ctoDaysUsed;
        }
      }
      break;

    case 'balanced':
      // Use existing balanced implementation
      const targetDistribution = {
        longWeekends: Math.round(remainingDays * BALANCED_DISTRIBUTION.LONG_WEEKENDS),
        miniBreaks: Math.round(remainingDays * BALANCED_DISTRIBUTION.MINI_BREAKS),
        weekBreaks: Math.round(remainingDays * BALANCED_DISTRIBUTION.WEEK_BREAKS),
        extendedBreaks: Math.round(remainingDays * BALANCED_DISTRIBUTION.EXTENDED_BREAKS),
      };

      // First, try to allocate extended breaks
      if (daysToAllocate >= BREAK_LENGTHS.EXTENDED.MIN) {
        const daysForExtended = Math.min(
          daysToAllocate,
          targetDistribution.extendedBreaks,
        );
        const extendedBreak = createExtendedBreak(usedDays, daysForExtended, allDates);
        if (extendedBreak) {
          additionalBreaks.push(extendedBreak);
          daysToAllocate -= extendedBreak.ctoDaysUsed;
        }
      }

      // Then week-long breaks
      while (daysToAllocate >= BREAK_LENGTHS.WEEK_LONG.MIN &&
      additionalBreaks.filter(b => b.length >= BREAK_LENGTHS.WEEK_LONG.MIN).length < targetDistribution.weekBreaks) {
        const break_ = createWeekLongBreak(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }

      // Then mini breaks
      while (daysToAllocate >= BREAK_LENGTHS.MINI_BREAK.MIN &&
      additionalBreaks.filter(b => b.length >= BREAK_LENGTHS.MINI_BREAK.MIN).length < targetDistribution.miniBreaks) {
        const break_ = createMiniBreak(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }

      // Finally, long weekends
      while (daysToAllocate >= BREAK_LENGTHS.LONG_WEEKEND.MIN &&
      additionalBreaks.filter(b => b.length <= BREAK_LENGTHS.LONG_WEEKEND.MAX).length < targetDistribution.longWeekends) {
        const break_ = createLongWeekend(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate -= break_.ctoDaysUsed;
      }
      break;
  }

  // Only allocate remaining days as standalone if we can't create the preferred break type
  if (daysToAllocate > 0) {
    const minDaysForStrategy = {
      longWeekends: BREAK_LENGTHS.LONG_WEEKEND.MIN,
      weekLongBreaks: BREAK_LENGTHS.MINI_BREAK.MIN,
      extendedVacations: BREAK_LENGTHS.WEEK_LONG.MIN,
      balanced: BREAK_LENGTHS.LONG_WEEKEND.MIN,
    }[strategy] || BREAK_LENGTHS.LONG_WEEKEND.MIN; // Provide default value

    if (daysToAllocate < minDaysForStrategy) {
      while (daysToAllocate > 0) {
        const break_ = createStandaloneDay(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate--;
      }
    }
  }

  return additionalBreaks;
}

// Helper functions for remaining day allocation
function createLongWeekend(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
  // Look for Friday or Monday positions that would create a long weekend
  const potentialDays: number[] = [];

  // Find all available Fridays and Mondays
  for (let i = 0; i < allDates.length - 1; i++) {
    if (usedDays.has(i)) continue;

    const date = allDates[i].date;
    const dayOfWeek = date.getDay();

    if ((dayOfWeek === DAYS.MONDAY || dayOfWeek === DAYS.FRIDAY) && // Monday or Friday
      !allDates[i].isWeekend &&
      !allDates[i].isPublicHoliday) {

      // Check if this would create a long weekend
      if (dayOfWeek === DAYS.FRIDAY) { // Friday
        if (i + 2 < allDates.length &&
          allDates[i + 1].isWeekend &&
          allDates[i + 2].isWeekend) {
          potentialDays.push(i);
        }
      } else { // Monday
        if (i >= 2 &&
          allDates[i - 1].isWeekend &&
          allDates[i - 2].isWeekend) {
          potentialDays.push(i);
        }
      }
    }
  }

  if (potentialDays.length === 0) return null;

  // Choose the best position (prefer earlier dates)
  const selectedDay = potentialDays[0];
  const dayOfWeek = allDates[selectedDay].date.getDay();

  return {
    type: 'extension',
    days: dayOfWeek === DAYS.FRIDAY ?
      [selectedDay, selectedDay + 1, selectedDay + 2] :
      [selectedDay - 2, selectedDay - 1, selectedDay],
    ctoDaysUsed: 1,
    efficiency: 3,
    length: 3,
  };
}

function createWeekLongBreak(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
  // Look for a sequence of 5 workdays that could form a week-long break
  for (let i = 0; i < allDates.length - 6; i++) {
    if (usedDays.has(i)) continue;

    let isValidSequence = true;
    const sequenceDays: number[] = [];
    let workdayCount = 0;
    let currentIndex = i;

    // Try to find 5 consecutive workdays
    while (workdayCount < 5 && currentIndex < allDates.length) {
      const day = allDates[currentIndex];

      if (usedDays.has(currentIndex) ||
        day.isWeekend ||
        day.isPublicHoliday) {
        isValidSequence = false;
        break;
      }

      sequenceDays.push(currentIndex);
      workdayCount++;
      currentIndex++;

      // Skip weekends
      while (currentIndex < allDates.length &&
      (allDates[currentIndex].isWeekend ||
        allDates[currentIndex].isPublicHoliday)) {
        currentIndex++;
      }
    }

    if (isValidSequence && workdayCount === 5) {
      // Include surrounding weekends if available
      let startIdx = sequenceDays[0];
      let endIdx = sequenceDays[sequenceDays.length - 1];

      // Look for weekend before
      while (startIdx > 0 && allDates[startIdx - 1].isWeekend) {
        startIdx--;
        sequenceDays.unshift(startIdx);
      }

      // Look for weekend after
      while (endIdx < allDates.length - 1 && allDates[endIdx + 1].isWeekend) {
        endIdx++;
        sequenceDays.push(endIdx);
      }

      return {
        type: 'standalone',
        days: sequenceDays,
        ctoDaysUsed: 5,
        efficiency: sequenceDays.length / 5,
        length: sequenceDays.length,
      };
    }
  }

  return null;
}

function createExtendedBreak(usedDays: Set<number>, maxDays: number, allDates: DayInfo[]): BreakCandidate | null {
  // Look for the longest possible sequence of consecutive days
  let bestSequence: number[] | null = null;
  let bestEfficiency = 0;

  for (let i = 0; i < allDates.length; i++) {
    if (usedDays.has(i)) continue;

    const sequence: number[] = [];
    let ctoDaysUsed = 0;
    let currentIndex = i;
    let totalDays = 0;

    // Build sequence until we hit a used day or exceed maxDays
    while (currentIndex < allDates.length &&
    !usedDays.has(currentIndex) &&
    ctoDaysUsed < maxDays) {

      const day = allDates[currentIndex];
      sequence.push(currentIndex);
      totalDays++;

      if (!day.isWeekend && !day.isPublicHoliday) {
        ctoDaysUsed++;
      }

      currentIndex++;
    }

    // Check if this is the best sequence so far
    const efficiency = totalDays / ctoDaysUsed;
    if (totalDays >= 10 && efficiency > bestEfficiency && ctoDaysUsed <= maxDays) {
      bestSequence = sequence;
      bestEfficiency = efficiency;
    }
  }

  if (!bestSequence) return null;

  return {
    type: 'standalone',
    days: bestSequence,
    ctoDaysUsed: maxDays,
    efficiency: bestEfficiency,
    length: bestSequence.length,
  };
}

function createStandaloneDay(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
  let bestDay: number | null = null;
  let bestScore = -1;

  for (let i = 0; i < allDates.length; i++) {
    if (usedDays.has(i)) continue;

    const day = allDates[i];
    if (!day.isWeekend && !day.isPublicHoliday) {
      const dayOfWeek = day.date.getDay();
      let score = 0;

      // Score based on position
      if (dayOfWeek === DAYS.MONDAY || dayOfWeek === DAYS.FRIDAY) {
        score += SCORING_MULTIPLIERS.PRIME_POSITION_BONUS;
      }
      if (dayOfWeek === DAYS.TUESDAY || dayOfWeek === DAYS.THURSDAY) {
        score += SCORING_MULTIPLIERS.SECONDARY_POSITION_BONUS;
      }

      // Bonus for adjacent weekends/holidays
      if (i > 0 && (allDates[i - 1].isWeekend || allDates[i - 1].isPublicHoliday)) {
        score += SCORING_MULTIPLIERS.ADJACENT_BONUS;
      }
      if (i < allDates.length - 1 && (allDates[i + 1].isWeekend || allDates[i + 1].isPublicHoliday)) {
        score += SCORING_MULTIPLIERS.ADJACENT_BONUS;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDay = i;
      }
    }
  }

  if (bestDay === null) return null;

  return {
    type: 'standalone',
    days: [bestDay],
    ctoDaysUsed: 1,
    efficiency: 1,
    length: 1,
  };
}

// Helper function to generate off blocks (extracted from performInitialOptimization)
function generateOffBlocks(allDates: DayInfo[]): BreakPeriod[] {
  const offBlocks: BreakPeriod[] = [];
  let currentBlock: BreakPeriod | null = null;

  allDates.forEach((day, index) => {
    if (day.isWeekend || day.isPublicHoliday || day.isCustomDayOff) {
      if (!currentBlock) {
        currentBlock = { start: index, end: index, days: [index] };
      } else {
        currentBlock.end = index;
        currentBlock.days?.push(index);
      }
    } else {
      if (currentBlock) {
        offBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  });

  if (currentBlock) offBlocks.push(currentBlock);
  return offBlocks;
}

function applySelectedBreaks(allDates: DayInfo[], selectedBreaks: BreakCandidate[]): void {
  // First, mark CTO days
  selectedBreaks.forEach(break_ => {
    break_.days.forEach(day => {
      if (!allDates[day].isWeekend && !allDates[day].isPublicHoliday) {
        allDates[day].isCTO = true;
      }
    });
  });

  // Then, find and mark connected sequences
  let currentSequence: number[] = [];
  let hasCTOInSequence = false;

  for (let i = 0; i < allDates.length; i++) {
    const day = allDates[i];
    const isOffDay = day.isWeekend || day.isPublicHoliday || day.isCTO;

    if (isOffDay) {
      currentSequence.push(i);
      hasCTOInSequence = hasCTOInSequence || day.isCTO;
    } else {
      if (hasCTOInSequence) {
        // Mark all days in sequence as part of break
        currentSequence.forEach(index => {
          allDates[index].isPartOfBreak = true;
        });
      }
      currentSequence = [];
      hasCTOInSequence = false;
    }
  }

  // Handle last sequence
  if (hasCTOInSequence) {
    currentSequence.forEach(index => {
      allDates[index].isPartOfBreak = true;
    });
  }
}

function createMiniBreak(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
  // Look for a sequence of 4-5 workdays that could form a mini break (5-6 days total)
  for (let i = 0; i < allDates.length - 5; i++) {
    if (usedDays.has(i)) continue;

    let isValidSequence = true;
    const sequenceDays: number[] = [];
    let workdayCount = 0;
    let currentIndex = i;

    // Try to find 4-5 consecutive workdays
    while (workdayCount < BREAK_LENGTHS.MINI_BREAK.MAX - 1 && currentIndex < allDates.length) {
      const day = allDates[currentIndex];

      if (usedDays.has(currentIndex) ||
        day.isWeekend ||
        day.isPublicHoliday) {
        isValidSequence = false;
        break;
      }

      sequenceDays.push(currentIndex);
      workdayCount++;
      currentIndex++;

      // Skip weekends
      while (currentIndex < allDates.length &&
      (allDates[currentIndex].isWeekend ||
        allDates[currentIndex].isPublicHoliday)) {
        currentIndex++;
      }
    }

    if (isValidSequence && workdayCount >= BREAK_LENGTHS.MINI_BREAK.MIN - 1) {
      // Include surrounding weekends if available
      let startIdx = sequenceDays[0];
      let endIdx = sequenceDays[sequenceDays.length - 1];

      // Look for weekend before
      while (startIdx > 0 && (allDates[startIdx - 1].isWeekend || allDates[startIdx - 1].isPublicHoliday)) {
        startIdx--;
        sequenceDays.unshift(startIdx);
      }

      // Look for weekend after
      while (endIdx < allDates.length - 1 && (allDates[endIdx + 1].isWeekend || allDates[endIdx + 1].isPublicHoliday)) {
        endIdx++;
        sequenceDays.push(endIdx);
      }

      // Calculate efficiency with position bonuses
      let efficiency = sequenceDays.length / workdayCount;

      // Apply position bonuses
      const startDayOfWeek = allDates[startIdx].date.getDay();
      const endDayOfWeek = allDates[endIdx].date.getDay();

      if (startDayOfWeek === 1 || endDayOfWeek === 5) { // Monday start or Friday end
        efficiency *= POSITION_BONUSES.MONDAY_FRIDAY;
      }

      return {
        type: 'standalone',
        days: sequenceDays,
        ctoDaysUsed: workdayCount,
        efficiency: efficiency,
        length: sequenceDays.length,
      };
    }
  }

  return null;
}

export { optimizeCTODays };