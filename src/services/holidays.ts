import { format } from 'date-fns';

interface HolidayResponse {
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

const getCountryFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return data.countryCode;
  } catch (error) {
    console.error('Error getting country from coordinates:', error);
    throw new Error('Failed to detect country from location');
  }
};

export const detectPublicHolidays = async (): Promise<DetectedHoliday[]> => {
  try {
    // Get user's location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    // Get country code from coordinates
    const countryCode = await getCountryFromCoordinates(
      position.coords.latitude,
      position.coords.longitude
    );

    // Get current year
    const year = new Date().getFullYear();

    // Fetch holidays from Nager.Date API
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }

    const holidays: HolidayResponse[] = await response.json();

    // Transform the response to match our app's format
    return holidays.map(holiday => ({
      date: holiday.date,
      name: holiday.localName || holiday.name
    }));
  } catch (error) {
    console.error('Error detecting public holidays:', error);
    throw error;
  }
}; 