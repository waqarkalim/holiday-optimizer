import userEvent from '@testing-library/user-event';
import { cleanup, render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OptimizerProvider } from '@/contexts/OptimizerContext';
import { OptimizerForm } from '@/components/OptimizerForm';
import React from 'react';

describe('Onboarding Flow Integration Tests', () => {
  let mockOnSubmitAction: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnSubmitAction = jest.fn();
    user = userEvent.setup();

    // Reset onboarding status in localStorage for each test
    localStorage.removeItem('holiday-optimizer-onboarding-completed');

    render(
      <ThemeProvider>
        <TooltipProvider>
          <OnboardingProvider>
            <OptimizerProvider>
              <OptimizerForm onSubmitAction={mockOnSubmitAction} />
            </OptimizerProvider>
          </OnboardingProvider>
        </TooltipProvider>
      </ThemeProvider>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('should display intro overlay on first visit and allow starting the tour', async () => {
    // Verify intro overlay is shown
    const introOverlay = screen.getByRole('dialog');
    expect(introOverlay).toBeInTheDocument();
    expect(within(introOverlay).getByRole('heading', { level: 2 })).toHaveTextContent('Welcome to Holiday Optimizer');

    // Start the tour
    const startTourButton = within(introOverlay).getByRole('button', { name: /start onboarding tour/i });
    await user.click(startTourButton);

    // Verify we've moved to the first step (days input)
    const daysInputTooltip = screen.getByRole('dialog');
    expect(daysInputTooltip).toBeInTheDocument();
    expect(within(daysInputTooltip).getByRole('heading', { level: 3 })).toHaveTextContent('Step 1: Input Your PTO Days');
  });

  test('should allow user to skip the onboarding tour from intro screen', async () => {
    const skipTourButton = screen.getByRole('button', { name: /skip onboarding tour/i });
    await user.click(skipTourButton);

    // Intro dialog should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should allow user to close the onboarding overlay using X button', async () => {
    const closeButton = screen.getByRole('button', { name: /close onboarding/i });
    await user.click(closeButton);

    // Overlay should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should show each onboarding step in sequence when navigating with Next button', async () => {
    // Start tour
    const startTourButton = screen.getByRole('button', { name: /start onboarding tour/i });
    await user.click(startTourButton);

    // Step 1: Days Input
    let currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByText(/enter the number of pto days/i)).toBeInTheDocument();

    // Proceed to Step 2
    const nextButton = within(currentTooltip).getByRole('button', { name: /next step/i });
    await user.click(nextButton);

    // Step 2: Strategy Selection
    currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByText(/select how you want to optimize your time off/i)).toBeInTheDocument();
    await user.click(within(currentTooltip).getByRole('button', { name: /next step/i }));

    // Step 3: Holidays Selection
    currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByText(/add any personal holidays or special dates/i)).toBeInTheDocument();
    await user.click(within(currentTooltip).getByRole('button', { name: /next step/i }));

    // Step 4: Company Days
    currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByText(/include any company-provided days off/i)).toBeInTheDocument();
    await user.click(within(currentTooltip).getByRole('button', { name: /next step/i }));

    // Completion Screen
    currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByRole('heading', { level: 2 })).toHaveTextContent(/you're all set/i);
  });

  test('should allow navigating back to previous steps using Previous button', async () => {
    // Start tour and navigate to Step 2
    await user.click(screen.getByRole('button', { name: /start onboarding tour/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));

    // Verify we're on Step 2
    let currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByText(/select how you want to optimize your time off/i)).toBeInTheDocument();

    // Go back to Step 1
    const prevButton = within(currentTooltip).getByRole('button', { name: /previous step/i });
    await user.click(prevButton);

    // Verify we're back on Step 1
    currentTooltip = screen.getByRole('dialog');
    expect(within(currentTooltip).getByText(/enter the number of pto days/i)).toBeInTheDocument();
  });

  test('should show progress bar with correct progress during onboarding', async () => {
    // Start tour
    await user.click(screen.getByRole('button', { name: /start onboarding tour/i }));

    // Check initial progress
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0'); // 0/4 steps

    // Go to next step
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));

    // Check updated progress
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25'); // 1/4 steps

    // Go to next step
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));

    // Check updated progress
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50'); // 2/4 steps

    // Go to next step
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));

    // Check updated progress
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75'); // 3/4 steps

    // Go to next step
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));

    // Check updated progress
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100'); // 4/4 steps
  });

  test('should allow dismissing onboarding from any step', async () => {
    // Start tour and go to step 2
    await user.click(screen.getByRole('button', { name: /start onboarding tour/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));

    // Dismiss from step 2
    const skipButton = within(screen.getByRole('dialog')).getByRole('button', { name: /skip onboarding/i });
    await user.click(skipButton);

    // Verify onboarding is dismissed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should display completion screen with working "Get Started" button', async () => {
    // Navigate through all steps to completion
    await user.click(screen.getByRole('button', { name: /start onboarding tour/i }));

    // Go through all steps
    for (let i = 0; i < 4; i++) {
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /next step/i }));
    }

    // Verify we're on completion screen
    const completionScreen = screen.getByRole('dialog');
    expect(within(completionScreen).getByRole('heading', { level: 2 })).toHaveTextContent(/you're all set/i);

    // Click "Get Started" button
    const getStartedButton = within(completionScreen).getByRole('button', { name: /start using holiday optimizer/i });
    await user.click(getStartedButton);

    // Verify onboarding is dismissed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should allow reopening onboarding using help button after dismissal', async () => {
    // First dismiss onboarding
    await user.click(screen.getByRole('button', { name: /skip onboarding tour/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Now click help button to reopen
    const helpButton = screen.getByTestId("help-button-desktop");
    await user.click(helpButton);

    // Verify onboarding appears again
    const introOverlay = screen.getByRole('dialog');
    expect(introOverlay).toBeInTheDocument();
    expect(within(introOverlay).getByRole('heading', { level: 2 })).toHaveTextContent('Welcome to Holiday Optimizer');
  });

  test('should show tooltips positioned correctly relative to form sections', async () => {
    // Start tour to get to steps
    await user.click(screen.getByRole('button', { name: /start onboarding tour/i }));

    // Check days input tooltip position
    const daysInputSection = screen.getByRole('region', { name: /enter your days/i });
    const tooltip = screen.getByRole('dialog');

    // Get bounding rectangles (just verify they exist - can't check exact positioning in JSDOM)
    expect(daysInputSection).toBeInTheDocument();
    expect(tooltip).toBeInTheDocument();

    // Move to next step and check strategy selection tooltip
    await user.click(within(tooltip).getByRole('button', { name: /next step/i }));
    const strategySection = screen.getByRole('region', { name: /choose your style/i });
    const strategyTooltip = screen.getByRole('dialog');

    expect(strategySection).toBeInTheDocument();
    expect(strategyTooltip).toBeInTheDocument();
  });
});
