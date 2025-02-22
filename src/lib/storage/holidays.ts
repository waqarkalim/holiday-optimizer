const STORAGE_KEY = 'holiday-optimizer-selected-dates';

export interface StoredHoliday {
  date: string;
  name: string;
}

export function getStoredHolidays(): StoredHoliday[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const holidays: StoredHoliday[] = JSON.parse(stored);
    return holidays.filter(day => day.name && day.date);
  } catch (error) {
    console.error('Error reading holidays from storage:', error);
    return [];
  }
}

export function storeHoliday(day: StoredHoliday) {
  try {
    const currentDays = getStoredHolidays();

    // Check if day already exists
    const exists = currentDays.some(existingDay => existingDay.date === day.date);

    if (!exists) {
      const storedData = [...currentDays, day];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  } catch (error) {
    console.error('Error storing holiday:', error);
  }
}

export function removeStoredHoliday(index: number) {
  try {
    const currentDays = getStoredHolidays();
    const updatedDays = currentDays.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
  } catch (error) {
    console.error('Error removing holiday:', error);
  }
}

export function clearStoredHolidays() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing holidays:', error);
  }
}