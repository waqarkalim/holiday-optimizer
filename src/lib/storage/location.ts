const STORAGE_KEY_BASE = 'location';

interface LocationData {
  country: string;
  subdivision: string;
}

// Generate storage key including year
const getYearStorageKey = (year: number) => `${STORAGE_KEY_BASE}_${year}`;

/**
 * Save location data to localStorage
 */
export function storeLocationData(countryCode: string, subdivisionCode: string, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const locationData: LocationData = {
      country: countryCode,
      subdivision: subdivisionCode
    };
    localStorage.setItem(storageKey, JSON.stringify(locationData));
  } catch (error) {
    console.error('Failed to store location data:', error);
  }
}

/**
 * Get location data from localStorage
 */
export function getStoredLocationData(year: number = new Date().getFullYear()): LocationData | null {
  try {
    const storageKey = getYearStorageKey(year);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
} 