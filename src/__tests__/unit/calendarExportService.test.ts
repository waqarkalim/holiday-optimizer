import { exportToICS } from '@/services/calendarExport';
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
});