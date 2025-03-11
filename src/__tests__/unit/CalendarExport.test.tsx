import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarExport } from '@/components/features/CalendarExport';
import { exportToGoogleCalendar, exportToICS } from '@/services/calendarExport';
import { toast } from 'sonner';
import { Break, OptimizationStats } from '@/types';

// Mock the export service functions
jest.mock('@/services/calendarExport', () => ({
  exportToICS: jest.fn().mockResolvedValue({ success: true, message: 'Export successful' }),
  exportToGoogleCalendar: jest.fn().mockReturnValue({ success: true, message: 'Export successful' }),
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

describe('CalendarExport Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when there are no breaks', () => {
    const { container } = render(
      <CalendarExport 
        breaks={[]} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render correctly when breaks are available', () => {
    render(
      <CalendarExport 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Export Calendar')).toBeInTheDocument();
    expect(screen.getByText('Take your vacation plan with you')).toBeInTheDocument();
    
    // Check that both export buttons are rendered
    expect(screen.getByRole('button', { name: /iCal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google Calendar/i })).toBeInTheDocument();
  });

  it('should call exportToICS when iCal button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CalendarExport 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    const icalButton = screen.getByRole('button', { name: /iCal/i });
    await user.click(icalButton);
    
    expect(exportToICS).toHaveBeenCalledWith({
      breaks: mockBreaks,
      stats: mockStats,
      selectedYear: mockYear,
    });
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Export Successful', {
        description: 'Export successful',
      });
    });
  });

  it('should call exportToGoogleCalendar when Google Calendar button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CalendarExport 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    const googleButton = screen.getByRole('button', { name: /Google Calendar/i });
    await user.click(googleButton);
    
    expect(exportToGoogleCalendar).toHaveBeenCalledWith({
      breaks: mockBreaks,
      stats: mockStats,
      selectedYear: mockYear,
    });
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Google Calendar Export', {
        description: 'Export successful',
      });
    });
  });

  it('should handle export errors correctly', async () => {
    // Set up the mock to return an error for this test
    (exportToICS as jest.Mock).mockResolvedValueOnce({ 
      success: false, 
      message: 'Export failed' 
    });
    
    const user = userEvent.setup();
    
    render(
      <CalendarExport 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    const icalButton = screen.getByRole('button', { name: /iCal/i });
    await user.click(icalButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Export Failed', {
        description: 'Export failed',
      });
    });
  });

  it('should handle unexpected errors in export process', async () => {
    // Set up the mock to throw an error
    (exportToICS as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));
    
    const user = userEvent.setup();
    
    render(
      <CalendarExport 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    const icalButton = screen.getByRole('button', { name: /iCal/i });
    await user.click(icalButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Export Failed', {
        description: 'An unexpected error occurred: Unexpected error',
      });
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <CalendarExport 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Check that export buttons have accessible names
    const icalButton = screen.getByRole('button', { 
      name: /Export to iCal format for Apple Calendar, Outlook, and other calendar applications/i 
    });
    expect(icalButton).toBeInTheDocument();
    
    const googleButton = screen.getByRole('button', { name: /Export to Google Calendar/i });
    expect(googleButton).toBeInTheDocument();
  });
}); 