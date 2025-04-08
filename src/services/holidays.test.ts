import { getAvailableCountries, getPublicHolidaysByCountry, extractSubdivisions, getHolidaysBySubdivision } from './holidays';

// Simple test for getAvailableCountries
describe('getAvailableCountries', () => {
  it('should return a list of countries', async () => {
    const countries = await getAvailableCountries();
    
    // Verify countries are returned
    expect(countries).toBeDefined();
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);
    
    // Verify structure of a country
    const country = countries[0];
    expect(country).toHaveProperty('countryCode');
    expect(country).toHaveProperty('name');
  });
});

// Test for getPublicHolidaysByCountry
describe('getPublicHolidaysByCountry', () => {
  it('should return holidays for a given country and year', async () => {
    const holidays = await getPublicHolidaysByCountry('US', 2023);
    
    // Verify holidays are returned
    expect(holidays).toBeDefined();
    expect(Array.isArray(holidays)).toBe(true);
    expect(holidays.length).toBeGreaterThan(0);
    
    // Verify structure of a holiday
    const holiday = holidays[0];
    expect(holiday).toHaveProperty('date');
    expect(holiday).toHaveProperty('name');
    expect(holiday).toHaveProperty('countryCode', 'US');
  });
});

// Test for extractSubdivisions
describe('extractSubdivisions', () => {
  it('should extract subdivisions from a country', async () => {
    // First get holidays for a country with subdivisions (e.g., US)
    const holidays = await getPublicHolidaysByCountry('US', 2023);
    
    // Extract subdivisions
    const subdivisions = extractSubdivisions(holidays);
    
    // Verify subdivisions are returned
    expect(subdivisions).toBeDefined();
    expect(Array.isArray(subdivisions)).toBe(true);
    
    // US should have subdivisions (states)
    if (subdivisions.length > 0) {
      const subdivision = subdivisions[0];
      expect(subdivision).toHaveProperty('code');
      expect(subdivision).toHaveProperty('name');
    }
  });
});

// Test for getHolidaysBySubdivision
describe('getHolidaysBySubdivision', () => {
  it('should return holidays filtered by subdivision', async () => {
    // Get holidays for US
    const holidays = await getPublicHolidaysByCountry('US', 2023);
    
    // Get subdivisions
    const subdivisions = extractSubdivisions(holidays);
    
    // If there are subdivisions, test with the first one
    if (subdivisions.length > 0) {
      const subdivisionCode = subdivisions[0].code;
      const filteredHolidays = getHolidaysBySubdivision(holidays, subdivisionCode);
      
      // Verify filtered holidays
      expect(filteredHolidays).toBeDefined();
      expect(Array.isArray(filteredHolidays)).toBe(true);
      
      // Each holiday should have date and name
      if (filteredHolidays.length > 0) {
        const holiday = filteredHolidays[0];
        expect(holiday).toHaveProperty('date');
        expect(holiday).toHaveProperty('name');
      }
    } else {
      // Just test without subdivision
      const allHolidays = getHolidaysBySubdivision(holidays);
      expect(allHolidays).toBeDefined();
      expect(Array.isArray(allHolidays)).toBe(true);
    }
  });
}); 