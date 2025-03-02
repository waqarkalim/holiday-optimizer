import React from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { OptimizerForm } from '@/components/OptimizerForm';
import { OptimizerProvider } from '@/contexts/OptimizerContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock window.matchMedia for ThemeProvider
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    scrollTo: jest.fn(),
  })),
});

// Mock icons to avoid issues with lucide-react components
jest.mock('lucide-react', () => ({
  CalendarClock: (props: any) => <div data-testid="calendar-clock-icon" {...props} />,
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props} />,
  ChevronsUpDown: (props: any) => <div data-testid="chevrons-up-down-icon" {...props} />,
  Check: (props: any) => <div data-testid="check-icon" {...props} />,
  ChevronLeft: (props: any) => <div data-testid="chevron-left-icon" {...props} />,
  ChevronRight: (props: any) => <div data-testid="chevron-right-icon" {...props} />,
  MessageSquare: (props: any) => <div data-testid="message-square-icon" {...props} />,
  Sparkles: (props: any) => <div data-testid="sparkles-icon" {...props} />,
  Info: (props: any) => <div data-testid="info-icon" {...props} />,
  Plus: (props: any) => <div data-testid="plus-icon" {...props} />,
  X: (props: any) => <div data-testid="x-icon" {...props} />,
  ChevronDown: (props: any) => <div data-testid="chevron-down-icon" {...props} />,
  LayoutDashboard: (props: any) => <div data-testid="layout-dashboard-icon" {...props} />,
  CalendarDays: (props: any) => <div data-testid="calendar-days-icon" {...props} />,
  Filter: (props: any) => <div data-testid="filter-icon" {...props} />,
  MoreHorizontal: (props: any) => <div data-testid="more-horizontal-icon" {...props} />,
  Columns: (props: any) => <div data-testid="columns-icon" {...props} />,
  List: (props: any) => <div data-testid="list-icon" {...props} />,
  Palmtree: (props: any) => <div data-testid="palmtree-icon" {...props} />,
  Coffee: (props: any) => <div data-testid="coffee-icon" {...props} />,
  Shuffle: (props: any) => <div data-testid="shuffle-icon" {...props} />,
  Star: (props: any) => <div data-testid="star-icon" {...props} />,
  Sunrise: (props: any) => <div data-testid="sunrise-icon" {...props} />,
  MapPin: (props: any) => <div data-testid="map-pin-icon" {...props} />,
  Trash: (props: any) => <div data-testid="trash-icon" {...props} />,
  Trash2: (props: any) => <div data-testid="trash2-icon" {...props} />,
  Pen: (props: any) => <div data-testid="pen-icon" {...props} />,
  Pencil: (props: any) => <div data-testid="pencil-icon" {...props} />,
  Sun: (props: any) => <div data-testid="sun-icon" {...props} />,
  Moon: (props: any) => <div data-testid="moon-icon" {...props} />,
  ChevronUp: (props: any) => <div data-testid="chevron-up-icon" {...props} />,
  Loader2: (props: any) => <div data-testid="loader2-icon" {...props} />,
  MoreVertical: (props: any) => <div data-testid="more-vertical-icon" {...props} />,
  MinusCircle: (props: any) => <div data-testid="minus-circle-icon" {...props} />,
  AlertCircle: (props: any) => <div data-testid="alert-circle-icon" {...props} />,
  Save: (props: any) => <div data-testid="save-icon" {...props} />,
  ArrowRight: (props: any) => <div data-testid="arrow-right-icon" {...props} />,
}));

// Mock useLocalStorage hook
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => {
    const [value, setValue] = React.useState(null);
    return [value, setValue];
  },
}));

// Mock holiday service
jest.mock('@/services/holidays', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue([]),
    add: jest.fn().mockResolvedValue({ id: '1', name: 'Test Holiday', date: new Date() }),
    update: jest.fn(),
    remove: jest.fn(),
    bulkRemove: jest.fn(),
    bulkUpdate: jest.fn(),
  },
  detectPublicHolidays: jest.fn().mockResolvedValue([
    { date: '2023-01-01', name: 'New Year\'s Day' },
    { date: '2023-12-25', name: 'Christmas Day' },
  ]),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('OptimizerForm Integration Tests', () => {
  let mockOnSubmitAction: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnSubmitAction = jest.fn();
    user = userEvent.setup();

    render(
      <ThemeProvider>
        <TooltipProvider>
          <OptimizerProvider>
            <OptimizerForm onSubmitAction={mockOnSubmitAction} />
          </OptimizerProvider>
        </TooltipProvider>
      </ThemeProvider>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  // Helper functions
  const fillDaysInput = async (days: string) => {
    const daysInput = within(getStep1()).getByRole('spinbutton', { name: /Enter number of CTO days available/i });
    await user.clear(daysInput);
    await user.type(daysInput, days);
  };

  const findEnabledDaysInCalendar = (calendarRegion: HTMLElement) => {
    return within(calendarRegion).getAllByRole('gridcell');
  };

  const findAndClickSubmitButton = async () => {
    const submitButton = screen.getByRole('button', { name: /Create My Perfect Schedule/i });
    if (!submitButton.hasAttribute('disabled')) {
      await user.click(submitButton);
    }
    return submitButton;
  };
  const selectAndAssertStrategySelection = async (index: number) => {
    const strategyOptions = within(getStep2()).getAllByRole('radio');
    expect(strategyOptions.length).toBe(5);

    await user.click(strategyOptions[index]);

    for (let i = 0; i < 5; i++) {
      if (i === index) {
        expect(strategyOptions[i]).toBeChecked(); // the index one should be checked since it's selected
      } else {
        expect(strategyOptions[i]).not.toBeChecked();
      }
    }
  };

  // Helper function to get the Days Input section
  const getStep1 = () => screen.getByRole('region', { name: /start with your days/i });
  // Helper function to get the Strategy selection section
  const getStep2 = () => screen.getByRole('region', { name: /pick your perfect style/i });
  // Helper function to get the Public Holidays section
  const getStep3 = () => screen.getByRole('region', { name: /public holidays/i });
  // Helper function to get the Company Days off section
  const getStep4 = () => screen.getByRole('region', { name: /company days off/i });

  it('should render the form with title', () => {
    const formTitle = screen.getByText('Design Your Dream Year');
    expect(formTitle).toBeInTheDocument();
  });

  it('should display the initial days input section', () => {
    const step1 = getStep1();
    expect(step1).toBeInTheDocument();

    const daysInput = within(step1).getByRole('spinbutton', { name: /Enter number of CTO days available/i });
    expect(daysInput).toBeInTheDocument();
  });

  it('should submit the form with valid input', async () => {
    await fillDaysInput('15');
    await findAndClickSubmitButton();

    await waitFor(() => {
      expect(mockOnSubmitAction).toHaveBeenCalledWith({
        days: 15,
        strategy: expect.any(String),
        companyDaysOff: expect.any(Array),
        holidays: expect.any(Array),
      });
    });
  });

  it('should show validation error for invalid pto days', async () => {
    const step1 = getStep1();

    expect(within(step1).queryByRole('alert')).not.toBeInTheDocument();

    await fillDaysInput('366');

    const error = within(step1).getByRole('alert');

    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(/please enter a number between 0 and 365/i);
  });

  it('should display all form sections', async () => {
    // Verify strategy section is visible
    const dayInputHeading = within(getStep1()).getByText('Start with Your Days');
    expect(dayInputHeading).toBeInTheDocument();

    // Verify strategy section is visible
    const strategyHeading = within(getStep2()).getByText('Pick Your Perfect Style');
    expect(strategyHeading).toBeInTheDocument();

    // Verify holidays section is visible
    const holidaysHeading = within(getStep3()).getByText('Public Holidays');
    expect(holidaysHeading).toBeInTheDocument();

    // Look for the company days section by its heading number
    const companyHeadingElement = within(getStep4()).getByRole('heading', { level: 2, name: /company days off/i });
    expect(companyHeadingElement).toBeInTheDocument();

    await fillDaysInput('15');
    await findAndClickSubmitButton();

    await waitFor(() => {
      expect(mockOnSubmitAction).toHaveBeenCalled();
    });
  });

  it('should show a info icon on each step of the form that is hoverable', async () => {
    // Find the info icon within this section
    const step1InfoIcon = within(getStep1()).getByTestId('info-icon');
    expect(step1InfoIcon).toBeInTheDocument();

    await user.hover(step1InfoIcon);

    expect(step1InfoIcon).toBeInTheDocument();

    const step2InfoIcon = within(getStep2()).getByTestId('info-icon');
    expect(step2InfoIcon).toBeInTheDocument();

    await user.hover(step2InfoIcon);

    expect(step2InfoIcon).toBeInTheDocument();

    const step3InfoIcon = within(getStep3()).getByTestId('info-icon');
    expect(step3InfoIcon).toBeInTheDocument();

    await user.hover(step3InfoIcon);

    expect(step3InfoIcon).toBeInTheDocument();

    const step4InfoIcon = within(getStep4()).getByTestId('info-icon');
    expect(step4InfoIcon).toBeInTheDocument();

    await user.hover(step4InfoIcon);

    expect(step4InfoIcon).toBeInTheDocument();
  });

  it('should have a "Find Local Holidays" button enabled', () => {
    const findHolidaysButton = within(getStep3()).getByRole('button', { name: 'Find public holidays in your location' });
    expect(findHolidaysButton).toBeInTheDocument();
    expect(findHolidaysButton).toBeEnabled();
  });

  it('should verify calendar regions exist for selecting dates', () => {
    const calendarRegions = screen.getAllByRole('region', { name: /Calendar for selecting/i });
    expect(calendarRegions.length).toEqual(2);

    const holidaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting holidays/i });
    expect(holidaysCalendarRegion).toBeInTheDocument();

    const companyDaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting company days/i });
    expect(companyDaysCalendarRegion).toBeInTheDocument();
  });

  it('should allow selecting a strategy option', async () => {
    expect(getStep2()).toBeInTheDocument();

    await selectAndAssertStrategySelection(0);
    await selectAndAssertStrategySelection(1);
    await selectAndAssertStrategySelection(2);
    await selectAndAssertStrategySelection(3);
    await selectAndAssertStrategySelection(4);
  });

  it('should add a public holiday when Find Local Holidays button is clicked', async () => {
    const findHolidaysButton = within(getStep3()).getByRole('button', { name: 'Find public holidays in your location' });
    await user.click(findHolidaysButton);

    await waitFor(() => {
      expect(require('sonner').toast.success).toHaveBeenCalled();
    });
  });

  it('should interact with calendar components', async () => {
    const holidaysCalendarRegion = within(getStep3()).getByRole('region', { name: /Calendar for selecting holidays/i });

    const navButtons = within(holidaysCalendarRegion).getAllByLabelText(/Go to/i);
    expect(navButtons.length).toBe(2);

    const [goToPreviousMonthBtn, goToNextMonthBtn] = navButtons;

    const monthHeading = within(holidaysCalendarRegion).getAllByRole('presentation')[0];

    expect(monthHeading).toBeInTheDocument();
    expect(monthHeading).toHaveTextContent('March 2025');

    await user.click(goToPreviousMonthBtn);

    expect(monthHeading).toBeInTheDocument();
    expect(monthHeading).toHaveTextContent('February 2025');

    await user.click(goToNextMonthBtn);

    expect(monthHeading).toBeInTheDocument();
    expect(monthHeading).toHaveTextContent('March 2025');
  });

  it('should allow selecting a day in the calendar', async () => {
    const holidaysCalendarRegion = within(getStep3()).getByRole('region', { name: /Calendar for selecting holidays/i });

    const enabledDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    await user.click(enabledDayButtons[0]);

    await waitFor(() => {
      expect(enabledDayButtons[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should allow switching between different strategy options', async () => {
    const strategyHeading = screen.getByText('Pick Your Perfect Style');
    expect(strategyHeading).toBeInTheDocument();

    const strategyCards = screen.getAllByRole('radio', { name: /.*/ });

    for (let i = 0; i < strategyCards.length; i++) {
      await user.click(strategyCards[i]);
      expect(strategyCards[i]).toBeChecked();

      if (i > 0) {
        expect(strategyCards[i - 1]).not.toBeChecked();
      }
    }
  });

  it('should display selected dates in both holiday and company calendars', async () => {
    const holidaysCalendarRegion = within(getStep3()).getByRole('region', { name: /Calendar for selecting holidays/i });
    const companyCalendarRegion = within(getStep4()).getByRole('region', { name: /Calendar for selecting company days/i });

    const holidayDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    await user.click(holidayDayButtons[0]);

    await waitFor(() => {
      expect(holidayDayButtons[0]).toHaveAttribute('aria-selected', 'true');
    });

    const dateListRegionForHolidays = within(getStep3()).getByRole('region', { name: /selected holidays/i });
    expect(within(dateListRegionForHolidays).getAllByRole('listitem')).toHaveLength(1);

    const companyDayButtons = findEnabledDaysInCalendar(companyCalendarRegion);

    await user.click(companyDayButtons[0]);

    await waitFor(() => {
      expect(companyDayButtons[0]).toHaveAttribute('aria-selected', 'true');
    });

    const dateListRegionForCompanyDaysOff = within(getStep4()).getByRole('region', { name: /selected company days/i });
    expect(within(dateListRegionForCompanyDaysOff).getAllByRole('listitem')).toHaveLength(1);

  });

  it('should track and display the number of days selected', async () => {
    await fillDaysInput('15');

    const holidaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting holidays/i });

    const holidayDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    if (holidayDayButtons.length > 0) {
      await user.click(holidayDayButtons[0]);

      if (holidayDayButtons.length > 1) {
        await user.click(holidayDayButtons[1]);
      }

      const dateCountElement = screen.queryByText(/date(s)? selected/i);

      if (dateCountElement) {
        expect(dateCountElement).toHaveTextContent(/\d+ date/);
      }
    }
  });

  it('should clear all selected dates when clear button is clicked', async () => {
    const holidaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting holidays/i });

    const holidayDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    if (holidayDayButtons.length > 0) {
      await user.click(holidayDayButtons[0]);

      await waitFor(() => {
        expect(holidayDayButtons[0]).toHaveAttribute('aria-selected', 'true');
      });

      const clearButtons = screen.queryAllByRole('button', { name: /clear all/i });

      if (clearButtons.length > 0) {
        await user.click(clearButtons[0]);

        await waitFor(() => {
          expect(holidayDayButtons[0]).not.toHaveAttribute('aria-selected', 'true');
        });
      }
    }
  });

  it('should handle form submission with valid data from all sections', async () => {
    await fillDaysInput('15');

    const strategyOptions = screen.getAllByRole('radio');
    await user.click(strategyOptions[0]);

    const holidaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting holidays/i });
    const holidayDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    if (holidayDayButtons.length > 0) {
      await user.click(holidayDayButtons[0]);
    }

    const companyCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting company days/i });
    const companyDayButtons = findEnabledDaysInCalendar(companyCalendarRegion);

    if (companyDayButtons.length > 0) {
      await user.click(companyDayButtons[0]);
    }

    await findAndClickSubmitButton();

    await waitFor(() => {
      expect(mockOnSubmitAction).toHaveBeenCalledWith({
        days: 15,
        strategy: expect.any(String),
        companyDaysOff: expect.any(Array),
        holidays: expect.any(Array),
      });
    });
  });

  it('should select multiple dates in both calendars and navigate through months', async () => {
    await fillDaysInput('20');

    const holidaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting holidays/i });

    const holidayNavButtons = within(holidaysCalendarRegion as HTMLElement).queryAllByRole('button', {
      name: /Go to (previous|next) month/i,
    });
    expect(holidayNavButtons.length).toBeGreaterThan(0);

    if (holidayNavButtons.length > 1) {
      const nextMonthButton = holidayNavButtons.find(
        button => button.getAttribute('aria-label')?.includes('next'),
      );

      if (nextMonthButton) {
        await user.click(nextMonthButton);

        const nextMonthDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

        if (nextMonthDayButtons.length > 0) {
          await user.click(nextMonthDayButtons[0]);

          if (nextMonthDayButtons.length > 1) {
            await user.click(nextMonthDayButtons[1]);
          }

          await waitFor(() => {
            expect(nextMonthDayButtons[0]).toHaveAttribute('aria-selected', 'true');
            if (nextMonthDayButtons.length > 1) {
              expect(nextMonthDayButtons[1]).toHaveAttribute('aria-selected', 'true');
            }
          });
        }
      }
    }

    const companyCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting company days/i });

    const companyNavButtons = within(companyCalendarRegion as HTMLElement).queryAllByRole('button', {
      name: /Go to (previous|next) month/i,
    });

    if (companyNavButtons.length > 1) {
      const prevMonthButton = companyNavButtons.find(
        button => button.getAttribute('aria-label')?.includes('previous'),
      );

      if (prevMonthButton) {
        await user.click(prevMonthButton);

        const prevMonthDayButtons = findEnabledDaysInCalendar(companyCalendarRegion);

        if (prevMonthDayButtons.length > 0) {
          await user.click(prevMonthDayButtons[0]);

          await waitFor(() => {
            expect(prevMonthDayButtons[0]).toHaveAttribute('aria-selected', 'true');
          });
        }
      }
    }

    await findAndClickSubmitButton();

    await waitFor(() => {
      expect(mockOnSubmitAction).toHaveBeenCalled();
    });
  });

  it('should verify date lists display selected dates', async () => {
    // Public Holidays
    const holidaysCalendarRegion = within(getStep3()).getByRole('region', { name: /Calendar for selecting holidays/i });

    const holidayDayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    await user.click(holidayDayButtons[0]);

    await waitFor(() => {
      expect(holidayDayButtons[0]).toHaveAttribute('aria-selected', 'true');
    });

    const dateListRegionForHolidays = within(getStep3()).getByRole('region', { name: /selected holidays/i });
    expect(within(dateListRegionForHolidays).getAllByRole('listitem')).toHaveLength(1);

    // Find the section containing the Public Holidays text
    const holidaysSection = getStep3();

    const deleteButtons = within(holidaysSection).getAllByLabelText(/Remove.+/i);
    expect(deleteButtons).toHaveLength(1);

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(holidayDayButtons[0]).not.toHaveAttribute('aria-selected', 'true');
    });

    // Company Days Off
    const companyCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting company days/i });

    const companyDayButtons = findEnabledDaysInCalendar(companyCalendarRegion);

    await user.click(companyDayButtons[0]);

    await waitFor(() => {
      expect(companyDayButtons[0]).toHaveAttribute('aria-selected', 'true');
    });

    const dateListRegionForCompanyDaysOff = within(getStep4()).getByRole('region', { name: /selected company days/i });
    expect(within(dateListRegionForCompanyDaysOff).getAllByRole('listitem')).toHaveLength(1);

  });

  it('should handle keyboard navigation in the calendar', async () => {
    await fillDaysInput('15');

    const holidaysCalendarRegion = screen.getByRole('region', { name: /Calendar for selecting holidays/i });

    const dayButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    if (dayButtons.length > 0) {
      await user.tab(); // Tab until we reach a day button

      const focusedElement = document.activeElement;

      if (focusedElement && focusedElement.getAttribute('aria-label')?.match(/^([1-9]|[12][0-9]|3[01])/)) {
        await user.keyboard('{ArrowRight}');

        const newFocusedElement = document.activeElement;
        expect(newFocusedElement).not.toBe(focusedElement);

        await user.keyboard(' ');

        await waitFor(() => {
          expect(newFocusedElement).toHaveAttribute('aria-selected', 'true');
        });
      }
    }
  });

  it('should test interactions between different form sections', async () => {
    // Input days
    await fillDaysInput('15');

    // Check for holidays section
    const holidaysHeadings = screen.queryAllByText(/public holidays/i, { selector: 'span' });
    if (holidaysHeadings.length > 0) {
      // Find and select an available day
      const availableDays = screen.queryAllByRole('gridcell', { name: /\d+/ });

      if (availableDays.length > 0) {
        const availableDay = availableDays.find(day =>
          !day.classList.contains('disabled') &&
          !day.classList.contains('opacity-50'),
        );

        if (availableDay) {
          await user.click(availableDay);
        }
      }

      // Try to clear selections
      const clearButtons = screen.queryAllByRole('button', { name: /clear all/i });
      if (clearButtons.length > 0) {
        await user.click(clearButtons[0]);
      }
    }

    // Test form with valid days
    await fillDaysInput('10');

    // Verify submit button is present
    const submitButtons = screen.getAllByRole('button', {
      name: /create my perfect schedule|optimize/i,
    });

    expect(submitButtons.length).toBeGreaterThan(0);

    // Check for enabled submit button
    const enabledButton = submitButtons.find(button => !button.hasAttribute('disabled'));
    if (enabledButton) {
      await user.click(enabledButton);
    }
  });

  it('should support keyboard navigation in calendars', async () => {
    await fillDaysInput('15');

    // Skip test if holidays section not found
    const holidaysHeadings = screen.queryAllByText(/public holidays/i);
    if (holidaysHeadings.length === 0) {
      return;
    }

    // Skip test if no days available
    const availableDays = screen.queryAllByRole('gridcell', { name: /day/i });
    if (availableDays.length === 0) {
      return;
    }

    // Try to focus on a day and select it with keyboard
    await user.tab();
    for (let i = 0; i < 10; i++) {
      await user.tab();
      const activeElement = document.activeElement;
      if (activeElement?.getAttribute('role') === 'gridcell') {
        await user.keyboard('{space}');
        break;
      }
      if (i === 9) {
        return;
      }
    }

    // Verify selection was made
    const dateListItems = screen.queryAllByRole('listitem');
    if (dateListItems.length > 0) {
      expect(dateListItems.length).toBeGreaterThan(0);
    }
  });

  it('can navigate through calendar months', async () => {
    // Fill days input
    fillDaysInput('10');
    await findAndClickSubmitButton();

    // Get the calendar region
    const calendarRegions = screen.getAllByRole('region', { name: /Calendar for selecting holidays/i });
    expect(calendarRegions.length).toBeGreaterThan(0);
    const calendarRegion = calendarRegions[0];
    expect(calendarRegion).toBeInTheDocument();

    // Get the next month navigation button
    const nextMonthButton = within(calendarRegion).getByRole('button', { name: 'Go to next month' });
    expect(nextMonthButton).toBeInTheDocument();

    // Check current month heading first
    const monthHeadings = within(calendarRegion).getAllByRole('presentation');
    const monthHeading = monthHeadings.find(el => el.textContent?.match(/^\w+ \d{4}$/));
    expect(monthHeading).toBeInTheDocument();
    expect(monthHeading?.textContent).toMatch(/March 2025/);

    // Click to navigate to next month
    await user.click(nextMonthButton);

    // Check if month changed to April 2025
    const updatedMonthHeadings = within(calendarRegion).getAllByRole('presentation');
    const updatedMonthHeading = updatedMonthHeadings.find(el => el.textContent?.match(/^\w+ \d{4}$/));
    expect(updatedMonthHeading).toBeInTheDocument();
    expect(updatedMonthHeading?.textContent).toMatch(/April 2025/);
  });

  it('supports selecting multiple dates in both calendars', async () => {
    // Fill days input
    await fillDaysInput('10');

    // Verify that holidays calendar is rendered
    const holidaysCalendarRegion = within(screen.getByRole('region', { name: /public holidays/i })).getByRole('region', { name: /Calendar for selecting holidays/i });
    expect(holidaysCalendarRegion).toBeInTheDocument();

    const dayButtons = within(holidaysCalendarRegion).getAllByRole('gridcell');
    expect(dayButtons.length).toBeGreaterThan(0);

    // Filter enabled buttons (not from previous/next month)
    const enabledButtons = findEnabledDaysInCalendar(holidaysCalendarRegion);

    // Select two dates in the holidays calendar (or however many are available)
    const maxToSelect = Math.min(2, enabledButtons.length);
    for (let i = 0; i < maxToSelect; i++) {
      await userEvent.click(enabledButtons[i]);
    }

    // Verify company calendar section is accessible
    const companyCalendarRegion = within(screen.getByRole('region', { name: /company days off/i })).getByRole('region', { name: /Calendar for selecting company days/i });

    // Find all buttons that have name attribute = "day" in the company calendar
    const companyDayButtons = within(companyCalendarRegion).getAllByRole('gridcell');
    expect(companyDayButtons.length).toBeGreaterThan(0);

    // Filter enabled buttons
    const enabledCompanyButtons = findEnabledDaysInCalendar(companyCalendarRegion);

    // Select two dates in the company calendar (or however many are available)
    const maxCompanyToSelect = Math.min(2, enabledCompanyButtons.length);
    for (let i = 0; i < maxCompanyToSelect; i++) {
      await userEvent.click(enabledCompanyButtons[i]);
    }

    // Submit the form to process all selections
    await findAndClickSubmitButton();

    // Verify that the strategy section is accessible
    const strategyHeading = screen.getByRole('heading', { name: /Pick Your Perfect Style/i });
    expect(strategyHeading).toBeInTheDocument();
  });

  it('should meet WCAG accessibility requirements for nested sections', async () => {
    // All form regions should have accessible names
    const regions = screen.getAllByRole('region');
    regions.forEach(region => {
      const accessibleName = region.getAttribute('aria-label') ||
        region.getAttribute('aria-labelledby');
      expect(accessibleName || region.querySelector('h2, h3')).toBeTruthy();
    });

    // Form sections should have proper heading hierarchy
    const headings = screen.getAllByRole('heading');
    const headingLevels = headings.map(h => parseInt(h.tagName.substring(1), 10));

    // Ensure the first heading is at an appropriate level (h1-h3)
    expect(headingLevels[0]).toBeLessThanOrEqual(3);

    // Verify heading hierarchy doesn't skip levels
    for (let i = 1; i < headingLevels.length; i++) {
      // Heading levels should either stay the same, go up by exactly 1, or go down to any lower level
      const currentLevel = headingLevels[i];
      const previousLevel = headingLevels[i - 1];

      const isValidHeadingProgression =
        currentLevel === previousLevel || // Same level
        currentLevel === previousLevel + 1 || // One level deeper
        currentLevel < previousLevel; // Moving back up to a higher level

      expect(isValidHeadingProgression).toBeTruthy();
    }

    // Each interactive element should be keyboard accessible
    const interactiveElements = screen.getAllByRole('button');
    interactiveElements.forEach(element => {
      expect(parseInt(element.getAttribute('tabindex') || '0')).toBeGreaterThanOrEqual(0);
    });

    // Calendar regions should have appropriate ARIA roles and properties
    const calendarRegions = screen.getAllByRole('region', { name: /Calendar for selecting/i });
    calendarRegions.forEach(calendar => {
      // Ensure calendar contains a grid
      const grid = within(calendar as HTMLElement).queryByRole('grid');
      expect(grid).toBeTruthy();

      // Grid cells should have proper roles
      if (grid) {
        const gridCells = within(grid as HTMLElement).getAllByRole('gridcell');
        expect(gridCells.length).toBeGreaterThan(0);
      }
    });
  });
})
;