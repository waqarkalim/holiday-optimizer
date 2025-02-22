const STORAGE_KEY = 'holiday-optimizer-selected-dates';

export interface StoredHoliday {
  date: string; // ISO string
  type: 'public-holiday';
}

export function getStoredHolidays(): Date[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const holidays: StoredHoliday[] = JSON.parse(stored);
    return holidays
      .filter(holiday => holiday.type === 'public-holiday')
      .map(holiday => new Date(holiday.date))
      .filter(date => !isNaN(date.getTime())); // Filter out invalid dates
  } catch (error) {
    console.error('Error reading holidays from storage:', error);
    return [];
  }
}

export function storeHoliday(date: Date) {
  try {
    const currentHolidays = getStoredHolidays();
    const newHoliday: StoredHoliday = {
      date: date.toISOString(),
      type: 'public-holiday'
    };

    // Check if date already exists
    const exists = currentHolidays.some(
      holiday => holiday.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );

    if (!exists) {
      const storedData = [
        ...currentHolidays.map(date => ({ 
          date: date.toISOString(), 
          type: 'public-holiday' as const 
        })),
        newHoliday
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  } catch (error) {
    console.error('Error storing holiday:', error);
  }
}

export function removeStoredHoliday(date: Date) {
  try {
    const currentHolidays = getStoredHolidays();
    const updatedHolidays = currentHolidays.filter(
      holiday => holiday.toISOString().split('T')[0] !== date.toISOString().split('T')[0]
    );

    const storedData = updatedHolidays.map(date => ({
      date: date.toISOString(),
      type: 'public-holiday' as const
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
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