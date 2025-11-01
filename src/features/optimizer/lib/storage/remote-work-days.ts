import { WeekdayNumber } from '@/types';

const REMOTE_WORK_DAYS_KEY = 'holiday-optimizer-remote-work-days';

const sanitizeRemoteDays = (days: unknown): WeekdayNumber[] => {
  if (!Array.isArray(days)) {
    return [];
  }

  const unique = Array.from(
    new Set(
      days.filter(
        (day): day is WeekdayNumber => typeof day === 'number' && day >= 0 && day <= 6
      )
    )
  );

  return unique as WeekdayNumber[];
};

export const getStoredRemoteWorkDays = (): WeekdayNumber[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(REMOTE_WORK_DAYS_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return sanitizeRemoteDays(parsed);
  } catch {
    return [];
  }
};

export const storeRemoteWorkDays = (days: WeekdayNumber[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitized = sanitizeRemoteDays(days);
  window.localStorage.setItem(REMOTE_WORK_DAYS_KEY, JSON.stringify(sanitized));
};
