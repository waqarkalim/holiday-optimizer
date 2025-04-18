import Holidays, { HolidaysTypes } from 'date-holidays';
import { CountryInfo } from '@/lib/storage/location';

const lang = 'en-US'

const options: HolidaysTypes.Options = {
  languages: [lang],
  types: ['public'],
};

/**
 * Fetches public holidays for a specific country
 */
export const getPublicHolidaysByCountry = async (
  year = new Date().getUTCFullYear(),
  countryInfo: CountryInfo,
) => {
  const hd = new Holidays(countryInfo, options);
  return hd.getHolidays(year);
};

/**
 * Get all available countries
 */
export const getAvailableCountries = async () => {
  const hd = new Holidays(options);
  const countries = hd.getCountries(lang);
  if (!countries) return [];

  return Object.entries(countries).map(([countryCode, name]) => ({ countryCode, name }));
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
