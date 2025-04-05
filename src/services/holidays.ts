import { ISO31662Entry } from 'iso-3166';

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

// Country interface for Nager API
export interface NagerCountry {
  countryCode: string;
  name: string;
}

// Interface for subdivision/state/province
export interface CountrySubdivision {
  code: ISO31662Entry['code'];
  name: ISO31662Entry['name'];
}
/**
 * Fetches all available countries from Nager API
 */
export const getAvailableCountries = async (): Promise<NagerCountry[]> => {
  try {
    const response = await fetch('https://date.nager.at/api/v3/AvailableCountries');
    
    if (!response.ok) {
      throw new Error('Failed to fetch available countries');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching available countries:', error);
    throw error;
  }
};

/**
 * Fetches public holidays for a specific country
 */
export const getPublicHolidaysByCountry = async (
  countryCode: string, 
  year: number = new Date().getUTCFullYear()
): Promise<HolidayResponse[]> => {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch holidays for ${countryCode}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching holidays for ${countryCode}:`, error);
    throw error;
  }
};

/**
 * Extract subdivisions (provinces/states) from holiday data
 */
export const extractSubdivisions = (holidays: HolidayResponse[]): CountrySubdivision[] => {
  const subdivisionMap = new Map<string, string>();
  
  // Collect all unique subdivision codes from holidays
  holidays.forEach(holiday => {
    if (holiday.counties && holiday.counties.length > 0) {
      holiday.counties.forEach(code => {
        // Use code as both key and name initially
        if (!subdivisionMap.has(code)) {
          subdivisionMap.set(code, code);
        }
      });
    }
  });
  
  // Convert to array of CountrySubdivision objects
  return Array.from(subdivisionMap.entries()).map(([code, name]) => ({
    code,
    name
  }));
};

/**
 * Get holidays filtered by subdivision
 */
export const getHolidaysBySubdivision = (
  holidays: HolidayResponse[], 
  subdivisionCode?: string
): DetectedHoliday[] => {
  // If no subdivision specified, return all global holidays
  const filteredHolidays = subdivisionCode 
    ? holidays.filter(holiday => holiday.global || holiday.counties?.includes(subdivisionCode))
    : holidays.filter(holiday => holiday.global);
  
  // Transform to app format
  return filteredHolidays.map(holiday => ({
    date: holiday.date,
    name: holiday.localName || holiday.name,
  }));
};
