// export interface CountryInfo {
//   country: string;
//   state?: string;
//   region?: string;
// }

import { HolidaysTypes } from 'date-holidays';

export type CountryInfo = HolidaysTypes.Country

const STORAGE_KEY_BASE = 'location';

// Generate storage key including year
const getYearStorageKey = (year: number) => `${STORAGE_KEY_BASE}_${year}`;

/**
 * Save location data to localStorage
 */
export const storeLocationData = (year = new Date().getUTCFullYear(), countryInfo: CountryInfo) => {
  const storageKey = getYearStorageKey(year);
  localStorage.setItem(storageKey, JSON.stringify(countryInfo));
};

/**
 * Get location data from localStorage
 */
export const getStoredLocationData = (year: number = new Date().getFullYear()) => {
  const storageKey = getYearStorageKey(year);
  const stored = localStorage.getItem(storageKey);

  if (!stored) return

  return JSON.parse(stored) as CountryInfo
};