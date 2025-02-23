const STORAGE_KEY = 'holidays';

interface Holiday {
  date: string;
  name: string;
}

export function getStoredHolidays(): Holiday[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function storeHoliday(holiday: Holiday) {
  try {
    const holidays = getStoredHolidays();
    const existingIndex = holidays.findIndex(h => h.date === holiday.date);
    
    if (existingIndex !== -1) {
      // Update existing holiday
      holidays[existingIndex] = holiday;
    } else {
      // Add new holiday
      holidays.push(holiday);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  } catch (error) {
    console.error('Failed to store holiday:', error);
  }
}

export function removeStoredHoliday(dateToRemove: string) {
  try {
    const holidays = getStoredHolidays();
    const updatedHolidays = holidays.filter(holiday => holiday.date !== dateToRemove);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHolidays));
  } catch (error) {
    console.error('Failed to remove holiday:', error);
  }
}

export function clearStoredHolidays() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear holidays:', error);
  }
}

export function updateStoredHoliday(date: string, newName: string) {
  try {
    const holidays = getStoredHolidays();
    const updatedHolidays = holidays.map(holiday =>
      holiday.date === date ? { ...holiday, name: newName } : holiday
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHolidays));
  } catch (error) {
    console.error('Failed to update holiday:', error);
  }
}