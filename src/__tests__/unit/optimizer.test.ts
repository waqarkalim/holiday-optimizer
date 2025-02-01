import { optimizeCtoDays } from '@/services/optimizer'

describe('optimizeCtoDays', () => {
  it('should throw error for invalid input', () => {
    expect(() => optimizeCtoDays(0)).toThrow('Number of CTO days must be greater than 0')
    expect(() => optimizeCtoDays(-1)).toThrow('Number of CTO days must be greater than 0')
  })

  it('should return correct number of CTO days', () => {
    const result = optimizeCtoDays(5)
    const ctoDays = result.filter(day => day.isCTO)
    expect(ctoDays).toHaveLength(5)
  })

  it('should mark weekends as part of break when connected to CTO days', () => {
    const result = optimizeCtoDays(2)
    const weekendsInBreak = result.filter(day => day.isWeekend && day.isPartOfBreak)
    expect(weekendsInBreak.length).toBeGreaterThan(0)
  })

  it('should include all Canadian holidays', () => {
    const result = optimizeCtoDays(1) // Even with 1 CTO day, all holidays should be included
    const holidays = result.filter(day => day.isHoliday)
    expect(holidays).toHaveLength(10) // Number of Canadian holidays in 2025
  })

  it('should optimize breaks around holidays', () => {
    const result = optimizeCtoDays(3)
    const holidayDates = result.filter(day => day.isHoliday).map(day => day.date)
    
    // Check if any CTO days are adjacent to holidays
    const ctoDaysNearHolidays = result.filter(day => {
      if (!day.isCTO) return false
      const date = new Date(day.date)
      const dayBefore = new Date(date)
      dayBefore.setDate(date.getDate() - 1)
      const dayAfter = new Date(date)
      dayAfter.setDate(date.getDate() + 1)
      
      return holidayDates.includes(dayBefore.toISOString().split('T')[0]) ||
             holidayDates.includes(dayAfter.toISOString().split('T')[0])
    })

    expect(ctoDaysNearHolidays.length).toBeGreaterThan(0)
  })
}) 