import { DEFAULT_WEEKEND_DAYS } from '@/constants';
import { WeekdayNumber } from '@/types';

const WEEKEND_DAYS_KEY = 'holiday-optimizer-weekend-days';

const sanitizeWeekendDays = (days: unknown): WeekdayNumber[] => {
  if (!Array.isArray(days)) {
    return DEFAULT_WEEKEND_DAYS;
  }

  const unique = Array.from(
    new Set(
      days.filter(
        (day): day is WeekdayNumber => typeof day === 'number' && day >= 0 && day <= 6
      )
    )
  );

  return unique.length > 0 ? (unique as WeekdayNumber[]) : DEFAULT_WEEKEND_DAYS;
};

export const getStoredWeekendDays = (): WeekdayNumber[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_WEEKEND_DAYS;
  }

  try {
    const rawValue = window.localStorage.getItem(WEEKEND_DAYS_KEY);
    if (!rawValue) {
      return DEFAULT_WEEKEND_DAYS;
    }

    const parsed = JSON.parse(rawValue);
    return sanitizeWeekendDays(parsed);
  } catch {
    return DEFAULT_WEEKEND_DAYS;
  }
};

export const storeWeekendDays = (days: WeekdayNumber[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitized = sanitizeWeekendDays(days);
  window.localStorage.setItem(WEEKEND_DAYS_KEY, JSON.stringify(sanitized));
};
