const STORAGE_KEY_BASE = 'preBookedDays';

interface PreBookedDay {
  date: string;
  name: string;
}

// Helper function to get the year-specific storage key
const getYearStorageKey = (year: number): string => `${STORAGE_KEY_BASE}_${year}`;

export function getStoredPreBookedDays(year: number = new Date().getFullYear()): PreBookedDay[] {
  try {
    const storageKey = getYearStorageKey(year);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function storePreBookedDay(day: PreBookedDay, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const preBookedDays = getStoredPreBookedDays(year);
    const existingIndex = preBookedDays.findIndex(d => d.date === day.date);

    if (existingIndex !== -1) {
      // Update existing pre-booked day
      preBookedDays[existingIndex] = day;
    } else {
      // Add new pre-booked day
      preBookedDays.push(day);
    }

    localStorage.setItem(storageKey, JSON.stringify(preBookedDays));
  } catch (error) {
    console.error('Failed to store pre-booked day:', error);
  }
}

export function removeStoredPreBookedDay(
  dateToRemove: string,
  year: number = new Date().getFullYear()
) {
  try {
    const storageKey = getYearStorageKey(year);
    const preBookedDays = getStoredPreBookedDays(year);
    const updatedPreBookedDays = preBookedDays.filter(day => day.date !== dateToRemove);
    localStorage.setItem(storageKey, JSON.stringify(updatedPreBookedDays));
  } catch (error) {
    console.error('Failed to remove pre-booked day:', error);
  }
}
