import { iso31661, ISO31662Entry } from 'iso-3166';
import Holidays, { HolidaysTypes } from 'date-holidays';

export interface HolidayResponse {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export interface DetectedHoliday {
  date: string;
  name: string;
}

// Country interface
export interface Country {
  countryCode: string;
  name: string;
}

// Interface for subdivision/state/province
export interface CountrySubdivision {
  code: ISO31662Entry['code'];
  name: ISO31662Entry['name'];
}

// Create a default instance of the Holidays class
const defaultHolidays = new Holidays();

/**
 * Creates and initializes a Holidays instance
 * @param countryCode The country code
 * @param subdivisionCode Optional subdivision code
 * @returns Initialized Holidays instance
 */
function createHolidaysInstance(
  countryCode: string,
  subdivisionCode?: string,
): Holidays {
  const holidaysInstance = new Holidays();

  // Initialize with country and state/region if provided
  // By default, only public holidays are included
  if (subdivisionCode) {
    holidaysInstance.init(countryCode, subdivisionCode);
  } else {
    holidaysInstance.init(countryCode);
  }

  return holidaysInstance;
}

/**
 * Extracts the date part from a date-holidays date string
 * @param dateStr Format: "YYYY-MM-DD HH:MM:SS"
 * @returns Date string in "YYYY-MM-DD" format
 */
function extractDatePart(dateStr: string): string {
  return dateStr.split(' ')[0];
}

/**
 * Converts a date-holidays holiday to our app's HolidayResponse format
 * @param holiday The date-holidays holiday object
 * @param countryCode The country code
 * @returns Formatted holiday object
 */
function formatHoliday(holiday: HolidaysTypes.Holiday, countryCode: string): HolidayResponse {
  return {
    date: extractDatePart(holiday.date),
    localName: holiday.name,
    name: holiday.name,
    countryCode: countryCode,
    fixed: true, // Assuming all holidays are fixed for simplicity
    global: true, // Assuming all holidays are global for simplicity
    counties: null, // Will be populated if state/region specific
    launchYear: null,
    types: [holiday.type],
  };
}

/**
 * Converts a date-holidays holiday to our app's DetectedHoliday format
 * @param holiday The date-holidays holiday object
 * @returns Simplified holiday object
 */
function formatDetectedHoliday(holiday: HolidaysTypes.Holiday): DetectedHoliday {
  return {
    date: extractDatePart(holiday.date),
    name: holiday.name,
  };
}

/**
 * Handles errors in a consistent way across holiday functions
 * @param error The caught error
 * @param message Custom error message
 * @returns Never (always throws)
 */
function handleHolidayError(error: unknown, message: string): never {
  console.error(`${message}:`, error);
  throw error;
}

/**
 * Fetches all available countries from date-holidays package
 */
export const getAvailableCountries = async (): Promise<Country[]> => {
  try {
    // Get all countries from date-holidays
    const countriesObj = defaultHolidays.getCountries();

    // Transform to the expected format with English names
    return Object.entries(countriesObj).map(([code, _name]) => {
      // Find the English name from iso-3166 data
      const isoCountry = iso31661.find(country => country.alpha2 === code.toUpperCase());
      const englishName = isoCountry ? isoCountry.name : _name as string;

      return {
        countryCode: code,
        name: englishName,
      };
    });
  } catch (error) {
    return handleHolidayError(error, 'Error fetching available countries');
  }
};

/**
 * Fetches public holidays for a specific country
 */
export const getPublicHolidaysByCountry = async (
  countryCode: string,
  year: number = new Date().getUTCFullYear(),
): Promise<HolidayResponse[]> => {
  try {
    // Initialize holidays instance with the country
    const holidaysInstance = createHolidaysInstance(countryCode);

    // Get holidays for the specified year
    const holidayData = holidaysInstance.getHolidays(year);

    // Filter to only include public holidays
    const publicHolidays = holidayData.filter(holiday =>
      holiday.type === 'public',
    );

    // Transform to the expected format
    return publicHolidays.map(holiday => formatHoliday(holiday, countryCode));
  } catch (error) {
    return handleHolidayError(error, `Error fetching holidays for ${countryCode}`);
  }
};

/**
 * Extract subdivisions (provinces/states) from country
 */
export const extractSubdivisions = (holidays: HolidayResponse[]): CountrySubdivision[] => {
  // Since date-holidays has a different way of handling regions,
  // we need to check if the country has states/regions
  try {
    const countryCode = holidays[0]?.countryCode;

    if (!countryCode) return [];

    // Get states for the country
    const states = defaultHolidays.getStates(countryCode);

    if (!states) return [];

    // Transform to CountrySubdivision format
    return Object.entries(states).map(([code, name]) => ({
      code,
      name: name as string,
    }));
  } catch (error) {
    console.error('Error extracting subdivisions:', error);
    return [];
  }
};

/**
 * Get holidays filtered by subdivision
 */
export const getHolidaysBySubdivision = (
  holidays: HolidayResponse[],
  subdivisionCode?: string,
): DetectedHoliday[] => {
  try {
    // If a subdivision is specified, we need to reinitialize the holidays instance
    // with both country and state/region
    if (subdivisionCode && holidays.length > 0) {
      const countryCode = holidays[0].countryCode;

      // Initialize with country and state
      const holidaysInstance = createHolidaysInstance(countryCode, subdivisionCode);

      // Get holidays for the current year
      const year = new Date().getUTCFullYear();
      const regionalHolidays = holidaysInstance.getHolidays(year);

      // Filter to only include public holidays
      const publicHolidays = regionalHolidays.filter(holiday =>
        holiday.type === 'public',
      );

      // Transform to app format
      return publicHolidays.map(formatDetectedHoliday);
    }

    // If no subdivision, return all holidays
    return holidays.map(holiday => ({
      date: holiday.date,
      name: holiday.localName || holiday.name,
    }));
  } catch (error) {
    console.error('Error getting holidays by subdivision:', error);

    // Fallback to original implementation
    const filteredHolidays = subdivisionCode
      ? holidays.filter(holiday => holiday.global || holiday.counties?.includes(subdivisionCode))
      : holidays.filter(holiday => holiday.global);

    return filteredHolidays.map(holiday => ({
      date: holiday.date,
      name: holiday.localName || holiday.name,
    }));
  }
};

/**
 * Check if a specific date is a holiday
 * @param date The date to check
 * @param countryCode The country code
 * @param subdivisionCode Optional subdivision code
 * @returns An object with holiday info or null if not a holiday
 */
export const isHoliday = (
  date: Date,
  countryCode: string,
  subdivisionCode?: string,
): { isHoliday: boolean; name?: string; type?: string } => {
  try {
    // Initialize with country and subdivision if provided
    const holidaysInstance = createHolidaysInstance(countryCode, subdivisionCode);

    // Check if the date is a holiday
    const holidayCheck = holidaysInstance.isHoliday(date);

    if (holidayCheck) {
      // The result is an array of holiday objects
      if (Array.isArray(holidayCheck) && holidayCheck.length > 0) {
        return {
          isHoliday: true,
          name: holidayCheck[0].name,
          type: holidayCheck[0].type,
        };
      }

      // If we can't extract details but it is a holiday
      return { isHoliday: true };
    }

    // Not a holiday
    return { isHoliday: false };
  } catch (error) {
    console.error('Error checking if date is a holiday:', error);
    return { isHoliday: false };
  }
};
