import { addDays, isWeekend, startOfYear, format, parse, isSameDay, getMonth, getYear, getDay } from 'date-fns'

interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday?: boolean
  holidayName?: string
}

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

function calculateBreakScore(date: Date, days: OptimizedDay[]): number {
  let score = 0
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayIndex = days.findIndex(d => d.date === dateStr)
  
  if (dayIndex === -1) return 0

  // Look for potential breaks (up to 5 days before and after)
  for (let offset = -5; offset <= 5; offset++) {
    if (offset === 0) continue

    const checkIndex = dayIndex + offset
    if (checkIndex >= 0 && checkIndex < days.length) {
      const checkDay = days[checkIndex]
      
      // Check if the day is a holiday or could be part of a break
      if (checkDay.isHoliday || checkDay.isWeekend) {
        // Give higher score for closer days and even higher for holidays
        const proximity = 1 / Math.abs(offset)
        score += checkDay.isHoliday ? proximity * 2 : proximity
      }
    }
  }

  return score
}

export function optimizeCtoDays(numberOfDays: number): OptimizedDay[] {
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Start from December 2024 to include New Year's break
  const startDate = new Date(2024, 11, 1)
  const daysToMap = 365 + 31
  const days: OptimizedDay[] = []
  const ctoOpportunities: { date: Date; score: number; index: number }[] = []

  // First, map out all days
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

    // Only consider 2025 workdays as CTO opportunities
    if (!isWeekendDay && !isHolidayDay && dateStr.startsWith('2025')) {
      ctoOpportunities.push({
        date: currentDate,
        score: 0,
        index: i
      })
    }
  }

  // Validate we have enough workdays
  if (ctoOpportunities.length < numberOfDays) {
    throw new Error(`Not enough workdays available in 2025. Requested ${numberOfDays} CTO days but only ${ctoOpportunities.length} workdays available.`)
  }

  let remainingDays = numberOfDays
  let usedOpportunities = new Set<number>()

  // First pass: Use the scoring system to find optimal days
  while (remainingDays > 0) {
    // Recalculate scores for remaining opportunities
    ctoOpportunities
      .filter(opp => !usedOpportunities.has(opp.index))
      .forEach(opportunity => {
        opportunity.score = calculateBreakScore(opportunity.date, days)
      })

    // Sort remaining opportunities by score
    const sortedOpportunities = ctoOpportunities
      .filter(opp => !usedOpportunities.has(opp.index))
      .sort((a, b) => b.score - a.score)

    // Take the best opportunity
    const bestOpportunity = sortedOpportunities[0]
    if (!bestOpportunity) {
      throw new Error('No more opportunities available but still have remaining days')
    }

    // Mark the day as used
    usedOpportunities.add(bestOpportunity.index)
    days[bestOpportunity.index].isCTO = true
    days[bestOpportunity.index].isPartOfBreak = true

    // Mark connected weekends
    for (let j = Math.max(0, bestOpportunity.index - 2); j <= Math.min(days.length - 1, bestOpportunity.index + 2); j++) {
      if (days[j].isWeekend && isConnectedToBreak(days, j)) {
        days[j].isPartOfBreak = true
        markWeekendPair(days, j, true)
      }
    }

    remainingDays--
  }

  // Connect breaks
  for (let i = 0; i < days.length; i++) {
    if (days[i].isCTO || days[i].isHoliday) {
      let breakStart = i
      let breakEnd = i

      // Look backwards
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const isBreakDay = days[j].isCTO || days[j].isHoliday
        const isConnectingWeekend = days[j].isWeekend && isConnectedToBreak(days, j)
        
        if (isBreakDay || isConnectingWeekend) {
          breakStart = j
        } else {
          break
        }
      }

      // Look forwards
      for (let j = i + 1; j < Math.min(days.length, i + 6); j++) {
        const isBreakDay = days[j].isCTO || days[j].isHoliday
        const isConnectingWeekend = days[j].isWeekend && isConnectedToBreak(days, j)
        
        if (isBreakDay || isConnectingWeekend) {
          breakEnd = j
        } else {
          break
        }
      }

      // Mark all days in the break
      for (let k = breakStart; k <= breakEnd; k++) {
        days[k].isPartOfBreak = true
        if (days[k].isWeekend) {
          const isConnected = isConnectedToBreak(days, k)
          days[k].isPartOfBreak = isConnected
          if (isConnected) {
            markWeekendPair(days, k, true)
          }
        }
      }
    }
  }

  // Reset any weekends that aren't actually connected to breaks
  for (let i = 0; i < days.length; i++) {
    if (days[i].isWeekend && days[i].isPartOfBreak) {
      if (!isConnectedToBreak(days, i)) {
        days[i].isPartOfBreak = false
        markWeekendPair(days, i, false)
      }
    }
  }

  // Filter to only include 2025 days
  const result = days.filter(day => day.date.startsWith('2025'))

  // Final validation
  const finalCTOCount = result.filter(day => day.isCTO).length
  if (finalCTOCount !== numberOfDays) {
    throw new Error(`Optimization failed: final result has ${finalCTOCount} CTO days, expected ${numberOfDays}`)
  }

  return result
} 