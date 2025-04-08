const STORAGE_KEY_BASE = 'holidays';
const REMOVED_HOLIDAYS_KEY = 'removed-holidays';

// Use sessionStorage for temporary removals (reset on page reload/tab close)
const SESSION_REMOVED_HOLIDAYS_KEY = 'session-removed-holidays';

interface Holiday {
  date: string;
  name: string;
}

interface RemovedHoliday {
  date: string;
  year: number;
  regionCode: string;
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

/**
 * Save a holiday to the session-only removed list
 * This will be reset when the page is reloaded
 */
export const addToSessionRemovedHolidays = (date: string, year: number, regionCode: string): void => {
  try {
    // Get existing session-removed holidays
    const existingItems = getSessionRemovedHolidays();
    
    // Check if this holiday is already in the session list for this region
    const alreadyRemoved = existingItems.some(item => 
      item.date === date && item.year === year && item.regionCode === regionCode
    );
    
    // If not already in the list, add it
    if (!alreadyRemoved) {
      const updatedItems = [...existingItems, { date, year, regionCode }];
      sessionStorage.setItem(SESSION_REMOVED_HOLIDAYS_KEY, JSON.stringify(updatedItems));
    }
  } catch (error) {
    console.error('Error adding holiday to session removed list:', error);
  }
};

/**
 * Get the list of session-removed holidays
 */
export const getSessionRemovedHolidays = (): RemovedHoliday[] => {
  try {
    const storedData = sessionStorage.getItem(SESSION_REMOVED_HOLIDAYS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error getting session removed holidays:', error);
    return [];
  }
};

/**
 * Check if a holiday is in the session-removed list for a specific region
 */
export const isHolidaySessionRemoved = (date: string, year: number, regionCode: string): boolean => {
  try {
    const removedHolidays = getSessionRemovedHolidays();
    return removedHolidays.some(item => 
      item.date === date && item.year === year && item.regionCode === regionCode
    );
  } catch (error) {
    console.error('Error checking if holiday is session-removed:', error);
    return false;
  }
};

/**
 * Clear all session-removed holidays for a specific region
 * This should be called when changing regions
 */
export const clearSessionRemovedHolidaysForRegion = (regionCode: string): void => {
  try {
    const existingItems = getSessionRemovedHolidays();
    const updatedItems = existingItems.filter(item => item.regionCode !== regionCode);
    sessionStorage.setItem(SESSION_REMOVED_HOLIDAYS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error clearing session removed holidays for region:', error);
  }
};

/**
 * Save a holiday to the removed list (persistent storage)
 * This is kept for backward compatibility but not used in the new flow
 */
export const addToRemovedHolidays = (date: string, year: number, regionCode: string): void => {
  try {
    // Get existing removed holidays
    const existingItems = getRemovedHolidays();
    
    // Check if this holiday is already in the list for this region
    const alreadyRemoved = existingItems.some(item => 
      item.date === date && item.year === year && item.regionCode === regionCode
    );
    
    // If not already in the list, add it
    if (!alreadyRemoved) {
      const updatedItems = [...existingItems, { date, year, regionCode }];
      localStorage.setItem(REMOVED_HOLIDAYS_KEY, JSON.stringify(updatedItems));
    }
  } catch (error) {
    console.error('Error adding holiday to removed list:', error);
  }
};

/**
 * Get the list of removed holidays
 */
export const getRemovedHolidays = (): RemovedHoliday[] => {
  try {
    const storedData = localStorage.getItem(REMOVED_HOLIDAYS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error getting removed holidays:', error);
    return [];
  }
};

/**
 * Check if a holiday is in the removed list for a specific region
 */
export const isHolidayRemoved = (date: string, year: number, regionCode: string): boolean => {
  // In the new implementation, we only check session storage
  return isHolidaySessionRemoved(date, year, regionCode);
};

/**
 * Remove a holiday from the removed list (to show it again)
 */
export const removeFromRemovedHolidays = (date: string, year: number, regionCode: string): void => {
  try {
    const existingItems = getRemovedHolidays();
    const updatedItems = existingItems.filter(item => 
      !(item.date === date && item.year === year && item.regionCode === regionCode)
    );
    localStorage.setItem(REMOVED_HOLIDAYS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error removing holiday from removed list:', error);
  }
};

/**
 * Clear all removed holidays for a specific region
 */
export const clearRemovedHolidaysForRegion = (regionCode: string): void => {
  try {
    const existingItems = getRemovedHolidays();
    const updatedItems = existingItems.filter(item => item.regionCode !== regionCode);
    localStorage.setItem(REMOVED_HOLIDAYS_KEY, JSON.stringify(updatedItems));
    
    // Also clear session storage
    clearSessionRemovedHolidaysForRegion(regionCode);
  } catch (error) {
    console.error('Error clearing removed holidays for region:', error);
  }
};

/**
 * Clear all removed holidays
 */
export const clearRemovedHolidays = (): void => {
  try {
    localStorage.removeItem(REMOVED_HOLIDAYS_KEY);
    sessionStorage.removeItem(SESSION_REMOVED_HOLIDAYS_KEY);
  } catch (error) {
    console.error('Error clearing removed holidays:', error);
  }
};