// Constants for break lengths and scoring
export const BREAK_LENGTHS = {
  // Long weekends: 3-4 days (e.g., Friday-Monday)
  LONG_WEEKEND: {
    MIN: 3,
    MAX: 4,  // Reduced from 5 to ensure true "long weekend" feel
    SCORE_MULTIPLIER: 3.5,    // Increased to make long weekends more attractive
    PENALTY_MULTIPLIER: 0.6    // Stronger penalty to discourage overlong weekends
  },
  // Mini breaks: 5-6 days (perfect for short trips)
  MINI_BREAK: {
    MIN: 5,
    MAX: 6,
    SCORE_MULTIPLIER: 4.0,    // High multiplier for these ideal short breaks
    PENALTY_MULTIPLIER: 0.65   // Moderate penalty
  },
  // Week-long breaks: 7-9 days (full week plus weekends)
  WEEK_LONG: {
    MIN: 7,
    MAX: 9,
    SCORE_MULTIPLIER: 4.5,    // Higher multiplier for full-week breaks
    PENALTY_MULTIPLIER: 0.55   // Stronger penalty for excessive length
  },
  // Extended breaks: 10-15 days (two weeks including weekends)
  EXTENDED: {
    MIN: 10,
    MAX: 15,
    SCORE_MULTIPLIER: 5.0,    // Highest multiplier for planned vacations
    PENALTY_MULTIPLIER: 0.45   // Significant penalty for excessive length
  }
} as const

// Constants for balanced strategy scoring
export const BALANCED_STRATEGY = {
  EXTENDED_MULTIPLIER: 1.2,    // Reduced to prevent too many long breaks
  WEEK_LONG_MULTIPLIER: 2.0,   // Balanced for week-long breaks
  MINI_BREAK_MULTIPLIER: 1.8,  // Good balance for 5-6 day breaks
  LONG_WEEKEND_MULTIPLIER: 1.5 // Slightly reduced to prevent too many short breaks
} as const

// Constants for break distribution in balanced strategy
export const BALANCED_DISTRIBUTION = {
  LONG_WEEKENDS: 0.30,        // 30% for long weekends
  MINI_BREAKS: 0.25,          // 25% for 5-6 day breaks
  WEEK_BREAKS: 0.30,          // 30% for week-long breaks
  EXTENDED_BREAKS: 0.15       // 15% for extended breaks
} as const

// Constants for position bonuses
export const POSITION_BONUSES = {
  MONDAY_FRIDAY: 2.0,         // Increased bonus for optimal long weekend placement
  THURSDAY_FRIDAY: 1.5,       // New bonus for Thursday-Friday combinations
  MONDAY_TUESDAY: 1.5,        // New bonus for Monday-Tuesday combinations
  NEAR_HOLIDAY_RANGE: 4,      // Increased range for better holiday proximity detection
  HOLIDAY_MULTIPLIER: 1.3     // New multiplier for breaks near holidays
} as const

// Constants for efficiency scoring
export const EFFICIENCY_SCORING = {
  MAX_MULTIPLIER: 2.0,        // Reduced to prevent over-emphasizing efficiency
  WEEKEND_BONUS: 1.4,         // New bonus for efficient weekend usage
  HOLIDAY_BONUS: 1.5,         // New bonus for efficient holiday usage
  CONSECUTIVE_PENALTY: 0.7    // Penalty for consecutive CTO days
} as const

// Constants for spacing requirements (in workdays)
export const SPACING_REQUIREMENTS = {
  EXTENDED_MIN_DAYS: 40,      // Increased to ~8 weeks between extended breaks
  WEEK_LONG_MIN_DAYS: 20,     // Increased to ~4 weeks between week-long breaks
  MINI_BREAK_MIN_DAYS: 15,    // New spacing for mini breaks
  LONG_WEEKEND_MIN_DAYS: 10,  // Increased to ensure better distribution
  MIN_SCORE_MULTIPLIER: {
    EXTENDED: 0.15,           // Stronger enforcement for extended breaks
    WEEK_LONG: 0.25,          // Stronger enforcement for week-long breaks
    MINI_BREAK: 0.35,         // New multiplier for mini breaks
    LONG_WEEKEND: 0.45        // More flexible for long weekends
  },
  SIMILAR_BREAK_PENALTY: 0.7, // New penalty for similar breaks too close together
  OPTIMAL_SPACING_BONUS: 1.2  // New bonus for well-spaced breaks
} as const

// Constants for seasonal preferences
export const SEASONAL_WEIGHTS = {
  SUMMER: 1.4,               // June-August premium
  WINTER_HOLIDAY: 1.3,       // December-January premium
  FALL: 1.2,                // September-October moderate bonus
  SPRING: 1.1,              // March-May small bonus
  WINTER: 1.0                // Regular winter months base score
} as const

// Constants for distribution weights in scoring
export const DISTRIBUTION_WEIGHTS = {
  LONG_WEEKENDS: 0.30,       // Reduced slightly
  MINI_BREAKS: 0.25,         // New category
  WEEK_LONG_BREAKS: 0.30,    // Balanced with long weekends
  EXTENDED_BREAKS: 0.15,     // Reduced for better distribution
  BALANCED: 0.25            // Equal weight in balanced strategy
} as const

export const SCORING_MULTIPLIERS = {
    BREAK_LENGTH_BONUS: 2.0,        // Bonus multiplier for break length
    ADJACENT_DAY_BONUS: 3.0,        // Bonus for days adjacent to weekends/holidays
    OPTIMAL_DAY_BONUS: 2.0,         // Bonus for optimal weekdays (Mon/Fri)
    
    // Strategy-specific multipliers
    STRONG_PREFERENCE: 3.0,         // Strong preference multiplier
    HEAVY_PENALTY: 0.3,             // Heavy penalty multiplier
    VERY_STRONG_PREFERENCE: 4.0,    // Very strong preference multiplier
    TWO_WEEK_BONUS: 1.5,           // Bonus for two-week breaks
    LIGHT_PENALTY: 0.7,            // Light penalty multiplier
    MODERATE_PENALTY: 0.6,          // Moderate penalty multiplier
    SEVERE_PENALTY: 0.2,           // Severe penalty multiplier
    
    // Standalone day scoring
    PRIME_POSITION_BONUS: 3.0,      // Bonus for prime positions (Mon/Fri)
    SECONDARY_POSITION_BONUS: 1.0,  // Bonus for secondary positions (Tue/Thu)
    ADJACENT_BONUS: 2.0            // Bonus for days adjacent to weekends/holidays
} as const;

export const BREAK_THRESHOLDS = {
    TWO_WEEK_MINIMUM: 14,          // Minimum days for two-week break bonus
    NEARBY_BREAK_RANGE: 3          // Range to check for nearby breaks
} as const; 