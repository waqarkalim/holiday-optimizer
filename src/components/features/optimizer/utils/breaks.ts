import type { OptimizedDay } from '@/services/optimizer'

export interface Break {
  startDate: string
  endDate: string
  days: OptimizedDay[]
  totalDays: number
  ctoDays: number
  holidays: number
  weekends: number
}

export function findBreaks(days: OptimizedDay[]): Break[] {
  const breaks: Break[] = []
  let currentBreak: OptimizedDay[] = []

  for (let i = 0; i < days.length; i++) {
    if (days[i].isPartOfBreak) {
      currentBreak.push(days[i])
    } else if (currentBreak.length > 0) {
      breaks.push(processBreak(currentBreak))
      currentBreak = []
    }
  }

  // Handle the last break if it exists
  if (currentBreak.length > 0) {
    breaks.push(processBreak(currentBreak))
  }

  return breaks
}

function processBreak(days: OptimizedDay[]): Break {
  const ctoDays = days.filter(d => d.isCTO).length
  const holidays = days.filter(d => d.isHoliday).length
  const weekends = days.filter(d => d.isWeekend).length

  return {
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    days,
    totalDays: days.length,
    ctoDays,
    holidays,
    weekends
  }
}

export function countExtendedWeekends(optimizedDays: OptimizedDay[]): number {
  return optimizedDays.reduce((count, day, index, arr) => {
    // Skip if not a weekend
    if (!day.isWeekend) return count

    // Check if this weekend is part of a break
    if (!day.isPartOfBreak) {
      // Even if not marked as part of a break, check if it's extended by holidays
      const prevDay = arr[index - 1]
      const nextDay = arr[index + 1]
      const prevDayIsHoliday = prevDay?.isHoliday
      const nextDayIsHoliday = nextDay?.isHoliday
      
      // If not connected to a holiday, skip
      if (!prevDayIsHoliday && !nextDayIsHoliday) return count
    }

    // Only count Saturdays to avoid counting the same weekend twice
    const date = new Date(day.date)
    if (date.getDay() === 6) {
      return count + 1
    }

    return count
  }, 0)
} 