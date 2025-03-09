'use client';

import { OnboardingOverlay } from './OnboardingOverlay';
import { OnboardingTooltip } from './OnboardingTooltip';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { OnboardingComplete } from './OnboardingComplete';

export function OnboardingContainer() {
  return (
    <>
      {/* Main Intro Overlay */}
      <OnboardingOverlay step="intro" />
      
      {/* Main Form Step Tooltips - mobile-friendly positioning */}
      <OnboardingTooltip
        step="days-input"
        targetSelector="#days-input-container"
        title="Step 1: Input Your PTO Days"
        description="Enter the number of PTO days you have available to use. The optimizer will strategically place these days to maximize your time off."
        colorScheme="teal"
        position="bottom"
        showPrevButton={false}
        scrollOffset={100}
      />
      
      <OnboardingTooltip
        step="strategy-selection"
        targetSelector="#strategy-selection-container"
        title="Step 2: Choose Your Strategy"
        description="Select how you want to optimize your time off. Each strategy offers a different approach to using your PTO days."
        colorScheme="blue"
        position="bottom"
        scrollOffset={120}
      />
      
      <OnboardingTooltip
        step="holidays-selection"
        targetSelector="#holidays-container"
        title="Step 3: Select Holidays"
        description="Add any personal holidays or special dates you want to include in your optimization. The calendar lets you click on dates to add them."
        colorScheme="amber"
        position="bottom"
        scrollOffset={130}
      />
      
      <OnboardingTooltip
        step="company-days"
        targetSelector="#company-days-container"
        title="Step 4: Add Company Days Off"
        description="Include any company-provided days off that don't count against your PTO. This helps the optimizer avoid scheduling PTO on days you already have free."
        colorScheme="violet"
        position="bottom"
        showNextButton={true}
        scrollOffset={150}
      />
      
      {/* Completion Screen */}
      <OnboardingComplete step="complete" />
      
      {/* Progress Bar */}
      <OnboardingProgressBar />
    </>
  );
} 