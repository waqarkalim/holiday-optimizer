import { exportToICS, exportToPTOText } from '@/services/calendarExport';
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

// Mock URL and document APIs
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

beforeAll(() => {
  // Setup window.URL mock
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
  
  // Setup document.createElement mock
  const mockAnchor = {
    href: '',
    download: '',
    click: mockClick,
  };
  global.document.createElement = jest.fn().mockReturnValue(mockAnchor);
  global.document.body.appendChild = mockAppendChild;
  global.document.body.removeChild = mockRemoveChild;
});

// Create test data
const mockBreaks: Break[] = [
  {
    startDate: '2023-07-01',
    endDate: '2023-07-07',
    days: [
      {
        date: '2023-07-01',
        isWeekend: true,
        isPTO: false,
        isPartOfBreak: true,
        isPublicHoliday: false,
        isCompanyDayOff: false,
      },
      {
        date: '2023-07-03',
        isWeekend: false,
        isPTO: true,
        isPartOfBreak: true,
        isPublicHoliday: false,
        isCompanyDayOff: false,
      },
    ],
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

  describe('exportToPTOText', () => {
    it('should create and download a text file successfully', async () => {
      const result = await exportToPTOText({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });

      // Check that URL.createObjectURL was called with a Blob
      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blob = mockCreateObjectURL.mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');

      // Check that the download was initiated
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      // Check the result
      expect(result).toEqual({
        success: true,
        message: 'PTO days have been exported to a text file.',
      });
    });

    it('should handle errors during file creation', async () => {
      // Mock URL.createObjectURL to throw an error
      mockCreateObjectURL.mockImplementationOnce(() => {
        throw new Error('Failed to create object URL');
      });

      const result = await exportToPTOText({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });

      expect(result).toEqual({
        success: false,
        message: 'Failed to create object URL',
      });

      // Verify cleanup functions were not called
      expect(mockClick).not.toHaveBeenCalled();
      expect(mockRemoveChild).not.toHaveBeenCalled();
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });

    it('should format the text content correctly', async () => {
      await exportToPTOText({
        breaks: mockBreaks,
        stats: mockStats,
        selectedYear: mockYear,
      });

      // Get the Blob content that was created
      const blob = mockCreateObjectURL.mock.calls[0][0];
      const textContent = await new Response(blob).text();

      // Verify the content structure
      expect(textContent).toContain(`PTO Days Export for ${mockYear}`);
      expect(textContent).toContain(`Total PTO Days: ${mockStats.totalPTODays}`);
      expect(textContent).toContain('Break 1');
      expect(textContent).toContain('July 3, 2023'); // The PTO day
      expect(textContent).not.toContain('July 1, 2023'); // The weekend day
    });
  });
});