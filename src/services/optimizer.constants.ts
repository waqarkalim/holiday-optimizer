// Constants for break lengths and scoring
export const BREAK_LENGTHS = {
  LONG_WEEKEND: {
    MIN: 3,
    MAX: 4,
    SCORE_MULTIPLIER: 4,
    PENALTY_MULTIPLIER: 0.5
  },
  WEEK_LONG: {
    MIN: 5,
    MAX: 7,
    SCORE_MULTIPLIER: 4,
    PENALTY_MULTIPLIER: 0.5
  },
  EXTENDED: {
    MIN: 8,
    MAX: 15,
    SCORE_MULTIPLIER: 4,
    PENALTY_MULTIPLIER: 0.5
  }
} as const

// Constants for balanced strategy scoring
export const BALANCED_STRATEGY = {
  EXTENDED_MULTIPLIER: 2,
  WEEK_LONG_MULTIPLIER: 1.75,
  LONG_WEEKEND_MULTIPLIER: 1.5
} as const

// Constants for break distribution in balanced strategy
export const BALANCED_DISTRIBUTION = {
  LONG_WEEKENDS: 0.4,
  WEEK_BREAKS: 0.4,
  // Extended is implicitly 0.2 (remaining 20%)
} as const

// Constants for position bonuses
export const POSITION_BONUSES = {
  MONDAY_FRIDAY: 1.5,
  NEAR_HOLIDAY_RANGE: 2 // Days to look before/after for holiday proximity
} as const

// Constants for efficiency scoring
export const EFFICIENCY_SCORING = {
  MAX_MULTIPLIER: 3 // Maximum efficiency bonus multiplier
} as const

// Constants for spacing requirements
export const SPACING_REQUIREMENTS = {
  EXTENDED_MIN_DAYS: 20,
  WEEK_LONG_MIN_DAYS: 10,
  LONG_WEEKEND_MIN_DAYS: 5,
  MIN_SCORE_MULTIPLIER: {
    EXTENDED: 0.1,
    WEEK_LONG: 0.2,
    LONG_WEEKEND: 0.3
  }
} as const

// Constants for distribution weights
export const DISTRIBUTION_WEIGHTS = {
  LONG_WEEKENDS: 0.3,
  WEEK_LONG_BREAKS: 0.2,
  EXTENDED_VACATIONS: 0.1,
  BALANCED: 0.25
} as const 