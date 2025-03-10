import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  HelpButton,
  OnboardingCoachMark,
  OnboardingComplete,
  OnboardingOverlay,
  OnboardingProgressBar,
} from '@/components/features/onboarding';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the imports that are causing problems
jest.mock('@/contexts/OnboardingContext', () => ({
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOnboarding: () => ({
    isOnboardingVisible: true,
    hasCompletedOnboarding: false,
    currentStep: 'intro',
    totalSteps: 5,
    startOnboarding: jest.fn(),
    dismissOnboarding: jest.fn(),
    goToNextStep: jest.fn(),
    goToPrevStep: jest.fn(),
    goToStep: jest.fn(),
    isCurrentStep: () => true,
  }),
}));

// Mock the useOnboarding hook's functionality that we can test
const mockStartOnboarding = jest.fn();
const mockDismissOnboarding = jest.fn();
const mockGoToNextStep = jest.fn();
const mockGoToPrevStep = jest.fn();

describe('Onboarding Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock counts
    mockStartOnboarding.mockClear();
    mockDismissOnboarding.mockClear();
    mockGoToNextStep.mockClear();
    mockGoToPrevStep.mockClear();
  });

  describe('HelpButton', () => {
    test('should render help button with correct attributes', () => {
      // Render just the HelpButton component
      render(<TooltipProvider><HelpButton /></TooltipProvider>);

      // Test with getByRole following the frontend-testing guidelines (prefer role over testId)
      const helpButton = screen.getByRole('button', { name: /show onboarding guide/i });
      expect(helpButton).toBeInTheDocument();
    });
  });

  describe('OnboardingOverlay', () => {
    test('should show intro overlay with correct structure and elements', () => {
      // Render a mocked overlay with proper roles and markup
      render(<OnboardingOverlay step={'intro'} />);

      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('aria-modal', 'true');

      expect(within(overlay).getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(within(overlay).getByRole('heading', { level: 2 })).toHaveTextContent('Welcome to Holiday Optimizer');

      expect(within(overlay).getByText('Let\'s optimize your time off to get the most out of your PTO days.')).toBeInTheDocument();

      expect(within(overlay).getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(within(overlay).getByRole('heading', { level: 3 })).toHaveTextContent('Maximize Your Days Off');

      expect(within(overlay).getByText('Holiday Optimizer helps you strategically plan your paid time off (PTO) days to create longer breaks by combining them with weekends and holidays.')).toBeInTheDocument();

      expect(within(overlay).getAllByRole('article')).toHaveLength(3);

      const firstFeatureCard = within(overlay).getAllByRole('article').at(0)!;
      const secondFeatureCard = within(overlay).getAllByRole('article').at(1)!;
      const thirdFeatureCard = within(overlay).getAllByRole('article').at(2)!;

      expect(within(firstFeatureCard).getByTestId('calendar-icon')).toBeInTheDocument();
      expect(within(firstFeatureCard).getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(within(firstFeatureCard).getByRole('heading', { level: 4 })).toHaveTextContent('Input your days');
      expect(within(firstFeatureCard).getByText('Tell us how many PTO days you have available to use.')).toBeInTheDocument();

      expect(within(secondFeatureCard).getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(within(secondFeatureCard).getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(within(secondFeatureCard).getByRole('heading', { level: 4 })).toHaveTextContent('Choose a strategy');
      expect(within(secondFeatureCard).getByText('Select how you want to optimize your time off.')).toBeInTheDocument();

      expect(within(thirdFeatureCard).getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(within(thirdFeatureCard).getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(within(thirdFeatureCard).getByRole('heading', { level: 4 })).toHaveTextContent('Get your plan');
      expect(within(thirdFeatureCard).getByText('See the optimal schedule and maximize your breaks.')).toBeInTheDocument();

      expect(within(overlay).getByRole('checkbox', { name: 'Don\'t show this guide again' })).toBeInTheDocument();

      expect(within(overlay).getAllByRole('button')).toHaveLength(3);

      expect(within(overlay).getByRole('button', { name: 'Skip onboarding tour' })).toBeInTheDocument();
      expect(within(overlay).getByRole('button', { name: 'Skip onboarding tour' })).toHaveTextContent('Skip tour');
      expect(within(overlay).getByRole('button', { name: 'Start onboarding tour' })).toBeInTheDocument();
      expect(within(overlay).getByRole('button', { name: 'Start onboarding tour' })).toHaveTextContent('Start tour');

      expect(within(overlay).getByRole('button', { name: 'Close onboarding' })).toBeInTheDocument();
    });
  });

  describe('OnboardingTooltip', () => {
    test('should render tooltip with step-specific content and navigation buttons', () => {
      // Render a mock tooltip with proper accessibility attributes
      render(<OnboardingCoachMark step={'strategy-selection' as OnboardingCoachMark} title="Choose Your Strategy"
                                  description="Select how you want to optimize your time off."
                                  targetSelector="#strategy-selection-container" />);

      // Verify dialog is present with correct attributes
      const tooltip = screen.getByRole('dialog');
      expect(tooltip).toBeInTheDocument();

      expect(within(tooltip).getByRole('button', { name: 'Close onboarding tooltip' })).toBeInTheDocument();

      // Check for key content
      expect(within(tooltip).getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(within(tooltip).getByRole('heading', { level: 3 })).toHaveTextContent('Choose Your Strategy');
      expect(within(tooltip).getByText('Select how you want to optimize your time off.')).toBeInTheDocument();

      // Verify navigation buttons
      expect(within(tooltip).getByRole('button', { name: 'Previous step' })).toBeInTheDocument();
      expect(within(tooltip).getByRole('button', { name: 'Skip onboarding' })).toBeInTheDocument();
      expect(within(tooltip).getByRole('button', { name: 'Next step' })).toBeInTheDocument();
    });
  });

  describe('OnboardingComplete', () => {
    test('should render completion screen with finish button', async () => {
      render(<OnboardingComplete step="complete" />);

      const completionScreen = screen.getByRole('dialog');
      expect(completionScreen).toBeInTheDocument();

      expect(within(completionScreen).getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(within(completionScreen).getByRole('heading', { level: 2 })).toHaveTextContent('You\'re All Set!');

      expect(within(completionScreen).getByText(/now you.*re ready to create your optimized holiday schedule. Fill in the form and hit .*Generate.* to see your personalized plan./i)).toBeInTheDocument();

      expect(within(completionScreen).getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(within(completionScreen).getByRole('heading', { level: 3 })).toHaveTextContent('Follow these steps:');

      expect(within(completionScreen).getByRole('list')).toBeInTheDocument();
      expect(within(completionScreen).getAllByRole('listitem')).toHaveLength(5);
      expect(within(completionScreen).getAllByRole('listitem').at(0)).toHaveTextContent('Input your available PTO days');
      expect(within(completionScreen).getAllByRole('listitem').at(1)).toHaveTextContent('Choose your optimization strategy');
      expect(within(completionScreen).getAllByRole('listitem').at(2)).toHaveTextContent('Add any personal holidays');
      expect(within(completionScreen).getAllByRole('listitem').at(3)).toHaveTextContent('Include company days off');
      expect(within(completionScreen).getAllByRole('listitem').at(4)).toHaveTextContent('Generate your optimized schedule');

      expect(within(completionScreen).getByRole('checkbox', { name: 'Don\'t show this guide again' })).toBeInTheDocument();
      expect(within(completionScreen).getByRole('checkbox', { name: 'Don\'t show this guide again' })).toBeChecked();

      await userEvent.click(within(completionScreen).getByRole('checkbox', { name: 'Don\'t show this guide again' }));

      expect(within(completionScreen).getByRole('checkbox', { name: 'Don\'t show this guide again' })).not.toBeChecked();

      await userEvent.click(within(completionScreen).getByRole('checkbox', { name: 'Don\'t show this guide again' }));

      expect(within(completionScreen).getByRole('checkbox', { name: 'Don\'t show this guide again' })).toBeChecked();

      expect(within(completionScreen).getByRole('button', { name: 'Start using Holiday Optimizer' })).toBeInTheDocument();
      expect(within(completionScreen).getByRole('button', { name: 'Start using Holiday Optimizer' })).toHaveTextContent('Get Started');
    });
  });

  describe('OnboardingProgressBar', () => {
    test('should render progress bar with proper ARIA attributes', () => {
      // Render a mock progress bar with proper accessibility attributes
      render(<OnboardingProgressBar />);

      // Verify progress bar exists with proper attributes
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
}); 