import { addDays, isWeekend, format, parse, getDay, getMonth, differenceInDays } from 'date-fns'
import {
  BREAK_LENGTHS,
  BALANCED_STRATEGY,
  POSITION_BONUSES,
  EFFICIENCY_SCORING,
  SPACING_REQUIREMENTS,
  SEASONAL_WEIGHTS,
  DISTRIBUTION_WEIGHTS
} from './optimizer.constants'

// Keep existing types
export interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday: boolean
  holidayName?: string
  isCustomDayOff: boolean
  customDayName?: string
}

export interface CustomDayOff {
  date: string
  name: string
  isRecurring?: boolean
  startDate?: string
  endDate?: string
  weekday?: number
}

export type OptimizationStrategy = 'balanced' | 'longWeekends' | 'weekLongBreaks' | 'extendedVacations'

export interface StrategyOption {
  id: OptimizationStrategy
  label: string
  description: string
}

export const OPTIMIZATION_STRATEGIES: StrategyOption[] = [
  {
    id: 'balanced',
    label: 'Balanced Mix',
    description: 'A balanced mix of long weekends and longer breaks',
  },
  {
    id: 'longWeekends',
    label: 'Long Weekends',
    description: 'Maximize the number of 3-4 day weekends',
  },
  {
    id: 'weekLongBreaks',
    label: 'Week-long Breaks',
    description: 'Focus on creating 5-7 day breaks',
  },
  {
    id: 'extendedVacations',
    label: 'Extended Vacations',
    description: 'Combine days for longer vacations (8+ days)',
  }
]

// Helper types for DP
interface DPState {
  workdayIndex: number     // Current workday we're considering
  ctoDaysLeft: number      // Number of CTO days left to allocate
  lastBreakEnd: number     // Index where the last break ended
}

interface DPResult {
  score: number           // Score for this allocation
  allocation: number[]    // Indices of workdays chosen for CTO
}

interface WorkDay {
  index: number          // Original index in year array
  date: string
  isWorkday: boolean
  isHoliday: boolean
  holidayName?: string
  isCustomDayOff: boolean
  customDayName?: string
  isWeekend: boolean
}

interface PrecomputedBreakInfo {
  length: number
  startIndex: number
  endIndex: number
  ctoDaysUsed: number
  score: number
}

interface EnhancedBreakInfo extends PrecomputedBreakInfo {
  efficiency: number          // Days off per CTO day
  holidayProximity: number   // Bonus for breaks near holidays
  seasonality: number        // Season-based scoring
  workdayBalance: number     // Distribution across workdays
}

// Add DPStateResult interface at the top with other interfaces
interface DPStateResult {
  score: number
  breaks: EnhancedBreakInfo[]
  totalDaysOff: number
  averageEfficiency: number
  seasonalDistribution: Record<string, number>
}

interface Break {
  startDate: string
  endDate: string
  length: number
  ctoDays: number[]
  score: number
  metrics: {
    efficiency: number        // How well it uses CTO days with existing off days
    distribution: number      // How well it's spaced from other breaks
    seasonality: number       // Time of year preference
    workdayBalance: number    // Balance of work/off days
  }
}

// Update the return type to include breaks
interface OptimizationResult {
  days: OptimizedDay[]
  breaks: Array<{
    startDate: string
    endDate: string
    days: OptimizedDay[]
    totalDays: number
    ctoDays: number
    holidays: number
    weekends: number
    customDaysOff: number
  }>
  stats: {
    totalCTODays: number
    totalHolidays: number
    totalNormalWeekends: number
    totalExtendedWeekends: number
    totalCustomDaysOff: number
    totalDaysOff: number
  }
}

// Add a function to extract breaks from the optimized calendar
const extractBreaks = (days: OptimizedDay[]): OptimizationResult['breaks'] => {
  const breaks: OptimizationResult['breaks'] = []
  let currentBreak: OptimizedDay[] = []

  // Helper to create break info
  const createBreakInfo = (breakDays: OptimizedDay[]) => {
    if (breakDays.length === 0) return null

    // Only create a break if it contains at least one CTO day
    const hasCTO = breakDays.some(day => day.isCTO)
    if (!hasCTO) return null

    return {
      startDate: breakDays[0].date,
      endDate: breakDays[breakDays.length - 1].date,
      days: [...breakDays],
      totalDays: breakDays.length,
      ctoDays: breakDays.filter(d => d.isCTO).length,
      holidays: breakDays.filter(d => d.isHoliday).length,
      weekends: breakDays.filter(d => d.isWeekend).length,
      customDaysOff: breakDays.filter(d => d.isCustomDayOff).length
    }
  }

  // Iterate through days to find breaks
  for (let i = 0; i < days.length; i++) {
    const day = days[i]
    
    if (day.isPartOfBreak) {
      currentBreak.push(day)
    } else if (currentBreak.length > 0) {
      const breakInfo = createBreakInfo(currentBreak)
      if (breakInfo) breaks.push(breakInfo)
      currentBreak = []
    }
  }

  // Handle last break if exists
  if (currentBreak.length > 0) {
    const breakInfo = createBreakInfo(currentBreak)
    if (breakInfo) breaks.push(breakInfo)
  }

  return breaks
}

// Helper functions
const getHolidaysForYear = (year: number): Array<{ date: string; name: string }> => [
  { date: `${year}-01-01`, name: "New Year's Day" },
  { date: `${year}-02-17`, name: 'Family Day' },
  { date: `${year}-04-18`, name: 'Good Friday' },
  { date: `${year}-05-19`, name: 'Victoria Day' },
  { date: `${year}-07-01`, name: 'Canada Day' },
  { date: `${year}-09-01`, name: 'Labour Day' },
  { date: `${year}-10-13`, name: 'Thanksgiving Day' },
  { date: `${year}-11-11`, name: 'Remembrance Day' },
  { date: `${year}-12-25`, name: 'Christmas Day' },
  { date: `${year}-12-26`, name: 'Boxing Day' },
]

const generateCustomDaysOff = (customDaysOff: CustomDayOff[], year: number): Array<{ date: string; name: string }> => {
  const result: Array<{ date: string; name: string }> = []

  customDaysOff.forEach(customDay => {
    if (!customDay.isRecurring) {
      if (customDay.date.startsWith(year.toString())) {
        result.push({ date: customDay.date, name: customDay.name })
      }
      return
    }

    if (customDay.startDate && customDay.endDate && customDay.weekday !== undefined) {
      const start = parse(customDay.startDate, 'yyyy-MM-dd', new Date())
      const end = parse(customDay.endDate, 'yyyy-MM-dd', new Date())
      let current = start

      while (current <= end) {
        if (current.getFullYear() === year && getDay(current) === customDay.weekday) {
          result.push({
            date: format(current, 'yyyy-MM-dd'),
            name: customDay.name
          })
        }
        current = addDays(current, 1)
      }
    }
  })

  return result
}

const generateWorkdayArray = (year: number, customDaysOff: CustomDayOff[] = []): WorkDay[] => {
  const startDate = new Date(year, 0, 1)  // January 1st
  const endDate = new Date(year, 11, 31)  // December 31st
  const holidays = getHolidaysForYear(year)
  const customDays = generateCustomDaysOff(customDaysOff, year)
  const days: WorkDay[] = []

  let currentDate = startDate
  let index = 0

  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const holiday = holidays.find(h => h.date === dateStr)
    const customDay = customDays.find(d => d.date === dateStr)
    
    days.push({
      index,
      date: dateStr,
      isWeekend: isWeekend(currentDate),
      isHoliday: !!holiday,
      holidayName: holiday?.name,
      isCustomDayOff: !!customDay,
      customDayName: customDay?.name,
      isWorkday: !isWeekend(currentDate) && !holiday && !customDay
    })

    currentDate = addDays(currentDate, 1)
    index++
  }

  return days
}

const calculateBreakScore = (
  days: WorkDay[],
  ctoIndices: number[],
  strategy: OptimizationStrategy
): number => {
  let score = 0
  const breaks: Array<{ length: number; startIndex: number }> = []
  let currentBreak = 0
  let currentBreakStart = -1
  let lastDayOff = -2

  // Helper to check if a day is off
  const isDayOff = (index: number) => {
    const day = days[index]
    return day.isWeekend || day.isHoliday || day.isCustomDayOff || ctoIndices.includes(index)
  }

  // Helper to check if a break contains a CTO day
  const breakContainsCTO = (startIdx: number, length: number) => {
    for (let i = startIdx; i < startIdx + length; i++) {
      if (ctoIndices.includes(i)) return true
    }
    return false
  }

  // Calculate break lengths and their values
  for (let i = 0; i < days.length; i++) {
    if (isDayOff(i)) {
      if (i === lastDayOff + 1) {
        currentBreak++
      } else {
        if (currentBreak > 0 && breakContainsCTO(currentBreakStart, currentBreak)) {
          breaks.push({ length: currentBreak, startIndex: currentBreakStart })
        }
        currentBreak = 1
        currentBreakStart = i
      }
      lastDayOff = i
    } else {
      if (currentBreak > 0 && breakContainsCTO(currentBreakStart, currentBreak)) {
        breaks.push({ length: currentBreak, startIndex: currentBreakStart })
      }
      currentBreak = 0
      currentBreakStart = -1
    }
  }
  if (currentBreak > 0 && breakContainsCTO(currentBreakStart, currentBreak)) {
    breaks.push({ length: currentBreak, startIndex: currentBreakStart })
  }

  // Score breaks based on strategy
  breaks.forEach((breakInfo, index) => {
    let breakScore = breakInfo.length

    // Base score calculation based on strategy
    switch (strategy) {
      case 'longWeekends':
        if (breakInfo.length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && 
            breakInfo.length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.LONG_WEEKEND.SCORE_MULTIPLIER
        } else if (breakInfo.length > BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.LONG_WEEKEND.PENALTY_MULTIPLIER
        }
        break

      case 'weekLongBreaks':
        if (breakInfo.length >= BREAK_LENGTHS.WEEK_LONG.MIN && 
            breakInfo.length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.WEEK_LONG.SCORE_MULTIPLIER
        } else if (breakInfo.length > BREAK_LENGTHS.WEEK_LONG.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.WEEK_LONG.PENALTY_MULTIPLIER
        }
        break

      case 'extendedVacations':
        if (breakInfo.length >= BREAK_LENGTHS.EXTENDED.MIN && 
            breakInfo.length <= BREAK_LENGTHS.EXTENDED.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.EXTENDED.SCORE_MULTIPLIER
        } else if (breakInfo.length < BREAK_LENGTHS.EXTENDED.MIN) {
          breakScore = breakInfo.length * BREAK_LENGTHS.EXTENDED.PENALTY_MULTIPLIER
        }
        break

      case 'balanced':
        if (breakInfo.length >= BREAK_LENGTHS.EXTENDED.MIN && 
            breakInfo.length <= BREAK_LENGTHS.EXTENDED.MAX) {
          breakScore = breakInfo.length * BALANCED_STRATEGY.EXTENDED_MULTIPLIER
        } else if (breakInfo.length >= BREAK_LENGTHS.WEEK_LONG.MIN && 
                   breakInfo.length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
          breakScore = breakInfo.length * BALANCED_STRATEGY.WEEK_LONG_MULTIPLIER
        } else if (breakInfo.length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && 
                   breakInfo.length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          breakScore = breakInfo.length * BALANCED_STRATEGY.LONG_WEEKEND_MULTIPLIER
        }
        break
    }

    // Add efficiency bonus - more days off per CTO day used
    const ctoDaysInBreak = ctoIndices.filter(idx => 
      idx >= breakInfo.startIndex && idx < breakInfo.startIndex + breakInfo.length
    ).length
    const efficiency = breakInfo.length / ctoDaysInBreak
    breakScore *= Math.min(efficiency, EFFICIENCY_SCORING.MAX_MULTIPLIER)

    // Add position-based bonuses
    const dayOfWeek = getDay(parse(days[breakInfo.startIndex].date, 'yyyy-MM-dd', new Date()))
    const isMonFri = dayOfWeek === 1 || dayOfWeek === 5

    // Position bonuses based on strategy
    if (strategy === 'longWeekends' && isMonFri) {
      breakScore *= POSITION_BONUSES.MONDAY_FRIDAY
    }

    score += breakScore
  })

  return score
}

const calculateSeasonalityScore = (date: string): number => {
  const month = getMonth(parse(date, 'yyyy-MM-dd', new Date()))
  
  // Summer (June-August)
  if (month >= 5 && month <= 7) return SEASONAL_WEIGHTS.SUMMER
  
  // Winter holidays (December-January)
  if (month === 11 || month === 0) return SEASONAL_WEIGHTS.WINTER_HOLIDAY
  
  // Fall (September-October)
  if (month >= 8 && month <= 9) return SEASONAL_WEIGHTS.FALL
  
  // Spring (March-May)
  if (month >= 2 && month <= 4) return SEASONAL_WEIGHTS.SPRING
  
  // Regular winter
  return SEASONAL_WEIGHTS.WINTER
}

const calculateHolidayProximity = (
  days: WorkDay[],
  startIndex: number,
  endIndex: number
): number => {
  let score = 1.0
  const range = POSITION_BONUSES.NEAR_HOLIDAY_RANGE

  // Check before the break
  for (let i = Math.max(0, startIndex - range); i < startIndex; i++) {
    if (days[i]?.isHoliday) {
      score *= 1.2  // 20% bonus for each nearby holiday
    }
  }

  // Check after the break
  for (let i = endIndex + 1; i <= Math.min(days.length - 1, endIndex + range); i++) {
    if (days[i]?.isHoliday) {
      score *= 1.2
    }
  }

  return score
}

const calculateWorkdayBalance = (
  days: WorkDay[],
  startIndex: number,
  endIndex: number
): number => {
  const workdaysInBreak = days
    .slice(startIndex, endIndex + 1)
    .filter(d => !d.isWeekend && !d.isHoliday && !d.isCustomDayOff)
    .length

  const totalDays = endIndex - startIndex + 1
  const ratio = workdaysInBreak / totalDays
  
  // Prefer breaks that have a good balance of workdays to off days
  return ratio >= 0.4 && ratio <= 0.6 ? 1.2 : 1.0
}

const calculateWeekendEfficiency = (
  days: WorkDay[],
  startIndex: number,
  endIndex: number
): number => {
  // Find if we're using both Friday and Monday around a weekend
  let hasFriday = false
  let hasMonday = false
  let hasWeekend = false
  
  for (let i = startIndex; i <= endIndex; i++) {
    const dayOfWeek = getDay(parse(days[i].date, 'yyyy-MM-dd', new Date()))
    if (dayOfWeek === 5) hasFriday = true  // Friday
    if (dayOfWeek === 1) hasMonday = true  // Monday
    if (dayOfWeek === 0 || dayOfWeek === 6) hasWeekend = true  // Weekend
  }

  // If we're using both Friday and Monday around a weekend, apply a penalty
  // This encourages splitting these days across different weekends
  if (hasFriday && hasMonday && hasWeekend) {
    return 0.8  // 20% penalty for inefficient weekend usage
  }

  // Bonus for efficient weekend usage (just Friday or just Monday)
  if ((hasFriday || hasMonday) && hasWeekend) {
    return 1.2  // 20% bonus for efficient weekend usage
  }

  return 1.0
}

const calculateBreakEfficiency = (
  days: WorkDay[],
  startIndex: number,
  endIndex: number,
  ctoDaysUsed: number
): number => {
  let consecutiveOffDays = 0
  let consecutiveCTODays = 0
  let lastWasCTO = false
  let weekendBonus = 1.0
  let holidayBonus = 1.0

  for (let i = startIndex; i <= endIndex; i++) {
    const day = days[i]
    const isCTO = i >= startIndex && i < startIndex + ctoDaysUsed
    
    if (isCTO) {
      if (lastWasCTO) {
        consecutiveCTODays++
        // Apply consecutive CTO penalty
        return EFFICIENCY_SCORING.CONSECUTIVE_PENALTY
      }
      lastWasCTO = true
    } else {
      if (day.isWeekend) {
        weekendBonus = EFFICIENCY_SCORING.WEEKEND_BONUS
      }
      if (day.isHoliday) {
        holidayBonus = EFFICIENCY_SCORING.HOLIDAY_BONUS
      }
      if (day.isWeekend || day.isHoliday || day.isCustomDayOff) {
        consecutiveOffDays++
      }
      lastWasCTO = false
    }
  }

  // Calculate base efficiency
  const totalDaysOff = endIndex - startIndex + 1
  const baseEfficiency = totalDaysOff / ctoDaysUsed

  // Apply bonuses for efficient usage
  if (consecutiveCTODays === 0 && consecutiveOffDays > 0) {
    return Math.min(
      baseEfficiency * weekendBonus * holidayBonus,
      EFFICIENCY_SCORING.MAX_MULTIPLIER
    )
  }

  return Math.min(baseEfficiency, EFFICIENCY_SCORING.MAX_MULTIPLIER)
}

const calculatePositionBonus = (
  days: WorkDay[],
  startIndex: number,
  endIndex: number
): number => {
  const startDay = getDay(parse(days[startIndex].date, 'yyyy-MM-dd', new Date()))
  const endDay = getDay(parse(days[endIndex].date, 'yyyy-MM-dd', new Date()))
  
  let bonus = 1.0

  // Check for optimal long weekend positions
  if (startDay === 1 || endDay === 5) { // Monday or Friday
    bonus *= POSITION_BONUSES.MONDAY_FRIDAY
  }

  // Check for Thursday-Friday combinations
  if (startDay === 4 || (startDay === 5 && endDay >= 5)) {
    bonus *= POSITION_BONUSES.THURSDAY_FRIDAY
  }

  // Check for Monday-Tuesday combinations
  if (startDay === 1 || (startDay <= 1 && endDay === 2)) {
    bonus *= POSITION_BONUSES.MONDAY_TUESDAY
  }

  // Check for holiday proximity
  const range = POSITION_BONUSES.NEAR_HOLIDAY_RANGE
  for (let i = Math.max(0, startIndex - range); i <= Math.min(days.length - 1, endIndex + range); i++) {
    if (days[i].isHoliday) {
      bonus *= POSITION_BONUSES.HOLIDAY_MULTIPLIER
      break
    }
  }

  return bonus
}

// Helper function to check if a weekend is truly extended
const isExtendedWeekend = (
  days: OptimizedDay[],
  weekendStartIndex: number
): boolean => {
  if (weekendStartIndex < 0 || weekendStartIndex >= days.length - 1) return false
  
  const saturday = days[weekendStartIndex]
  const sunday = days[weekendStartIndex + 1]
  const friday = weekendStartIndex > 0 ? days[weekendStartIndex - 1] : null
  const monday = weekendStartIndex < days.length - 2 ? days[weekendStartIndex + 2] : null

  // Verify this is actually a weekend pair
  if (!saturday.isWeekend || !sunday.isWeekend) return false
  if (new Date(saturday.date).getDay() !== 6) return false // Must start with Saturday

  // A weekend is extended if it's connected to:
  // 1. A CTO day on Friday or Monday
  // 2. A holiday on Friday or Monday
  // 3. A custom day off on Friday or Monday
  return !!(
    (friday && (friday.isCTO || friday.isHoliday || friday.isCustomDayOff)) ||
    (monday && (monday.isCTO || monday.isHoliday || monday.isCustomDayOff))
  )
}

// Helper function to check if break length is valid for strategy
const isValidBreakForStrategy = (length: number, strategy: OptimizationStrategy): boolean => {
  return (
    (strategy === 'longWeekends' && 
     length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && 
     length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) ||
    (strategy === 'weekLongBreaks' && 
     length >= BREAK_LENGTHS.WEEK_LONG.MIN && 
     length <= BREAK_LENGTHS.WEEK_LONG.MAX) ||
    (strategy === 'extendedVacations' && 
     length >= BREAK_LENGTHS.EXTENDED.MIN && 
     length <= BREAK_LENGTHS.EXTENDED.MAX) ||
    (strategy === 'balanced')
  )
}

const findOptimalAllocation = (
  days: WorkDay[],
  numberOfDays: number,
  strategy: OptimizationStrategy
): number[] => {
  // 1. Initial validation
  const workdays = days.map((day, index) => ({ day, index }))
    .filter(({ day }) => day.isWorkday)
  
  if (workdays.length < numberOfDays) {
    throw new Error(`Not enough workdays available. Need ${numberOfDays} but only have ${workdays.length}`)
  }

  // 2. Helper functions for break evaluation
  const isOffDay = (index: number) => {
    const day = days[index]
    return day.isWeekend || day.isHoliday || day.isCustomDayOff
  }

  const getBreakLength = (startIdx: number, endIdx: number) => {
    let length = 0
    for (let i = startIdx; i <= endIdx; i++) {
      if (i >= 0 && i < days.length) length++
    }
    return length
  }

  const evaluateBreakEfficiency = (startIdx: number, endIdx: number, ctoDays: number[]) => {
    const totalLength = getBreakLength(startIdx, endIdx)
    const offDays = Array.from({ length: totalLength }, (_, i) => startIdx + i)
      .filter(i => isOffDay(i)).length
    return (totalLength) / (ctoDays.length || 1)
  }

  const evaluateDistribution = (date: string, existingBreaks: Break[], length: number): number => {
    const currentDate = parse(date, 'yyyy-MM-dd', new Date())
    let score = 1.0

    // Get minimum spacing requirement based on break length
    const getMinSpacing = (breakLength: number): number => {
      if (breakLength >= BREAK_LENGTHS.EXTENDED.MIN) {
        return SPACING_REQUIREMENTS.EXTENDED_MIN_DAYS
      } else if (breakLength >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        return SPACING_REQUIREMENTS.WEEK_LONG_MIN_DAYS
      } else if (breakLength >= BREAK_LENGTHS.MINI_BREAK.MIN) {
        return SPACING_REQUIREMENTS.MINI_BREAK_MIN_DAYS
      } else {
        return SPACING_REQUIREMENTS.LONG_WEEKEND_MIN_DAYS
      }
    }

    // Get spacing multiplier based on break length
    const getSpacingMultiplier = (breakLength: number): number => {
      if (breakLength >= BREAK_LENGTHS.EXTENDED.MIN) {
        return SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.EXTENDED
      } else if (breakLength >= BREAK_LENGTHS.WEEK_LONG.MIN) {
        return SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.WEEK_LONG
      } else if (breakLength >= BREAK_LENGTHS.MINI_BREAK.MIN) {
        return SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.MINI_BREAK
      } else {
        return SPACING_REQUIREMENTS.MIN_SCORE_MULTIPLIER.LONG_WEEKEND
      }
    }

    const minSpacing = getMinSpacing(length)
    const multiplier = getSpacingMultiplier(length)

    for (const existing of existingBreaks) {
      const existingStart = parse(existing.startDate, 'yyyy-MM-dd', new Date())
      const daysBetween = Math.abs(differenceInDays(currentDate, existingStart))
      
      // Apply spacing requirements
      if (daysBetween < minSpacing) {
        score *= multiplier * (daysBetween / minSpacing)
      } else if (daysBetween < minSpacing * 1.5) {
        score *= 0.9
      } else if (daysBetween > minSpacing * 3) {
        score *= SPACING_REQUIREMENTS.OPTIMAL_SPACING_BONUS
      }

      // Additional penalties for similar length breaks being too close
      if (Math.abs(existing.length - length) <= 2) {
        if (daysBetween < minSpacing * 2) {
          score *= SPACING_REQUIREMENTS.SIMILAR_BREAK_PENALTY
        }
      }
    }

    return score
  }

  const evaluateSeasonality = (startDate: string, endDate: string) => {
    const startMonth = getMonth(parse(startDate, 'yyyy-MM-dd', new Date()))
    const endMonth = getMonth(parse(endDate, 'yyyy-MM-dd', new Date()))
    
    // Prefer summer and winter holidays
    const score = (month: number) => {
      if (month >= 5 && month <= 7) return 1.3  // Summer premium
      if (month === 11 || month === 0) return 1.2  // Winter holidays
      if (month >= 8 && month <= 9) return 1.1  // Fall
      return 1.0  // Spring
    }

    return Math.max(score(startMonth), score(endMonth))
  }

  // 3. Generate potential breaks
  const generatePotentialBreak = (startWorkdayIdx: number, numCtoDays: number): Break | null => {
    if (startWorkdayIdx >= workdays.length) return null
    
    const startIndex = workdays[startWorkdayIdx].index
    const ctoDays: number[] = []
    let endIndex = startIndex

    // Collect CTO days and find break end
    for (let i = 0; i < numCtoDays && startWorkdayIdx + i < workdays.length; i++) {
      const workdayIndex = workdays[startWorkdayIdx + i].index
      ctoDays.push(workdayIndex)
      endIndex = Math.max(endIndex, workdayIndex)
    }

    // Extend break to include connected off days
    let extendedStart = startIndex
    let extendedEnd = endIndex

    // Look backward
    while (extendedStart > 0 && isOffDay(extendedStart - 1)) {
      extendedStart--
    }

    // Look forward
    while (extendedEnd < days.length - 1 && isOffDay(extendedEnd + 1)) {
      extendedEnd++
    }

    const length = getBreakLength(extendedStart, extendedEnd)
    
    if (!isValidBreakForStrategy(length, strategy)) return null

    const metrics = {
      efficiency: evaluateBreakEfficiency(extendedStart, extendedEnd, ctoDays),
      distribution: 1.0,  // Will be calculated later
      seasonality: evaluateSeasonality(days[extendedStart].date, days[extendedEnd].date),
      workdayBalance: ctoDays.length / length
    }

    // Calculate base score based on strategy
    let baseScore = length
    const positionBonus = calculatePositionBonus(days, extendedStart, extendedEnd)

    switch (strategy) {
      case 'longWeekends':
        baseScore *= length <= BREAK_LENGTHS.LONG_WEEKEND.MAX ? 
          BREAK_LENGTHS.LONG_WEEKEND.SCORE_MULTIPLIER : 
          BREAK_LENGTHS.LONG_WEEKEND.PENALTY_MULTIPLIER
        break
      case 'weekLongBreaks':
        baseScore *= length <= BREAK_LENGTHS.WEEK_LONG.MAX ? 
          BREAK_LENGTHS.WEEK_LONG.SCORE_MULTIPLIER : 
          BREAK_LENGTHS.WEEK_LONG.PENALTY_MULTIPLIER
        break
      case 'extendedVacations':
        baseScore *= length >= BREAK_LENGTHS.EXTENDED.MIN ? 
          BREAK_LENGTHS.EXTENDED.SCORE_MULTIPLIER : 
          BREAK_LENGTHS.EXTENDED.PENALTY_MULTIPLIER
        break
      case 'balanced':
        if (length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          baseScore *= BALANCED_STRATEGY.LONG_WEEKEND_MULTIPLIER * DISTRIBUTION_WEIGHTS.LONG_WEEKENDS
        } else if (length <= BREAK_LENGTHS.MINI_BREAK.MAX) {
          baseScore *= BALANCED_STRATEGY.MINI_BREAK_MULTIPLIER * DISTRIBUTION_WEIGHTS.MINI_BREAKS
        } else if (length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
          baseScore *= BALANCED_STRATEGY.WEEK_LONG_MULTIPLIER * DISTRIBUTION_WEIGHTS.WEEK_LONG_BREAKS
        } else {
          baseScore *= BALANCED_STRATEGY.EXTENDED_MULTIPLIER * DISTRIBUTION_WEIGHTS.EXTENDED_BREAKS
        }
        break
    }

    return {
      startDate: days[extendedStart].date,
      endDate: days[extendedEnd].date,
      length,
      ctoDays,
      score: baseScore * metrics.efficiency * metrics.seasonality * metrics.workdayBalance * positionBonus,
      metrics
    }
  }

  // 4. Dynamic Programming for optimal allocation
  const memo = new Map<string, { breaks: Break[], score: number }>()
  
  const findBestAllocation = (remainingDays: number, startIdx: number, existingBreaks: Break[]): { breaks: Break[], score: number } => {
    const key = `${remainingDays}_${startIdx}`
    if (memo.has(key)) return memo.get(key)!
    
    if (remainingDays === 0) return { breaks: [], score: 0 }
    if (startIdx >= workdays.length) return { breaks: [], score: -Infinity }

    let bestResult = { breaks: [] as Break[], score: -Infinity }

    // Try different break lengths at current position
    for (let ctoDaysUsed = 1; ctoDaysUsed <= Math.min(remainingDays, 5); ctoDaysUsed++) {
      const currentBreak = generatePotentialBreak(startIdx, ctoDaysUsed)
      if (!currentBreak) continue

      // Update distribution score based on existing breaks and break length
      currentBreak.metrics.distribution = evaluateDistribution(
        currentBreak.startDate, 
        existingBreaks,
        currentBreak.length
      )
      currentBreak.score *= currentBreak.metrics.distribution

      // Skip if the distribution score is too low (break is too close to others)
      if (currentBreak.metrics.distribution < 0.3) continue

      const subResult = findBestAllocation(
        remainingDays - ctoDaysUsed,
        startIdx + ctoDaysUsed,
        [...existingBreaks, currentBreak]
      )

      if (subResult.score >= 0) {
        const totalScore = currentBreak.score + subResult.score
        if (totalScore > bestResult.score) {
          bestResult = {
            breaks: [currentBreak, ...subResult.breaks],
            score: totalScore
          }
        }
      }
    }

    // Try skipping current position
    const skipResult = findBestAllocation(remainingDays, startIdx + 1, existingBreaks)
    if (skipResult.score > bestResult.score) {
      bestResult = skipResult
    }

    memo.set(key, bestResult)
    return bestResult
  }

  // 5. Find and validate optimal solution
  const solution = findBestAllocation(numberOfDays, 0, [])
  
  if (solution.score === -Infinity) {
    throw new Error('Could not find valid break allocation')
  }

  // Collect and validate CTO days
  const ctoIndices = new Set<number>()
  solution.breaks.forEach(breakInfo => {
    breakInfo.ctoDays.forEach(day => ctoIndices.add(day))
  })

  if (ctoIndices.size !== numberOfDays) {
    throw new Error(`Invalid solution: Generated ${ctoIndices.size} CTO days but should be exactly ${numberOfDays}`)
  }

  return Array.from(ctoIndices).sort((a, b) => a - b)
}

// Update markBreakPeriods to better handle weekend classification
const markBreakPeriods = (days: OptimizedDay[]): OptimizedDay[] => {
  const result = [...days]
  
  // First pass: mark breaks starting from CTO days, holidays, and custom days off
  for (let i = 0; i < days.length; i++) {
    const day = days[i]
    
    if (day.isCTO || day.isHoliday || day.isCustomDayOff) {
      let startIdx = i
      let endIdx = i

      // Look backward
      while (startIdx > 0) {
        const prevDay = days[startIdx - 1]
        if (prevDay.isWeekend || prevDay.isHoliday || prevDay.isCustomDayOff || prevDay.isCTO) {
          startIdx--
        } else {
          break
        }
      }

      // Look forward
      while (endIdx < days.length - 1) {
        const nextDay = days[endIdx + 1]
        if (nextDay.isWeekend || nextDay.isHoliday || nextDay.isCustomDayOff || nextDay.isCTO) {
          endIdx++
        } else {
          break
        }
      }

      // Mark the break
      for (let j = startIdx; j <= endIdx; j++) {
        result[j] = { ...result[j], isPartOfBreak: true }
      }
      
      i = endIdx
    }
  }

  // Second pass: handle weekend pairs
  for (let i = 0; i < result.length - 1; i++) {
    const date = new Date(result[i].date)
    if (date.getDay() === 6) { // If it's a Saturday
      const isExtended = isExtendedWeekend(result, i)
      
      // Only mark as part of break if it's truly extended
      result[i].isPartOfBreak = isExtended
      result[i + 1].isPartOfBreak = isExtended
    }
  }

  // Final validation pass
  for (let i = 0; i < result.length - 1; i++) {
    const date = new Date(result[i].date)
    if (date.getDay() === 6) { // If it's a Saturday
      const saturday = result[i]
      const sunday = result[i + 1]
      
      // If it's just a regular weekend (not extended), ensure it's not marked as part of break
      if (!isExtendedWeekend(result, i)) {
        saturday.isPartOfBreak = false
        sunday.isPartOfBreak = false
      }
    }
  }

  return result
}

interface ScoringParameters {
  breakLengthMultiplier: number
  efficiencyMultiplier: number
  distributionPenaltyDivisor: number
  longWeekendBonus: number
  weekLongBreakBonus: number
  extendedVacationBonus: number
  holidayProximityBonus: number
  seasonalityMultiplier: number
}

const DEFAULT_SCORING_PARAMS: ScoringParameters = {
  breakLengthMultiplier: 2,
  efficiencyMultiplier: 3,
  distributionPenaltyDivisor: 10,
  longWeekendBonus: 5,
  weekLongBreakBonus: 5,
  extendedVacationBonus: 10,
  holidayProximityBonus: 2,
  seasonalityMultiplier: 1.5
}

// Update evaluateSolution to use scoring parameters
const evaluateSolution = (
  days: OptimizedDay[],
  breaks: OptimizationResult['breaks'],
  strategy: OptimizationStrategy,
  params: ScoringParameters = DEFAULT_SCORING_PARAMS
): number => {
  let score = 0

  // Score based on break lengths and efficiency
  score += breaks.reduce((sum, breakPeriod) => {
    const lengthScore = breakPeriod.totalDays * params.breakLengthMultiplier
    const efficiencyScore = (breakPeriod.totalDays / breakPeriod.ctoDays) * params.efficiencyMultiplier
    
    // Add bonus for breaks near holidays
    const hasHoliday = breakPeriod.holidays > 0
    const holidayBonus = hasHoliday ? params.holidayProximityBonus * breakPeriod.holidays : 0
    
    return sum + lengthScore + efficiencyScore + holidayBonus
  }, 0)

  // Score based on distribution
  const breakGaps = []
  for (let i = 1; i < breaks.length; i++) {
    const prevEnd = new Date(breaks[i - 1].endDate)
    const currentStart = new Date(breaks[i].startDate)
    breakGaps.push((currentStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  const idealGap = 365 / (breaks.length + 1)
  score -= breakGaps.reduce((sum, gap) => {
    return sum + Math.abs(gap - idealGap) / params.distributionPenaltyDivisor
  }, 0)

  // Add seasonality scoring
  breaks.forEach(breakPeriod => {
    const date = new Date(breakPeriod.startDate)
    const month = date.getMonth()
    
    // Bonus for summer and winter holidays
    if ((month >= 5 && month <= 7) || (month === 11 || month === 0)) {
      score += breakPeriod.totalDays * params.seasonalityMultiplier
    }
  })

  // Strategy-specific scoring
  switch (strategy) {
    case 'longWeekends':
      score += breaks.filter(b => b.totalDays <= 4).length * params.longWeekendBonus
      break
    case 'weekLongBreaks':
      score += breaks.filter(b => b.totalDays >= 5 && b.totalDays <= 9).length * params.weekLongBreakBonus
      break
    case 'extendedVacations':
      score += breaks.filter(b => b.totalDays >= 10).length * params.extendedVacationBonus
      break
  }

  return score
}

// Function to generate parameter variations
const generateParameterVariations = (baseParams: ScoringParameters): ScoringParameters[] => {
  const variations: ScoringParameters[] = [baseParams]
  
  // Generate variations with different emphasis
  variations.push({
    ...baseParams,
    breakLengthMultiplier: 3,
    efficiencyMultiplier: 4,
    distributionPenaltyDivisor: 8
  })
  
  variations.push({
    ...baseParams,
    holidayProximityBonus: 3,
    seasonalityMultiplier: 2,
    distributionPenaltyDivisor: 12
  })
  
  variations.push({
    ...baseParams,
    longWeekendBonus: 7,
    weekLongBreakBonus: 7,
    extendedVacationBonus: 12
  })
  
  variations.push({
    ...baseParams,
    breakLengthMultiplier: 2.5,
    efficiencyMultiplier: 3.5,
    holidayProximityBonus: 2.5,
    seasonalityMultiplier: 1.75
  })

  return variations
}

// Add healing mechanisms
const fixCTODayCount = (
  days: OptimizedDay[],
  targetCount: number,
  strategy: OptimizationStrategy
): OptimizedDay[] => {
  const currentCount = days.filter(day => day.isCTO).length
  if (currentCount === targetCount) return days

  const result = [...days]
  
  if (currentCount > targetCount) {
    // Need to remove some CTO days
    // Remove CTO days that contribute least to breaks
    const daysWithBreaks = markBreakPeriods(result)
    const breaks = extractBreaks(daysWithBreaks)
    
    // Score each CTO day based on its contribution
    const ctoDayScores = result.map((day, index) => {
      if (!day.isCTO) return { index, score: -1 }
      
      // Calculate how much this CTO day contributes to breaks
      const withoutThisDay = [...result]
      withoutThisDay[index] = { ...withoutThisDay[index], isCTO: false }
      const breaksWithout = extractBreaks(markBreakPeriods(withoutThisDay))
      
      const currentScore = evaluateSolution(result, breaks, strategy)
      const scoreWithout = evaluateSolution(withoutThisDay, breaksWithout, strategy)
      
      return { index, score: currentScore - scoreWithout }
    })

    // Sort by contribution and remove least valuable CTO days
    const toRemove = ctoDayScores
      .filter(s => s.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, currentCount - targetCount)
      .map(s => s.index)

    toRemove.forEach(index => {
      result[index] = { ...result[index], isCTO: false }
    })
  } else {
    // Need to add more CTO days
    // Find best workdays to convert to CTO days
    const workdays = result
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => 
        !day.isCTO && 
        !day.isWeekend && 
        !day.isHoliday && 
        !day.isCustomDayOff
      )

    // Score each potential CTO day position
    const candidateScores = workdays.map(({ day, index }) => {
      const withNewDay = [...result]
      withNewDay[index] = { ...withNewDay[index], isCTO: true }
      const breaksWithNew = extractBreaks(markBreakPeriods(withNewDay))
      const score = evaluateSolution(withNewDay, breaksWithNew, strategy)
      return { index, score }
    })

    // Add CTO days at best positions
    candidateScores
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount - currentCount)
      .forEach(({ index }) => {
        result[index] = { ...result[index], isCTO: true }
      })
  }

  return markBreakPeriods(result)
}

// Update optimizeSolution to use healing instead of validation
const optimizeSolution = (
  days: OptimizedDay[],
  breaks: OptimizationResult['breaks'],
  strategy: OptimizationStrategy,
  numberOfDays: number,
  maxPasses: number = 3
): { days: OptimizedDay[]; breaks: OptimizationResult['breaks'] } => {
  // Ensure initial state is correct
  let currentDays = fixCTODayCount(days, numberOfDays, strategy)
  let currentBreaks = extractBreaks(currentDays)

  const parameterVariations = generateParameterVariations(DEFAULT_SCORING_PARAMS)
  let bestDays = currentDays
  let bestBreaks = currentBreaks
  let bestScore = evaluateSolution(currentDays, currentBreaks, strategy)
  let bestParams = DEFAULT_SCORING_PARAMS

  // Try each parameter variation
  for (const params of parameterVariations) {
    currentDays = [...bestDays]
    currentBreaks = [...bestBreaks]
    let currentScore = evaluateSolution(currentDays, currentBreaks, strategy, params)

    for (let pass = 0; pass < maxPasses; pass++) {
      let improvedInPass = false

      // Try moving each CTO day to nearby positions
      for (let i = 0; i < currentDays.length; i++) {
        if (!currentDays[i].isCTO) continue

        // Try different ranges based on strategy
        const offsets = strategy === 'longWeekends' 
          ? [-3, -2, -1, 1, 2, 3]
          : [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]

        for (const offset of offsets) {
          const newPos = i + offset
          if (newPos < 0 || newPos >= currentDays.length) continue
          
          if (currentDays[newPos].isWeekend || currentDays[newPos].isHoliday || 
              currentDays[newPos].isCustomDayOff || currentDays[newPos].isCTO) continue

          const newDays = [...currentDays]
          newDays[i] = { ...newDays[i], isCTO: false, isPartOfBreak: false }
          newDays[newPos] = { ...newDays[newPos], isCTO: true }

          // Ensure CTO day count is correct after move
          const daysWithBreaks = markBreakPeriods(newDays)
          const fixedDays = fixCTODayCount(daysWithBreaks, numberOfDays, strategy)
          const newBreaks = extractBreaks(fixedDays)
          const newScore = evaluateSolution(fixedDays, newBreaks, strategy, params)

          if (newScore > currentScore) {
            currentScore = newScore
            currentDays = fixedDays
            currentBreaks = newBreaks
            improvedInPass = true
          }
        }
      }

      // Ensure we maintain correct CTO day count after each pass
      currentDays = fixCTODayCount(currentDays, numberOfDays, strategy)
      currentBreaks = extractBreaks(currentDays)

      if (!improvedInPass) break
    }

    // Update best solution if current parameter set produced better results
    if (currentScore > bestScore) {
      bestScore = currentScore
      bestDays = currentDays
      bestBreaks = currentBreaks
      bestParams = params
    }
  }

  // Ensure final solution has correct CTO day count
  bestDays = fixCTODayCount(bestDays, numberOfDays, strategy)
  bestBreaks = extractBreaks(bestDays)

  return { days: bestDays, breaks: bestBreaks }
}

// Update the main export function
export const optimizeCtoDays = (
  numberOfDays: number,
  strategy: OptimizationStrategy,
  year: number = new Date().getFullYear(),
  customDaysOff: CustomDayOff[] = []
): OptimizationResult => {
  // Input validation
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Generate workday array
  const workdays = generateWorkdayArray(year, customDaysOff)

  // Validate we have enough workdays
  const availableWorkdays = workdays.filter(d => d.isWorkday).length
  if (availableWorkdays < numberOfDays) {
    throw new Error(
      `Not enough workdays available in ${year}. Requested ${numberOfDays} days but only ${availableWorkdays} workdays available.`
    )
  }

  // Find optimal allocation
  const allocation = findOptimalAllocation(workdays, numberOfDays, strategy)

  // Convert workdays and allocation to OptimizedDay[]
  const optimizedDays: OptimizedDay[] = workdays.map((day, index) => ({
    date: day.date,
    isWeekend: day.isWeekend,
    isCTO: allocation.includes(index),
    isPartOfBreak: false,
    isHoliday: day.isHoliday,
    holidayName: day.holidayName,
    isCustomDayOff: day.isCustomDayOff,
    customDayName: day.customDayName
  }))

  // Ensure initial state is correct
  const fixedOptimizedDays = fixCTODayCount(optimizedDays, numberOfDays, strategy)
  const daysWithBreaks = markBreakPeriods(fixedOptimizedDays)
  const initialBreaks = extractBreaks(daysWithBreaks)

  // Post-processing optimization
  const { days: optimizedSolution, breaks: optimizedBreaks } = optimizeSolution(
    daysWithBreaks,
    initialBreaks,
    strategy,
    numberOfDays
  )

  // Validate and fix any incorrectly marked weekends
  const validatedDays = markBreakPeriods(optimizedSolution)
  const validatedBreaks = extractBreaks(validatedDays)

  // Calculate statistics with strict weekend classification
  const stats = {
    totalCTODays: numberOfDays,
    totalHolidays: validatedDays.filter(day => day.isHoliday).length,
    totalNormalWeekends: validatedDays.filter((day, index) => {
      if (!day.isWeekend) return false
      const date = new Date(day.date)
      if (date.getDay() !== 6) return false // Only count Saturdays to avoid double counting
      return !isExtendedWeekend(validatedDays, index)
    }).length,
    totalExtendedWeekends: validatedDays.filter((day, index) => {
      if (!day.isWeekend) return false
      const date = new Date(day.date)
      if (date.getDay() !== 6) return false // Only count Saturdays to avoid double counting
      return isExtendedWeekend(validatedDays, index)
    }).length,
    totalCustomDaysOff: validatedDays.filter(day => day.isCustomDayOff).length,
    totalDaysOff: validatedBreaks.reduce((total, breakPeriod) => total + breakPeriod.totalDays, 0)
  }

  return { 
    days: validatedDays,
    breaks: validatedBreaks,
    stats
  }
} 