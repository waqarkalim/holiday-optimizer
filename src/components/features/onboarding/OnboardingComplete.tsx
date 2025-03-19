'use client';

import { RefObject, useRef } from 'react';
import { CheckCircle, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';
import { useOnboardingOverlay } from '@/hooks/useOnboardingOverlay';
import { OnboardingDialog } from './OnboardingDialog';
import { OnboardingFooter } from './OnboardingFooter';

interface OnboardingCompleteProps {
  step: OnboardingStep;
  className?: string;
}

// Checklist item component
const ChecklistItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <div className="flex-shrink-0 mt-0.5">
      <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
    </div>
    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{text}</span>
  </li>
);

export const OnboardingComplete = ({ step, className }: OnboardingCompleteProps) => {
  const { dismissOnboarding } = useOnboarding();
  const getStartedButtonRef = useRef<HTMLButtonElement>(null);

  const {
    overlayRef,
    shouldRender,
    handleDismiss,
  } = useOnboardingOverlay({
    step,
    primaryButtonRef: getStartedButtonRef as RefObject<HTMLButtonElement>,
  });

  const handleGetStarted = () => {
    dismissOnboarding();

    // Scroll to the days input field after modal closes
    const daysInputElement = document.getElementById('days-input-container');
    if (daysInputElement) {
      // Improved scroll with better positioning
      daysInputElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Add a small delay before focusing to ensure scroll completes
      setTimeout(() => {
        const inputField = document.getElementById('days');
        if (inputField) {
          inputField.focus();
        }
      }, 300);
    }
  };

  if (!shouldRender) return null;

  return (
    <OnboardingDialog
      isOpen={shouldRender}
      className={className}
      overlayRef={overlayRef as RefObject<HTMLDivElement>}
      maxWidth="md"
      labelledBy="onboarding-complete-title"
      describedBy="onboarding-complete-description"
    >
      {/* Header - Success Banner */}
      <header className={cn(
        'relative bg-green-600 text-white',
        // Mobile header styling
        'flex flex-col items-center justify-center p-4 pt-8 pb-6',
        // Desktop header styling
        'sm:p-6 sm:pt-8 sm:pb-6',
      )}>
        <button
          onClick={() => handleDismiss()}
          className="absolute right-3 top-3 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close onboarding"
          type="button"
        >
          <X size={20} />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex justify-center mb-3">
          <div className="bg-white/20 rounded-full p-3">
            <PartyPopper className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <h2 id="onboarding-complete-title" className="text-xl sm:text-2xl font-semibold text-center">
          You&apos;re All Set!
        </h2>
      </header>

      {/* Content - Scrollable area */}
      <main className={cn(
        'flex-1 overflow-y-auto p-4 sm:p-6',
        // Add iOS-style momentum scrolling
        'overscroll-y-contain',
      )}>
        <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-0">
          <p id="onboarding-complete-description"
             className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center">
            Now you&apos;re ready to create your optimized holiday schedule.
            Fill in the form and hit &ldquo;Generate&rdquo; to see your personalized plan.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm sm:text-base">
              Follow these steps:
            </h3>
            <ul className="space-y-3" aria-label="Completion checklist">
              <ChecklistItem text="Input your available PTO days" />
              <ChecklistItem text="Choose your optimization strategy" />
              <ChecklistItem text="Add any personal holidays" />
              <ChecklistItem text="Include company days off" />
              <ChecklistItem text="Generate your optimized schedule" />
            </ul>
          </div>
        </div>
      </main>

      {/* Footer with action */}
      <OnboardingFooter>
        <Button
          ref={getStartedButtonRef}
          onClick={handleGetStarted}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
          aria-label="Start using Holiday Optimizer"
          type="button"
        >
          Get Started
        </Button>
      </OnboardingFooter>
    </OnboardingDialog>
  );
};
