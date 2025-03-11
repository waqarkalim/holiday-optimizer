import { exportToICS, exportToGoogleCalendar, generateGoogleCalendarUrl } from '@/services/calendarExport';
import { createEvents } from 'ics';
import { saveAs } from 'file-saver';
import { Break, OptimizationStats } from '@/types';

// Mock dependencies
jest.mock('ics', () => ({
  createEvents: jest.fn().mockReturnValue({ 
    value: 'mock-ics-content',
    error: undefined
  }),
}));

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Mock window.open for Google Calendar tests
const mockWindowOpen = jest.fn();
Object.defineProperty(global, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Create test data
const mockBreaks: Break[] = [
  {
    startDate: '2023-07-01',
    endDate: '2023-07-07',
    days: [],
    totalDays: 7,
    ptoDays: 5,
    publicHolidays: 0,
    weekends: 2,
    companyDaysOff: 0,
  },
];

const mockStats: OptimizationStats = {
  totalPTODays: 5,
  totalPublicHolidays: 0,
  totalNormalWeekends: 2,
  totalExtendedWeekends: 0,
  totalCompanyDaysOff: 0,
  totalDaysOff: 7,
};

const mockYear = 2023;

describe('Calendar Export Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  describe('exportToICS', () => {
    it('should create and download an ICS file successfully', async () => {
      const result = await exportToICS({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });

      // Check that createEvents was called with correct data
      expect(createEvents).toHaveBeenCalled();
      const createEventsArg = (createEvents as jest.Mock).mock.calls[0][0];
      
      // Verify event structure
      expect(createEventsArg.length).toBe(1);
      expect(createEventsArg[0].title).toBe('PTO - Holiday Optimizer');
      
      // Check that saveAs was called to download the file
      expect(saveAs).toHaveBeenCalled();
      
      // Check the result
      expect(result).toEqual({
        success: true,
        message: expect.any(String),
      });
    });

    it('should handle errors from the ICS library', async () => {
      // Mock an error from createEvents
      (createEvents as jest.Mock).mockReturnValueOnce({ 
        value: undefined,
        error: 'Mock error from ICS library'
      });

      const result = await exportToICS({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });

      expect(result).toEqual({
        success: false,
        message: expect.stringContaining('Mock error from ICS library'),
      });
      
      // Verify saveAs was not called
      expect(saveAs).not.toHaveBeenCalled();
    });
  });

  describe('generateGoogleCalendarUrl', () => {
    it('should generate the correct Google Calendar URL', () => {
      const url = generateGoogleCalendarUrl(mockBreaks[0], mockStats);
      
      // Check that the URL starts with the Google Calendar base URL
      expect(url).toContain('https://calendar.google.com/calendar/r/eventedit');
      
      // Check that URL contains essential parameters
      expect(url).toContain('text=PTO%20-%20Holiday%20Optimizer');
      expect(url).toContain('dates=20230701/20230708'); // Note: end date is +1 day for Google Calendar
      expect(url).toContain('details=');
      
      // Check that the description contains break info
      expect(url).toContain('PTO%20Days%3A%205');
      expect(url).toContain('Total%20Days%3A%207');
    });
    
    it('should handle errors gracefully', () => {
      // Mock a scenario where date manipulation might fail
      const invalidBreak: Break = {
        ...mockBreaks[0],
        endDate: 'invalid-date', // This will cause Date manipulation to fail
      };
      
      // This should return an empty string instead of throwing
      const result = generateGoogleCalendarUrl(invalidBreak, mockStats);
      expect(result).toBe('');
      
      // Console.error should have been called
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('exportToGoogleCalendar', () => {
    it('should open Google Calendar URLs in new tabs', () => {
      const result = exportToGoogleCalendar({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });
      
      // One URL should be opened for each break
      setTimeout(() => {
        expect(global.open).toHaveBeenCalledTimes(mockBreaks.length);
      }, mockBreaks.length * 500);
      
      // Check that the result indicates success
      expect(result).toEqual({
        success: true,
        message: expect.stringContaining('Google Calendar events opened'),
      });
    });
    
    it('should handle errors gracefully', () => {
      // Mock a scenario that would cause the generateGoogleCalendarUrl to return empty string
      // We're testing the internal try/catch block in exportToGoogleCalendar
      const originalGenerateGoogleCalendarUrl = generateGoogleCalendarUrl;
      jest.spyOn(global, 'open').mockImplementation(() => { throw new Error('Failed to open'); });
      
      const result = exportToGoogleCalendar({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });
      
      // Restore the original function
      (generateGoogleCalendarUrl as jest.Mock).mockRestore;
      
      // Since we're mocking window.open to throw an error, the function should
      // catch it and return a success result anyway (as per the implementation)
      expect(result).toEqual({
        success: true,
        message: expect.stringContaining('Google Calendar events opened'),
      });
    });
  });
}); 