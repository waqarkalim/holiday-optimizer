// Constants for break lengths and scoring
export const BREAK_LENGTHS = {
  // Long weekends: Thursday-Sunday or Friday-Monday (3-4 days)
  LONG_WEEKEND: {
    MIN: 3,
    MAX: 4,
    SCORE_MULTIPLIER: 3.0,    // Moderate multiplier as these are easier to arrange
    PENALTY_MULTIPLIER: 0.7    // Mild penalty for longer breaks
  },
  // Week-long breaks: 5-7 days (typical work week plus weekends)
  WEEK_LONG: {
    MIN: 5,
    MAX: 7,
    SCORE_MULTIPLIER: 4.0,    // Higher multiplier as these are ideal for recharging
    PENALTY_MULTIPLIER: 0.6    // Stronger penalty for going over a week
  },
  // Extended breaks: 8-14 days (two weeks including weekends)
  EXTENDED: {
    MIN: 8,
    MAX: 14,
    SCORE_MULTIPLIER: 5.0,    // Highest multiplier for planned vacations
    PENALTY_MULTIPLIER: 0.5    // Significant penalty for excessive length
  }
} as const

// Constants for balanced strategy scoring - weighted to favor medium-length breaks
export const BALANCED_STRATEGY = {
  EXTENDED_MULTIPLIER: 1.5,    // Lower weight for extended breaks
  WEEK_LONG_MULTIPLIER: 2.0,   // Highest weight for week-long breaks
  LONG_WEEKEND_MULTIPLIER: 1.8  // Medium weight for long weekends
} as const

// Constants for break distribution in balanced strategy
export const BALANCED_DISTRIBUTION = {
  LONG_WEEKENDS: 0.35,         // 35% for long weekends
  WEEK_BREAKS: 0.45,           // 45% for week-long breaks
  // Extended is implicitly 0.20 (20% for extended breaks)
} as const

// Constants for position bonuses
export const POSITION_BONUSES = {
  MONDAY_FRIDAY: 1.75,         // Higher bonus for optimal long weekend placement
  NEAR_HOLIDAY_RANGE: 3        // Increased range to better detect holiday proximity
} as const

// Constants for efficiency scoring
export const EFFICIENCY_SCORING = {
  MAX_MULTIPLIER: 2.5          // Reduced to prevent over-emphasizing efficiency
} as const

// Constants for spacing requirements (in workdays)
export const SPACING_REQUIREMENTS = {
  EXTENDED_MIN_DAYS: 30,       // ~6 weeks between extended breaks
  WEEK_LONG_MIN_DAYS: 15,      // ~3 weeks between week-long breaks
  LONG_WEEKEND_MIN_DAYS: 8,    // ~2 weeks between long weekends
  MIN_SCORE_MULTIPLIER: {
    EXTENDED: 0.2,             // Stronger spacing enforcement for extended breaks
    WEEK_LONG: 0.3,            // Moderate spacing for week-long breaks
    LONG_WEEKEND: 0.4          // More flexible spacing for long weekends
  }
} as const

// Constants for distribution weights in scoring
export const DISTRIBUTION_WEIGHTS = {
  LONG_WEEKENDS: 0.35,         // Balanced weight for long weekends
  WEEK_LONG_BREAKS: 0.40,      // Slightly higher weight for week-long breaks
  EXTENDED_VACATIONS: 0.25,    // Lower weight for extended vacations
  BALANCED: 0.33               // Equal weight in balanced strategy
} as const 