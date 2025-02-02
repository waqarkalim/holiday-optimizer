import { addDays, isWeekend, startOfYear, format, parse, isSameDay, getMonth, getYear, getDay } from 'date-fns'

// Export the interfaces
export interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday?: boolean
  holidayName?: string
}

export interface AlternativeDay {
  originalDate: string
  alternativeDate: string
  reason: string
}

// Add break preference types
export interface BreakPreference {
  minDays: number
  maxDays: number
  weight: number
  name: string
}

export const DEFAULT_BREAK_PREFERENCES: BreakPreference[] = [
  { minDays: 3, maxDays: 4, weight: 1.5, name: 'Long Weekend' },
  { minDays: 5, maxDays: 7, weight: 1.2, name: 'Week Break' },
  { minDays: 8, maxDays: 13, weight: 1.0, name: 'Extended Break' },
  { minDays: 14, maxDays: Infinity, weight: 0.8, name: 'Vacation' }
]

// Canadian holidays for 2025
const HOLIDAYS = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-02-17', name: 'Family Day' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-05-19', name: 'Victoria Day' },
  { date: '2025-07-01', name: 'Canada Day' },
  { date: '2025-09-01', name: 'Labour Day' },
  { date: '2025-10-13', name: 'Thanksgiving Day' },
  { date: '2025-11-11', name: 'Remembrance Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' },
]

function isHoliday(date: Date): { isHoliday: boolean; name?: string } {
  const formattedDate = format(date, 'yyyy-MM-dd')
  const holiday = HOLIDAYS.find(h => h.date === formattedDate)
  return holiday ? { isHoliday: true, name: holiday.name } : { isHoliday: false }
}

function markWeekendPair(days: OptimizedDay[], index: number, shouldBePartOfBreak: boolean) {
  const currentDate = parse(days[index].date, 'yyyy-MM-dd', new Date())
  const dayOfWeek = getDay(currentDate)
  
  if (dayOfWeek === 0) { // Sunday
    // Mark Saturday if it exists and is connected to a break
    if (index > 0 && days[index - 1].isWeekend) {
      days[index - 1].isPartOfBreak = shouldBePartOfBreak
    }
  } else if (dayOfWeek === 6) { // Saturday
    // Mark Sunday if it exists and is connected to a break
    if (index < days.length - 1 && days[index + 1].isWeekend) {
      days[index + 1].isPartOfBreak = shouldBePartOfBreak
    }
  }
}

function isConnectedToBreak(days: OptimizedDay[], index: number): boolean {
  // Check if this weekend is connected to a CTO day or holiday
  const prevDay = index > 0 ? days[index - 1] : null
  const nextDay = index < days.length - 1 ? days[index + 1] : null
  
  // For Saturday
  if (getDay(parse(days[index].date, 'yyyy-MM-dd', new Date())) === 6) {
    return Boolean(
      (prevDay && (prevDay.isCTO || prevDay.isHoliday)) || 
      (nextDay && nextDay.isWeekend && index < days.length - 2 && (days[index + 2].isCTO || days[index + 2].isHoliday))
    )
  }
  // For Sunday
  if (getDay(parse(days[index].date, 'yyyy-MM-dd', new Date())) === 0) {
    return Boolean(
      (nextDay && (nextDay.isCTO || nextDay.isHoliday)) || 
      (prevDay && prevDay.isWeekend && index > 1 && (days[index - 2].isCTO || days[index - 2].isHoliday))
    )
  }
  return false
}


// Define optimization strategies
export type OptimizationStrategy = 'balanced' | 'longWeekends' | 'weekLongBreaks' | 'extendedVacations'

export interface StrategyOption {
  id: OptimizationStrategy
  label: string
  description: string
  breakScoreMultiplier: (breakLength: number) => number
}

export const OPTIMIZATION_STRATEGIES: StrategyOption[] = [
  {
    id: 'balanced',
    label: 'Balanced Mix',
    description: 'A balanced mix of long weekends and longer breaks',
    breakScoreMultiplier: (length: number) => Math.pow(length, 2)
  },
  {
    id: 'longWeekends',
    label: 'Long Weekends',
    description: 'Maximize the number of 3-4 day weekends',
    breakScoreMultiplier: (length: number) => {
      if (length <= 4) return Math.pow(length, 3)  // Strongly prefer 3-4 day breaks
      return Math.pow(length, 1.2)  // Much lower score for longer breaks
    }
  },
  {
    id: 'weekLongBreaks',
    label: 'Week-long Breaks',
    description: 'Focus on creating 5-7 day breaks',
    breakScoreMultiplier: (length: number) => {
      if (length >= 5 && length <= 7) return Math.pow(length, 3)  // Strongly prefer week-long breaks
      return Math.pow(length, 1.2)  // Much lower score for other lengths
    }
  },
  {
    id: 'extendedVacations',
    label: 'Extended Vacations',
    description: 'Combine days for longer vacations (8+ days)',
    breakScoreMultiplier: (length: number) => {
      if (length >= 8) return Math.pow(length, 3)  // Strongly prefer long breaks
      return Math.pow(length, 1.2)  // Much lower score for shorter breaks
    }
  }
]

function calculateTotalScore(days: OptimizedDay[], strategy: StrategyOption): number {
  let totalScore = 0
  let currentBreak: OptimizedDay[] = []

  for (let i = 0; i < days.length; i++) {
    if (days[i].isPartOfBreak) {
      currentBreak.push(days[i])
    } else if (currentBreak.length > 0) {
      // Score the completed break
      totalScore += strategy.breakScoreMultiplier(currentBreak.length)
      
      // Add small bonus for holidays
      const holidaysInBreak = currentBreak.filter(day => day.isHoliday).length
      totalScore += holidaysInBreak * 0.1
      
      currentBreak = []
    }
  }
  
  // Handle any remaining break at the end
  if (currentBreak.length > 0) {
    totalScore += strategy.breakScoreMultiplier(currentBreak.length)
    const holidaysInBreak = currentBreak.filter(day => day.isHoliday).length
    totalScore += holidaysInBreak * 0.1
  }
  
  return totalScore
}

function tryConfiguration(
  days: OptimizedDay[],
  ctoOpportunities: { date: Date; index: number }[],
  selectedIndices: number[],
  strategy: StrategyOption
): number {
  // Create a copy of days with this configuration
  const testDays = days.map(day => ({...day}))
  
  // Apply the selected CTO days
  for (const opportunityIndex of selectedIndices) {
    const dayIndex = ctoOpportunities[opportunityIndex].index
    testDays[dayIndex].isCTO = true
    testDays[dayIndex].isPartOfBreak = true
  }

  // Connect all breaks and weekends
  for (let i = 0; i < testDays.length; i++) {
    if (testDays[i].isCTO || testDays[i].isHoliday) {
      let breakStart = i
      let breakEnd = i

      // Look backwards
      for (let j = i - 1; j >= 0; j--) {
        const isBreakDay = testDays[j].isCTO || testDays[j].isHoliday
        const isConnectingWeekend = testDays[j].isWeekend && 
          (j > 0 && (testDays[j-1].isCTO || testDays[j-1].isHoliday) || 
           j < testDays.length - 1 && (testDays[j+1].isCTO || testDays[j+1].isHoliday))
        
        if (isBreakDay || isConnectingWeekend) {
          breakStart = j
        } else {
          break
        }
      }

      // Look forwards
      for (let j = i + 1; j < testDays.length; j++) {
        const isBreakDay = testDays[j].isCTO || testDays[j].isHoliday
        const isConnectingWeekend = testDays[j].isWeekend && 
          (j > 0 && (testDays[j-1].isCTO || testDays[j-1].isHoliday) || 
           j < testDays.length - 1 && (testDays[j+1].isCTO || testDays[j+1].isHoliday))
        
        if (isBreakDay || isConnectingWeekend) {
          breakEnd = j
        } else {
          break
        }
      }

      // Mark all days in the break
      for (let k = breakStart; k <= breakEnd; k++) {
        testDays[k].isPartOfBreak = true
        if (testDays[k].isWeekend) {
          const isConnected = isConnectedToBreak(testDays, k)
          testDays[k].isPartOfBreak = isConnected
          if (isConnected) {
            markWeekendPair(testDays, k, true)
          }
        }
      }
    }
  }

  return calculateTotalScore(testDays, strategy)
}

function findPotentialBreaks(days: OptimizedDay[], startIndex: number, maxLength: number = 14): number[][] {
  const breaks: number[][] = []
  const daysInScope = days.slice(startIndex, startIndex + maxLength)
  
  // Find all workdays in the scope
  const workdayIndices = daysInScope.reduce((acc, day, i) => {
    if (!day.isWeekend && !day.isHoliday && !day.isCTO) acc.push(startIndex + i)
    return acc
  }, [] as number[])

  // Generate combinations of different lengths
  for (let len = 1; len <= Math.min(workdayIndices.length, maxLength); len++) {
    const combinations = getCombinations(workdayIndices, len)
    breaks.push(...combinations)
  }

  return breaks
}

function getCombinations(indices: number[], length: number): number[][] {
  if (length === 0) return [[]]
  if (indices.length === 0) return []

  const [first, ...rest] = indices
  const withFirst = getCombinations(rest, length - 1).map(combo => [first, ...combo])
  const withoutFirst = getCombinations(rest, length)

  return [...withFirst, ...withoutFirst]
}

function optimizeAroundHolidays(
  days: OptimizedDay[],
  ctoOpportunities: { date: Date; index: number }[],
  numberOfDays: number,
  strategy: StrategyOption
): { configuration: number[], score: number } {
  let bestScore = -1
  let bestConfiguration: number[] = []

  // Find holiday clusters
  const holidayClusters: number[][] = []
  let currentCluster: number[] = []

  days.forEach((day, index) => {
    if (day.isHoliday) {
      if (currentCluster.length === 0 || index - currentCluster[currentCluster.length - 1] <= 7) {
        currentCluster.push(index)
      } else {
        holidayClusters.push([...currentCluster])
        currentCluster = [index]
      }
    }
  })
  if (currentCluster.length > 0) {
    holidayClusters.push(currentCluster)
  }

  // Try different distributions of CTO days around holiday clusters
  for (const cluster of holidayClusters) {
    // Look for opportunities around this cluster
    const potentialBreaks = findPotentialBreaks(days, Math.max(0, cluster[0] - 7), 14)
    
    for (const breakConfig of potentialBreaks) {
      if (breakConfig.length <= numberOfDays) {
        const opportunityIndices = breakConfig.map(dayIndex => 
          ctoOpportunities.findIndex(opp => opp.index === dayIndex)
        ).filter(i => i !== -1)

        if (opportunityIndices.length === breakConfig.length) {
          const score = tryConfiguration(days, ctoOpportunities, opportunityIndices, strategy)
          if (score > bestScore) {
            bestScore = score
            bestConfiguration = opportunityIndices
          }
        }
      }
    }
  }

  return { configuration: bestConfiguration, score: bestScore }
}

interface Break {
  startDate: string
  endDate: string
  length: number
  ctoDaysNeeded: number
  holidaysIncluded: number
  weekendsIncluded: number
}

function findAllPossibleBreaks(days: OptimizedDay[]): Break[] {
  const breaks: Break[] = []
  let i = 0

  while (i < days.length) {
    if (!days[i].date.startsWith('2025')) {
      i++
      continue
    }

    // For each potential start date
    for (let length = 1; length <= 21; length++) {  // Look up to 3 weeks ahead
      if (i + length >= days.length) break
      
      // Count what this break would require/include
      let ctoDaysNeeded = 0
      let holidaysIncluded = 0
      let weekendsIncluded = 0
      
      for (let j = i; j < i + length; j++) {
        if (!days[j].date.startsWith('2025')) break
        if (!days[j].isWeekend && !days[j].isHoliday) ctoDaysNeeded++
        if (days[j].isHoliday) holidaysIncluded++
        if (days[j].isWeekend) weekendsIncluded++
      }

      breaks.push({
        startDate: days[i].date,
        endDate: days[i + length - 1].date,
        length,
        ctoDaysNeeded,
        holidaysIncluded,
        weekendsIncluded
      })
    }
    i++
  }

  return breaks
}

function optimizeLongWeekends(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({...d}))
  let remainingDays = numberOfDays

  // Get all Mondays and Fridays in 2025
  const mondaysAndFridays = days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => {
      if (!day.date.startsWith('2025') || day.isWeekend || day.isHoliday) return false
      const date = parse(day.date, 'yyyy-MM-dd', new Date())
      const dayOfWeek = getDay(date)
      return dayOfWeek === 1 || dayOfWeek === 5
    })
    .sort((a, b) => {
      // Sort by proximity to holidays to maximize connection opportunities
      const dateA = parse(a.day.date, 'yyyy-MM-dd', new Date())
      const dateB = parse(b.day.date, 'yyyy-MM-dd', new Date())
      const scoreA = isNearHoliday(days, a.index) ? 1 : 0
      const scoreB = isNearHoliday(days, b.index) ? 1 : 0
      return scoreB - scoreA || dateA.getTime() - dateB.getTime()
    })

  // First pass: Take as many Mondays/Fridays as possible
  for (const { index } of mondaysAndFridays) {
    if (remainingDays > 0) {
      result[index].isCTO = true
      remainingDays--
    }
  }

  // Second pass: If we have remaining days, try to extend existing long weekends
  if (remainingDays > 0) {
    const extendableBreaks = findAllPossibleBreaks(result)
      .filter(b => b.length === 3 || b.length === 4)
      .sort((a, b) => {
        const aEfficiency = (a.length + 1) / (a.ctoDaysNeeded + 1)
        const bEfficiency = (b.length + 1) / (b.ctoDaysNeeded + 1)
        return bEfficiency - aEfficiency
      })

    for (const breakPeriod of extendableBreaks) {
      if (remainingDays <= 0) break

      const startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
      const endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())
      
      // Try to extend before or after
      const beforeIndex = days.findIndex(d => d.date === format(addDays(startDate, -1), 'yyyy-MM-dd'))
      const afterIndex = days.findIndex(d => d.date === format(addDays(endDate, 1), 'yyyy-MM-dd'))

      if (beforeIndex >= 0 && !result[beforeIndex].isWeekend && !result[beforeIndex].isHoliday && !result[beforeIndex].isCTO) {
        result[beforeIndex].isCTO = true
        remainingDays--
      } else if (afterIndex >= 0 && !result[afterIndex].isWeekend && !result[afterIndex].isHoliday && !result[afterIndex].isCTO) {
        result[afterIndex].isCTO = true
        remainingDays--
      }
    }
  }

  // Final pass: Use any remaining days on Tuesdays/Thursdays near existing breaks
  if (remainingDays > 0) {
    const remainingWorkdays = days
      .map((day, index) => ({ day, index }))
      .filter(({ day, index }) => {
        if (!day.date.startsWith('2025') || day.isWeekend || day.isHoliday || day.isCTO) return false
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        const dayOfWeek = getDay(date)
        return dayOfWeek === 2 || dayOfWeek === 4  // Tuesday or Thursday
      })
      .sort((a, b) => {
        const scoreA = isNearBreak(result, a.index) ? 1 : 0
        const scoreB = isNearBreak(result, b.index) ? 1 : 0
        return scoreB - scoreA
      })

    for (const { index } of remainingWorkdays) {
      if (remainingDays <= 0) break
      result[index].isCTO = true
      remainingDays--
    }
  }

  // If we still have days, use them on any remaining workdays
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') && !days[i].isWeekend && !days[i].isHoliday && !result[i].isCTO) {
        result[i].isCTO = true
        remainingDays--
      }
    }
  }

  return result
}

function optimizeWeekLongBreaks(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({...d}))
  let remainingDays = numberOfDays

  // Find all potential week-long breaks (5-7 days)
  const weekBreaks = findAllPossibleBreaks(result)
    .filter(b => b.ctoDaysNeeded <= remainingDays && b.length >= 5 && b.length <= 7)
    .sort((a, b) => {
      // Sort by efficiency (total break length / CTO days needed)
      const aEfficiency = a.length / a.ctoDaysNeeded
      const bEfficiency = b.length / b.ctoDaysNeeded
      return bEfficiency - aEfficiency
    })

  // Track used days to avoid overlap
  const usedDays = new Set<string>()

  // Take the most efficient week breaks first
  for (const breakPeriod of weekBreaks) {
    if (remainingDays <= 0) break

    // Check if this break overlaps with any used days
    let canUseBreak = true
    let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
    let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())
    
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
        canUseBreak = false
        break
      }
    }

    if (canUseBreak && breakPeriod.ctoDaysNeeded <= remainingDays) {
      // Use this break
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        usedDays.add(dateStr)
        const index = days.findIndex(day => day.date === dateStr)
        if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          remainingDays--
        }
      }
    }
  }

  // If we have remaining days, try to create shorter breaks
  if (remainingDays > 0) {
    const shortBreaks = findAllPossibleBreaks(result)
      .filter(b => b.ctoDaysNeeded <= remainingDays && b.length >= 3 && b.length <= 4)
      .sort((a, b) => {
        const aEfficiency = a.length / a.ctoDaysNeeded
        const bEfficiency = b.length / b.ctoDaysNeeded
        return bEfficiency - aEfficiency
      })

    for (const breakPeriod of shortBreaks) {
      if (remainingDays <= 0) break

      let canUseBreak = true
      let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
      let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())
      
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
          canUseBreak = false
          break
        }
      }

      if (canUseBreak && breakPeriod.ctoDaysNeeded <= remainingDays) {
        for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
          const dateStr = format(d, 'yyyy-MM-dd')
          usedDays.add(dateStr)
          const index = days.findIndex(day => day.date === dateStr)
          if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
            result[index].isCTO = true
            remainingDays--
          }
        }
      }
    }
  }

  // Use any remaining days
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') && !days[i].isWeekend && !days[i].isHoliday && !result[i].isCTO) {
        result[i].isCTO = true
        remainingDays--
      }
    }
  }

  return result
}

function optimizeExtendedVacations(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({...d}))
  let remainingDays = numberOfDays

  // Find all potential extended breaks (8+ days)
  const extendedBreaks = findAllPossibleBreaks(result)
    .filter(b => b.ctoDaysNeeded <= remainingDays && b.length >= 8)
    .sort((a, b) => {
      // Sort by total length first, then by efficiency
      if (a.length !== b.length) return b.length - a.length
      const aEfficiency = a.length / a.ctoDaysNeeded
      const bEfficiency = b.length / b.ctoDaysNeeded
      return bEfficiency - aEfficiency
    })

  // Track used days
  const usedDays = new Set<string>()

  // Take the longest breaks first
  for (const breakPeriod of extendedBreaks) {
    if (remainingDays <= 0) break

    let canUseBreak = true
    let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
    let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())
    
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
        canUseBreak = false
        break
      }
    }

    if (canUseBreak && breakPeriod.ctoDaysNeeded <= remainingDays) {
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        usedDays.add(dateStr)
        const index = days.findIndex(day => day.date === dateStr)
        if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          remainingDays--
        }
      }
    }
  }

  // If we have remaining days, try to extend existing breaks
  if (remainingDays > 0) {
    const existingBreaks = findAllPossibleBreaks(result)
      .filter(b => b.length >= 3)
      .sort((a, b) => b.length - a.length)

    for (const breakPeriod of existingBreaks) {
      if (remainingDays <= 0) break

      // Try to extend before and after
      let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
      let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

      // Look backwards
      for (let d = addDays(startDate, -1); remainingDays > 0; d = addDays(d, -1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        if (!dateStr.startsWith('2025')) break
        const index = days.findIndex(day => day.date === dateStr)
        if (index < 0) break
        if (usedDays.has(dateStr)) break
        if (!days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          usedDays.add(dateStr)
          remainingDays--
        }
      }

      // Look forwards
      for (let d = addDays(endDate, 1); remainingDays > 0; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        if (!dateStr.startsWith('2025')) break
        const index = days.findIndex(day => day.date === dateStr)
        if (index < 0) break
        if (usedDays.has(dateStr)) break
        if (!days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          usedDays.add(dateStr)
          remainingDays--
        }
      }
    }
  }

  // Use any remaining days
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') && !days[i].isWeekend && !days[i].isHoliday && !result[i].isCTO) {
        result[i].isCTO = true
        remainingDays--
      }
    }
  }

  return result
}

function markBreaks(days: OptimizedDay[]): void {
  // Reset all break markers except holidays
  for (let i = 0; i < days.length; i++) {
    if (!days[i].isHoliday) {
      days[i].isPartOfBreak = false
    }
  }

  // First pass: Mark all CTO and holiday days
  for (let i = 0; i < days.length; i++) {
    if (days[i].isCTO || days[i].isHoliday) {
      days[i].isPartOfBreak = true
    }
  }

  // Second pass: Mark connected weekends
  for (let i = 0; i < days.length; i++) {
    if (days[i].isWeekend) {
      // Check if this weekend connects to any breaks
      const prevDay = i > 0 ? days[i - 1] : null
      const nextDay = i < days.length - 1 ? days[i + 1] : null
      const prevPrevDay = i > 1 ? days[i - 2] : null
      const nextNextDay = i < days.length - 2 ? days[i + 2] : null

      // For Saturday (day 6)
      if (getDay(parse(days[i].date, 'yyyy-MM-dd', new Date())) === 6) {
        if ((prevDay?.isPartOfBreak) || (nextDay?.isWeekend && nextNextDay?.isPartOfBreak)) {
          days[i].isPartOfBreak = true
          if (nextDay?.isWeekend) nextDay.isPartOfBreak = true
        }
      }
      // For Sunday (day 0)
      else if (getDay(parse(days[i].date, 'yyyy-MM-dd', new Date())) === 0) {
        if ((nextDay?.isPartOfBreak) || (prevDay?.isWeekend && prevPrevDay?.isPartOfBreak)) {
          days[i].isPartOfBreak = true
          if (prevDay?.isWeekend) prevDay.isPartOfBreak = true
        }
      }
    }
  }

  // Third pass: Connect any gaps
  for (let i = 1; i < days.length - 1; i++) {
    if (!days[i].isPartOfBreak && days[i-1].isPartOfBreak && days[i+1].isPartOfBreak) {
      days[i].isPartOfBreak = true
    }
  }
}

function optimizeBalanced(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({...d}))
  
  // Divide days into different categories
  const longWeekendDays = Math.floor(numberOfDays * 0.4)  // 40% for long weekends
  const weekBreakDays = Math.floor(numberOfDays * 0.4)    // 40% for week breaks
  const extendedBreakDays = numberOfDays - longWeekendDays - weekBreakDays  // Remainder for extended breaks

  // Create separate copies for each strategy
  const longWeekendResult = optimizeLongWeekends(days, longWeekendDays)
  const weekBreakResult = optimizeWeekLongBreaks(days, weekBreakDays)
  const extendedResult = optimizeExtendedVacations(days, extendedBreakDays)

  // Combine results, prioritizing each strategy's days
  const usedDays = new Set<string>()

  // First, take long weekend days
  for (let i = 0; i < days.length; i++) {
    if (longWeekendResult[i].isCTO) {
      result[i].isCTO = true
      usedDays.add(days[i].date)
    }
  }

  // Then, take week break days that don't overlap
  for (let i = 0; i < days.length; i++) {
    if (weekBreakResult[i].isCTO && !usedDays.has(days[i].date)) {
      result[i].isCTO = true
      usedDays.add(days[i].date)
    }
  }

  // Finally, take extended vacation days that don't overlap
  for (let i = 0; i < days.length; i++) {
    if (extendedResult[i].isCTO && !usedDays.has(days[i].date)) {
      result[i].isCTO = true
      usedDays.add(days[i].date)
    }
  }

  // If we still haven't used all days, use the remaining on workdays
  let remainingDays = numberOfDays - usedDays.size
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') && 
          !days[i].isWeekend && 
          !days[i].isHoliday && 
          !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        usedDays.add(days[i].date)
        remainingDays--
      }
    }
  }

  return result
}

function isNearHoliday(days: OptimizedDay[], index: number, range: number = 2): boolean {
  for (let i = Math.max(0, index - range); i <= Math.min(days.length - 1, index + range); i++) {
    if (days[i].isHoliday) return true
  }
  return false
}

function isNearBreak(days: OptimizedDay[], index: number, range: number = 2): boolean {
  for (let i = Math.max(0, index - range); i <= Math.min(days.length - 1, index + range); i++) {
    if (days[i].isCTO || days[i].isHoliday) return true
  }
  return false
}

export function optimizeCtoDays(
  numberOfDays: number,
  strategy: OptimizationStrategy = 'balanced'
): {
  days: OptimizedDay[]
} {
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Initialize the calendar
  const startDate = new Date(2024, 11, 1)
  const daysToMap = 365 + 31
  const days: OptimizedDay[] = []

  // Map out all days
  for (let i = 0; i < daysToMap; i++) {
    const currentDate = addDays(startDate, i)
    const isWeekendDay = isWeekend(currentDate)
    const { isHoliday: isHolidayDay, name: holidayName } = isHoliday(currentDate)
    const dateStr = format(currentDate, 'yyyy-MM-dd')

    days.push({
      date: dateStr,
      isWeekend: isWeekendDay,
      isCTO: false,
      isPartOfBreak: isHolidayDay,
      isHoliday: isHolidayDay,
      holidayName
    })
  }

  // Count available workdays in 2025
  const availableWorkdays = days.filter(day => 
    !day.isWeekend && 
    !day.isHoliday && 
    day.date.startsWith('2025')
  ).length

  if (availableWorkdays < numberOfDays) {
    throw new Error(`Not enough workdays available in 2025. Requested ${numberOfDays} CTO days but only ${availableWorkdays} workdays available.`)
  }

  // Apply strategy-specific optimization
  let result: OptimizedDay[]
  switch (strategy) {
    case 'longWeekends':
      result = optimizeLongWeekends(days, numberOfDays)
      break
    case 'weekLongBreaks':
      result = optimizeWeekLongBreaks(days, numberOfDays)
      break
    case 'extendedVacations':
      result = optimizeExtendedVacations(days, numberOfDays)
      break
    default:
      result = optimizeBalanced(days, numberOfDays)
  }

  // Mark breaks
  markBreaks(result)

  // Return only 2025 days
  const finalResult = result.filter(day => day.date.startsWith('2025'))

  // Validate
  const finalCTOCount = finalResult.filter(day => day.isCTO).length
  if (finalCTOCount !== numberOfDays) {
    throw new Error(`Optimization failed: final result has ${finalCTOCount} CTO days, expected ${numberOfDays}`)
  }

  return { days: finalResult }
} 