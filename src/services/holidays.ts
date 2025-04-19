import Holidays, { HolidaysTypes } from 'date-holidays';
import { CountryInfo } from '@/lib/storage/location';

const lang = 'en';

const options: HolidaysTypes.Options = {
  languages: [lang],
  types: ['public'],
};

// const COUNTRIES_THAT_ARE_CAUSING_A_BUG = ['IR', 'CX', 'KE', 'RW', 'KM', 'DJ', 'SD', 'AW'];
// const COUNTRIES_THAT_ARE_CAUSING_A_BUG = [];

/**
 * Fetches public holidays for a specific country
 */
export const getPublicHolidaysByCountry = (
  year = new Date().getUTCFullYear(),
  countryInfo: CountryInfo,
) => {
  const hd = new Holidays(countryInfo, options);
  return hd.getHolidays(year, lang);
};

/**
 * Get all available countries
 */
export const getAvailableCountries = () => {
  const hd = new Holidays(options);
  const countries = hd.getCountries(lang);
  if (!countries) return [];

  const allCountries = Object.entries(countries).map(([countryCode, name]) => ({ countryCode, name }));

  return allCountries
  // return allCountries.filter(({ countryCode }) => !COUNTRIES_THAT_ARE_CAUSING_A_BUG.includes(countryCode));
};

/**
 * Get states for a specific country
 */
export const getStates = (countryCode: string) => {
  const hd = new Holidays(countryCode, options);
  const states = hd.getStates(countryCode, lang);
  if (!states) return [];

  return Object.entries(states).map(([code, name]) => ({ code, name }));
};

/**
 * Get regions for a specific country and state
 */
export const getRegions = (countryCode: string, stateCode: string) => {
  const hd = new Holidays(countryCode, stateCode, options);
  const regions = hd.getRegions(countryCode, stateCode, lang);
  if (!regions) return [];

  return Object.entries(regions).map(([code, name]) => ({ code, name }));
};
