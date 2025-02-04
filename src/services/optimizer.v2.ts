import { addDays, isWeekend, format, parse, getDay, getMonth, differenceInDays } from 'date-fns'

// Types
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

interface Break {
  startDate: string
  endDate: string
  days: number[]
  score: number
  metrics: {
    efficiency: number
    seasonality: number
    distribution: number
    connectivity: number
    weekendUtilization: number
  }
}

// Add new type for memoization
interface MemoKey {
  remainingDays: number
  startIdx: number
  lastBreakEnd?: number
}

// Cache for break scores
const breakScoreCache = new Map<string, Break>()

// Scoring constants
const SCORING = {
  BREAK_LENGTH: {
    MINI: { MIN: 2, MAX: 4, MULTIPLIER: 1.0 },
    WEEK: { MIN: 5, MAX: 9, MULTIPLIER: 1.2 },
    EXTENDED: { MIN: 10, MAX: 16, MULTIPLIER: 1.4 }
  },
  SEASONALITY: {
    SUMMER: { MONTHS: [5, 6, 7], MULTIPLIER: 1.3 },    // June-August
    WINTER: { MONTHS: [11, 0, 1], MULTIPLIER: 1.2 },   // Dec-Feb
    SHOULDER: { MONTHS: [8, 9, 4], MULTIPLIER: 1.1 },  // Sept-Oct, May
    OFF_PEAK: { MONTHS: [2, 3, 10], MULTIPLIER: 1.0 }  // Mar-Apr, Nov
  },
  DISTRIBUTION: {
    MIN_DAYS_BETWEEN: 14,
    OPTIMAL_DAYS_BETWEEN: 30,
    PENALTY_PER_DAY: 0.1,
    MAX_PENALTY: 0.9  // Add maximum penalty
  },
  WEEKEND: {
    BRIDGE_BONUS: 1.5,
    EXTENSION_BONUS: 1.3,
    INEFFICIENT_PENALTY: 0.7,
    ISOLATED_PENALTY: 0.5  // Add penalty for isolated days
  },
  CONNECTIVITY: {
    CONTINUOUS_BONUS: 1.3,
    GAP_PENALTY: 0.6,
    MIN_CONTINUOUS_FOR_BONUS: 3  // Minimum continuous days for bonus
  }
}

// Add validation helpers
const validateDate = (dateStr: string): boolean => {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date())
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

const validateCustomDaysOff = (customDaysOff: { date: string, name: string }[]): void => {
  const invalidDates = customDaysOff.filter(d => !validateDate(d.date))
  if (invalidDates.length > 0) {
    throw new Error(`Invalid custom days off dates: ${invalidDates.map(d => d.date).join(', ')}`)
  }
}

// Helper functions
const isWorkday = (day: OptimizedDay): boolean => {
  if (!day) return false  // Guard against undefined
  return !day.isHoliday && !day.isCustomDayOff && !day.isCTO && !day.isWeekend
}

const isEffectiveBreakDay = (day: OptimizedDay): boolean => {
  if (!day) return false  // Guard against undefined
  return day.isHoliday || day.isCustomDayOff || day.isCTO
}

const isPartOfBreak = (days: OptimizedDay[], index: number): boolean => {
  if (index < 0 || index >= days.length) return false
  const day = days[index]
  if (!day) return false

  if (day.isCTO || day.isHoliday || day.isCustomDayOff) return true
  if (!day.isWeekend) return false

  const prev = index > 0 ? days[index - 1] : undefined
  const next = index < days.length - 1 ? days[index + 1] : undefined
  const prevPrev = index > 1 ? days[index - 2] : undefined
  const nextNext = index < days.length - 2 ? days[index + 2] : undefined

  // Enhanced break detection logic
  const isConnectedToPrev = prev && (prev.isCTO || prev.isHoliday || prev.isCustomDayOff)
  const isConnectedToNext = next && (next.isCTO || next.isHoliday || next.isCustomDayOff)
  const hasNearbyBreak = 
    (prevPrev && (prevPrev.isCTO || prevPrev.isHoliday || prevPrev.isCustomDayOff)) ||
    (nextNext && (nextNext.isCTO || nextNext.isHoliday || nextNext.isCustomDayOff))

  return Boolean(isConnectedToPrev || isConnectedToNext || hasNearbyBreak)
}

const getConsecutiveDays = (
  days: OptimizedDay[],
  startIndex: number,
  condition: (day: OptimizedDay) => boolean
): number => {
  let count = 0
  for (let i = startIndex; i < days.length && condition(days[i]); i++) {
    count++
  }
  return count
}

const calculateSeasonalityScore = (date: string): number => {
  const month = getMonth(parse(date, 'yyyy-MM-dd', new Date()))
  
  if (SCORING.SEASONALITY.SUMMER.MONTHS.includes(month)) {
    return SCORING.SEASONALITY.SUMMER.MULTIPLIER
  }
  if (SCORING.SEASONALITY.WINTER.MONTHS.includes(month)) {
    return SCORING.SEASONALITY.WINTER.MULTIPLIER
  }
  if (SCORING.SEASONALITY.SHOULDER.MONTHS.includes(month)) {
    return SCORING.SEASONALITY.SHOULDER.MULTIPLIER
  }
  return SCORING.SEASONALITY.OFF_PEAK.MULTIPLIER
}

const calculateDistributionScore = (
  currentBreakStart: string,
  existingBreaks: Break[]
): number => {
  if (existingBreaks.length === 0) return 1.0

  const currentDate = parse(currentBreakStart, 'yyyy-MM-dd', new Date())
  
  // Calculate minimum days to nearest break
  const daysToNearest = Math.min(
    ...existingBreaks.map(b => {
      const breakStart = parse(b.startDate, 'yyyy-MM-dd', new Date())
      return Math.abs(differenceInDays(currentDate, breakStart))
    })
  )

  if (daysToNearest < SCORING.DISTRIBUTION.MIN_DAYS_BETWEEN) {
    const penalty = (SCORING.DISTRIBUTION.MIN_DAYS_BETWEEN - daysToNearest) * 
                   SCORING.DISTRIBUTION.PENALTY_PER_DAY
    return Math.max(0.1, 1 - penalty)
  }

  if (daysToNearest >= SCORING.DISTRIBUTION.OPTIMAL_DAYS_BETWEEN) {
    return 1.0
  }

  // Linear scaling between minimum and optimal spacing
  return 0.7 + 0.3 * (daysToNearest - SCORING.DISTRIBUTION.MIN_DAYS_BETWEEN) / 
         (SCORING.DISTRIBUTION.OPTIMAL_DAYS_BETWEEN - SCORING.DISTRIBUTION.MIN_DAYS_BETWEEN)
}

const calculateWeekendScore = (
  days: OptimizedDay[],
  startIndex: number,
  endIndex: number
): number => {
  let score = 1.0
  let hasFriday = false
  let hasMonday = false
  let bridgesHolidays = false
  let extendsHoliday = false

  for (let i = startIndex; i <= endIndex; i++) {
    const dayOfWeek = getDay(parse(days[i].date, 'yyyy-MM-dd', new Date()))
    const isHolidayOrCustom = days[i].isHoliday || days[i].isCustomDayOff
    
    if (dayOfWeek === 5 && days[i].isCTO) hasFriday = true
    if (dayOfWeek === 1 && days[i].isCTO) hasMonday = true
    
    // Check for holiday bridging
    if (i < endIndex && isHolidayOrCustom && days[i + 1].isCTO) {
      bridgesHolidays = true
    }
    if (i > startIndex && isHolidayOrCustom && days[i - 1].isCTO) {
      bridgesHolidays = true
    }
    
    // Check for holiday extension
    if ((dayOfWeek === 5 || dayOfWeek === 1) && days[i].isCTO && 
        (i > 0 && isHolidayOrCustom || i < days.length - 1 && isHolidayOrCustom)) {
      extendsHoliday = true
    }
  }

  // Apply bonuses and penalties
  if (bridgesHolidays) score *= SCORING.WEEKEND.BRIDGE_BONUS
  if (extendsHoliday) score *= SCORING.WEEKEND.EXTENSION_BONUS
  if (hasFriday && hasMonday) score *= SCORING.WEEKEND.INEFFICIENT_PENALTY

  return score
}

const calculateConnectivityScore = (
  days: OptimizedDay[],
  startIndex: number,
  endIndex: number
): number => {
  let score = 1.0
  let hasGap = false
  let continuousStreak = 0
  let maxContinuousStreak = 0

  for (let i = startIndex; i <= endIndex; i++) {
    const isOff = !isWorkday(days[i]) || days[i].isCTO
    
    if (isOff) {
      continuousStreak++
      maxContinuousStreak = Math.max(maxContinuousStreak, continuousStreak)
    } else {
      if (continuousStreak > 0) hasGap = true
      continuousStreak = 0
    }
  }

  // Apply bonuses and penalties
  if (maxContinuousStreak >= 5) score *= SCORING.CONNECTIVITY.CONTINUOUS_BONUS
  if (hasGap) score *= SCORING.CONNECTIVITY.GAP_PENALTY

  return score
}

// Optimize break score calculation with caching
const calculateBreakScore = (
  days: OptimizedDay[],
  startIndex: number,
  endIndex: number,
  existingBreaks: Break[]
): Break => {
  const cacheKey = `${startIndex}_${endIndex}_${existingBreaks.length}`
  if (breakScoreCache.has(cacheKey)) {
    return breakScoreCache.get(cacheKey)!
  }

  // Find all breaks in the calendar
  const breaks: { start: number, end: number }[] = []
  let currentBreak: { start: number, end: number } | null = null

  for (let i = startIndex; i <= endIndex; i++) {
    const isBreakDay = days[i].isCTO || days[i].isHoliday || days[i].isCustomDayOff || 
                      (days[i].isWeekend && (
                        (i > 0 && (days[i-1].isCTO || days[i-1].isHoliday || days[i-1].isCustomDayOff)) ||
                        (i < days.length - 1 && (days[i+1].isCTO || days[i+1].isHoliday || days[i+1].isCustomDayOff))
                      ))

    if (isBreakDay) {
      if (!currentBreak) {
        currentBreak = { start: i, end: i }
      } else {
        currentBreak.end = i
      }
    } else if (currentBreak) {
      breaks.push(currentBreak)
      currentBreak = null
    }
  }

  if (currentBreak) {
    breaks.push(currentBreak)
  }

  if (breaks.length === 0) {
    return {
      startDate: days[startIndex].date,
      endDate: days[endIndex].date,
      days: [],
      score: -Infinity,
      metrics: {
        efficiency: 0,
        seasonality: 0,
        distribution: 0,
        connectivity: 0,
        weekendUtilization: 0
      }
    }
  }

  // Calculate overall score based on all breaks
  let totalScore = 0
  let totalMetrics = {
    efficiency: 0,
    seasonality: 0,
    distribution: 0,
    connectivity: 0,
    weekendUtilization: 0
  }

  breaks.forEach(breakPeriod => {
    const breakDays = Array.from(
      { length: breakPeriod.end - breakPeriod.start + 1 },
      (_, i) => breakPeriod.start + i
    )

    const metrics = {
      efficiency: calculateEfficiencyScore(days, breakDays),
      seasonality: calculateSeasonalityScore(days[breakPeriod.start].date),
      distribution: calculateDistributionScore(days[breakPeriod.start].date, existingBreaks),
      connectivity: calculateConnectivityScore(days, breakPeriod.start, breakPeriod.end),
      weekendUtilization: calculateWeekendScore(days, breakPeriod.start, breakPeriod.end)
    }

    const breakScore = Object.values(metrics).reduce((acc, val) => acc * val, 1.0)
    totalScore += breakScore

    // Accumulate metrics
    Object.keys(totalMetrics).forEach(key => {
      totalMetrics[key as keyof typeof totalMetrics] += metrics[key as keyof typeof metrics]
    })
  })

  // Average the metrics
  Object.keys(totalMetrics).forEach(key => {
    totalMetrics[key as keyof typeof totalMetrics] /= breaks.length
  })

  const result = {
    startDate: days[breaks[0].start].date,
    endDate: days[breaks[breaks.length - 1].end].date,
    days: breaks.flatMap(b => Array.from(
      { length: b.end - b.start + 1 },
      (_, i) => b.start + i
    )),
    score: totalScore / breaks.length,
    metrics: totalMetrics
  }

  breakScoreCache.set(cacheKey, result)
  return result
}

// Add helper function for efficiency score
const calculateEfficiencyScore = (days: OptimizedDay[], breakDays: number[]): number => {
  const effectiveDaysOff = breakDays.filter(i => 
    days[i].isCTO || days[i].isHoliday || days[i].isCustomDayOff
  ).length

  const ctoDaysUsed = breakDays.filter(i => days[i].isCTO).length
  if (ctoDaysUsed === 0) return 0

  return Math.min(1, effectiveDaysOff / Math.max(1, ctoDaysUsed))
}

// Optimize CTO combinations generation with pre-computation
const ctoCombinationsCache = new Map<string, number[][]>()

const generateCTOCombinations = (length: number, count: number): number[][] => {
  const key = `${length}_${count}`
  if (ctoCombinationsCache.has(key)) {
    return ctoCombinationsCache.get(key)!
  }

  const result: number[][] = []
  
  const generate = (current: number[], start: number, remaining: number) => {
    if (remaining === 0) {
      result.push([...current])
      return
    }
    
    for (let i = start; i <= length - remaining; i++) {
      current.push(i)
      generate(current, i + 1, remaining - 1)
      current.pop()
    }
  }
  
  generate([], 0, count)
  ctoCombinationsCache.set(key, result)
  return result
}

const findOptimalAllocation = (
  days: OptimizedDay[],
  numberOfDays: number
): number[] => {
  // Special handling for single CTO day
  if (numberOfDays === 1) {
    let bestScore = -Infinity
    let bestIndex = -1

    for (let i = 0; i < days.length; i++) {
      if (isWorkday(days[i])) {
        days[i].isCTO = true
        const score = calculateBreakScore(days, i, i, []).score
        days[i].isCTO = false

        if (score > bestScore) {
          bestScore = score
          bestIndex = i
        }
      }
    }

    if (bestIndex === -1) {
      throw new Error('Could not find a valid day for CTO')
    }

    return [bestIndex]
  }

  const memo = new Map<string, { indices: number[], score: number }>()
  
  const findBestCombination = (
    startIdx: number,
    remainingDays: number,
    currentIndices: number[] = []
  ): { indices: number[], score: number } => {
    const key = `${startIdx}_${remainingDays}_${currentIndices.join(',')}`
    if (memo.has(key)) return memo.get(key)!

    if (remainingDays === 0) {
      // Calculate score for the complete combination
      currentIndices.forEach(idx => days[idx].isCTO = true)
      const score = calculateBreakScore(days, 0, days.length - 1, []).score
      currentIndices.forEach(idx => days[idx].isCTO = false)
      return { indices: currentIndices, score }
    }

    if (startIdx >= days.length) {
      return { indices: [], score: -Infinity }
    }

    let bestResult = { indices: [] as number[], score: -Infinity }

    // Skip non-workdays
    if (!isWorkday(days[startIdx])) {
      const skipResult = findBestCombination(startIdx + 1, remainingDays, currentIndices)
      memo.set(key, skipResult)
      return skipResult
    }

    // Try using this day
    const withCurrentDay = findBestCombination(
      startIdx + 1,
      remainingDays - 1,
      [...currentIndices, startIdx]
    )

    // Try skipping this day
    const withoutCurrentDay = findBestCombination(
      startIdx + 1,
      remainingDays,
      currentIndices
    )

    // Choose the better option
    if (withCurrentDay.score > withoutCurrentDay.score) {
      bestResult = withCurrentDay
    } else {
      bestResult = withoutCurrentDay
    }

    memo.set(key, bestResult)
    return bestResult
  }

  breakScoreCache.clear()
  const result = findBestCombination(0, numberOfDays)
  
  if (result.score === -Infinity || result.indices.length !== numberOfDays) {
    throw new Error(`Could not find valid allocation using ${numberOfDays} CTO days`)
  }

  return result.indices.sort((a, b) => a - b)
}

export const optimizeCtoDays = (
  numberOfDays: number,
  year: number = new Date().getFullYear(),
  customDaysOff: { date: string, name: string }[] = []
): OptimizedDay[] => {
  // Enhanced input validation
  if (typeof numberOfDays !== 'number' || numberOfDays <= 0) {
    throw new Error('Number of CTO days must be a positive number')
  }
  
  if (typeof year !== 'number' || year < 2000 || year > 2100) {
    throw new Error('Invalid year')
  }

  validateCustomDaysOff(customDaysOff)

  // Generate initial calendar
  const days: OptimizedDay[] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const customDay = customDaysOff.find(d => d.date === dateStr)
    
    days.push({
      date: dateStr,
      isWeekend: isWeekend(date),
      isCTO: false,
      isPartOfBreak: false,
      isHoliday: false, // You'll need to implement holiday detection
      isCustomDayOff: !!customDay,
      customDayName: customDay?.name
    })
  }

  // Find optimal allocation
  const allocation = findOptimalAllocation(days, numberOfDays)

  // Apply allocation
  allocation.forEach(dayIndex => {
    days[dayIndex].isCTO = true
  })

  // Mark break periods
  for (let i = 0; i < days.length; i++) {
    days[i].isPartOfBreak = isPartOfBreak(days, i)
  }

  return days
} 