const STORAGE_KEY_BASE = 'holidays';

interface Holiday {
  date: string;
  name: string;
}

// Helper function to get the year-specific storage key
function getYearStorageKey(year: number): string {
  return `${STORAGE_KEY_BASE}_${year}`;
}

export function getStoredHolidays(year: number = new Date().getFullYear()): Holiday[] {
  try {
    const storageKey = getYearStorageKey(year);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function storeHoliday(holiday: Holiday, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const holidays = getStoredHolidays(year);
    const existingIndex = holidays.findIndex(h => h.date === holiday.date);
    
    if (existingIndex !== -1) {
      // Update existing holiday
      holidays[existingIndex] = holiday;
    } else {
      // Add new holiday
      holidays.push(holiday);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(holidays));
  } catch (error) {
    console.error('Failed to store holiday:', error);
  }
}

export function removeStoredHoliday(dateToRemove: string, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const holidays = getStoredHolidays(year);
    const updatedHolidays = holidays.filter(holiday => holiday.date !== dateToRemove);
    localStorage.setItem(storageKey, JSON.stringify(updatedHolidays));
  } catch (error) {
    console.error('Failed to remove holiday:', error);
  }
}

export function clearStoredHolidays(year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear holidays:', error);
  }
}

export function updateStoredHoliday(date: string, newName: string, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const holidays = getStoredHolidays(year);
    const updatedHolidays = holidays.map(holiday =>
      holiday.date === date ? { ...holiday, name: newName } : holiday
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedHolidays));
  } catch (error) {
    console.error('Failed to update holiday:', error);
  }
}