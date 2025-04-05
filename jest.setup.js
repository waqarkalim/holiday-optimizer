// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Set a longer default timeout for all tests
jest.setTimeout(300000); // 5 minutes for all tests

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock window.scrollTo since it's not implemented in jsdom
window.scrollTo = jest.fn();

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
  })),
});

// We need to mock icons since they're SVG components that Jest can't render
// but we're NOT mocking any actual child components of OptimizerForm
jest.mock('lucide-react', () => ({
  CalendarClock: () => <div data-testid="calendar-clock-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  ChevronsUpDown: () => <div data-testid="chevrons-up-down-icon" />,
  Check: () => <div data-testid="check-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  LayoutDashboard: () => <div data-testid="layout-dashboard-icon" />,
  CalendarDays: () => <div data-testid="calendar-days-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
  Columns: () => <div data-testid="columns-icon" />,
  List: () => <div data-testid="list-icon" />,
  Palmtree: () => <div data-testid="palmtree-icon" />,
  Coffee: () => <div data-testid="coffee-icon" />,
  Shuffle: () => <div data-testid="shuffle-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Sunrise: () => <div data-testid="sunrise-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Trash: () => <div data-testid="trash-icon" />,
  Trash2: () => <div data-testid="trash2-icon" />,
  Pen: () => <div data-testid="pen-icon" />,
  Pencil: () => <div data-testid="pencil-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
  Moon: () => <div data-testid="moon-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Loader2: () => <div data-testid="loader2-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  MinusCircle: () => <div data-testid="minus-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Save: () => <div data-testid="save-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  HelpCircle: () => <div data-testid="help-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  PartyPopper: () => <div data-testid="party-popper-icon" />,
  Download: () => <div data-testid="download-icon">Download Icon</div>,
  InfoIcon: () => <div data-testid="info-icon">Info Icon</div>,
}));

// Mock useLocalStorage hook
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => {
    const [value, setValue] = React.useState(null);
    return [value, setValue];
  },
}));

jest.mock('iso-3166', () => ({
  // ...jest.requireActual('iso-3166'),
}));

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

