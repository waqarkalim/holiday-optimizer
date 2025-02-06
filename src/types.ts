// Optimization Types
export type OptimizationStrategy = 'balanced' | 'miniBreaks' | 'longWeekends' | 'weekLongBreaks' | 'extendedVacations';

export interface OptimizedDay {
    date: string;
    isWeekend: boolean;
    isCTO: boolean;
    isPartOfBreak: boolean;
    isPublicHoliday: boolean;
    publicHolidayName?: string;
    isCustomDayOff: boolean;
    customDayName?: string;
}

export interface Break {
    startDate: string;
    endDate: string;
    days: OptimizedDay[];
    totalDays: number;
    ctoDays: number;
    publicHolidays: number;
    weekends: number;
    customDaysOff: number;
}

export interface OptimizationStats {
    totalCTODays: number;
    totalPublicHolidays: number;
    totalNormalWeekends: number;
    totalExtendedWeekends: number;
    totalCustomDaysOff: number;
    totalDaysOff: number;
}

export interface OptimizationResult {
    days: OptimizedDay[];
    breaks: Break[];
    stats: OptimizationStats;
}

export interface CustomDayOff {
    date: string;           // Date in 'yyyy-MM-dd' format
    name: string;          // Description or name of the custom day off
    isRecurring?: boolean; // Whether this applies to all matching weekdays in a date range
    startDate?: string;    // If recurring, the start date of the range
    endDate?: string;      // If recurring, the end date of the range
    weekday?: number;      // If recurring, the day of week (0-6, where 0 is Sunday)
}

export interface OptimizationParams {
    numberOfDays: number;
    strategy?: OptimizationStrategy;
    year?: number;
    holidays?: Array<{ date: string, name: string }>;
    customDaysOff?: Array<CustomDayOff>;
}

export interface StrategyOption {
    id: OptimizationStrategy;
    label: string;
    description: string;
}


export type ColorScheme = 'blue' | 'green' | 'amber' | 'purple' | 'pink' | 'emerald' | 'violet';