interface LocalityInfoItem {
  name: string;
  description?: string;
  isoName?: string;
  order: number;
  adminLevel?: number;
  isoCode?: string;
  wikidataId?: string;
  geonameId?: number;
}

interface LocalityInfo {
  administrative: LocalityInfoItem[];
  informative: LocalityInfoItem[];
}

interface GeoLocationResponse {
  latitude: number;
  lookupSource: string;
  longitude: number;
  localityLanguageRequested: string;
  continent: string;
  continentCode: string;
  countryName: string;
  countryCode: string;
  principalSubdivision: string;
  principalSubdivisionCode: string;
  city: string;
  locality: string;
  postcode: string;
  plusCode: string;
  csdCode: string;
  localityInfo: LocalityInfo;
}

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

const getCountryFromCoordinates = async (latitude: number, longitude: number): Promise<GeoLocationResponse> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    return await response.json();
  } catch (error) {
    console.error('Error getting country from coordinates:', error);
    throw new Error('Failed to detect country from location');
  }
};

export const detectPublicHolidays = async (year?: number): Promise<DetectedHoliday[]> => {
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
    const { countryCode, principalSubdivisionCode } = await getCountryFromCoordinates(
      position.coords.latitude,
      position.coords.longitude,
    );

    // Use provided year or default to current year
    const targetYear = year || new Date().getUTCFullYear();

    // Fetch holidays from Nager.Date API
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${targetYear}/${countryCode}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }

    const holidays: HolidayResponse[] = await response.json();

    const filteredHolidays = holidays.filter((holiday) => holiday.global || holiday.counties?.includes(principalSubdivisionCode));

    // Transform the response to match our app's format
    return filteredHolidays.map(holiday => ({
      date: holiday.date,
      name: holiday.localName || holiday.name,
    }));
  } catch (error) {
    console.error('Error detecting public holidays:', error);
    throw error;
  }
};