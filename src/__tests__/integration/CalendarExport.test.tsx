import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsDisplay } from '@/components/features/ResultsDisplay';
import { exportToICS, exportToPTOText } from '@/services/calendarExport';
import { toast } from 'sonner';
import { Break, OptimizationStats, OptimizedDay } from '@/types';

// Mock the export service functions
jest.mock('@/services/calendarExport', () => ({
  exportToICS: jest.fn().mockResolvedValue({ success: true, message: 'Export successful' }),
  exportToPTOText: jest.fn().mockResolvedValue({ success: true, message: 'Export successful' }),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock the child components to simplify testing
jest.mock('@/components/features/OptimizationStatsComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="optimization-stats">Optimization Stats</div>,
}));

jest.mock('@/components/features/BreakDetails', () => ({
  BreakDetails: () => <div data-testid="break-details">Break Details</div>,
}));

jest.mock('@/components/features/CalendarView', () => ({
  CalendarView: () => <div data-testid="calendar-view">Calendar View</div>,
}));

// Mock the SectionCard component
jest.mock('@/components/ui/section-card', () => ({
  SectionCard: ({ children, title }: React.PropsWithChildren<{ title: string }>) => (
    <div className="relative overflow-hidden rounded-xl" data-title={title}>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

// Create test data
const mockOptimizedDays: OptimizedDay[] = [
  {
    date: '2023-07-01',
    isWeekend: true,
    isPTO: false,
    isPartOfBreak: true,
    isPublicHoliday: false,
    isCompanyDayOff: false,
  },
  {
    date: '2023-07-02',
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
];

const mockBreaks: Break[] = [
  {
    startDate: '2023-07-01',
    endDate: '2023-07-07',
    days: mockOptimizedDays,
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

describe('CalendarExport Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render CalendarExport within ResultsDisplay', () => {
    render(
      <ResultsDisplay 
        optimizedDays={mockOptimizedDays} 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Check that all components are rendered, including CalendarExport
    expect(screen.getByTestId('optimization-stats')).toBeInTheDocument();
    expect(screen.getByTestId('break-details')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    expect(screen.getByText('Export Calendar')).toBeInTheDocument();
    
    // Check that both export buttons are rendered
    expect(screen.getByRole('button', { name: /iCal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /text/i })).toBeInTheDocument();
  });

  it('should not render CalendarExport when there are no breaks', () => {
    render(
      <ResultsDisplay 
        optimizedDays={[]} 
        breaks={[]} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Check that other components are rendered
    expect(screen.getByTestId('optimization-stats')).toBeInTheDocument();
    expect(screen.getByTestId('break-details')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    
    // CalendarExport should not be rendered
    expect(screen.queryByText('Export Calendar')).not.toBeInTheDocument();
  });

  it('should export to iCal when button is clicked in ResultsDisplay', async () => {
    const user = userEvent.setup();
    
    render(
      <ResultsDisplay 
        optimizedDays={mockOptimizedDays} 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Find and click the iCal export button
    const icalButton = screen.getByRole('button', { name: /iCal/i });
    await user.click(icalButton);
    
    // Verify that the export function was called with the correct params
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

  it('should export to text when button is clicked in ResultsDisplay', async () => {
    const user = userEvent.setup();
    
    render(
      <ResultsDisplay 
        optimizedDays={mockOptimizedDays} 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Find and click the text export button
    const textButton = screen.getByRole('button', { name: /text/i });
    await user.click(textButton);
    
    // Verify that the export function was called with the correct params
    expect(exportToPTOText).toHaveBeenCalledWith({
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

  it('should position CalendarExport at the top of ResultsDisplay', () => {
    render(
      <ResultsDisplay 
        optimizedDays={mockOptimizedDays} 
        breaks={mockBreaks} 
        stats={mockStats} 
        selectedYear={mockYear} 
      />
    );
    
    // Get all section cards by title attribute
    const sections = document.querySelectorAll('[data-title]');
    
    // Check that the first section is CalendarExport
    expect(sections[0]).toHaveAttribute('data-title', 'Export Calendar');
  });
}); 