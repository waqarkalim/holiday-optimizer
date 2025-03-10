'use client';

import { RefObject, useRef } from 'react';
import { Calendar, CheckCircle, ChevronRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';
import { useOnboardingOverlay } from '@/hooks/useOnboardingOverlay';
import { OnboardingDialog } from './OnboardingDialog';
import { OnboardingFooter } from './OnboardingFooter';

interface OnboardingOverlayProps {
  step: OnboardingStep;
  className?: string;
}

// Feature card component for the onboarding overlay
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <article
    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 h-full">
    <div className="mb-2" aria-hidden="true">{icon}</div>
    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">{title}</h4>
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </article>
);

export function OnboardingOverlay({ step, className }: OnboardingOverlayProps) {
  const { goToNextStep, dismissOnboarding } = useOnboarding();
  const startButtonRef = useRef<HTMLButtonElement>(undefined);
  
  const {
    dontShowAgain,
    setDontShowAgain,
    overlayRef,
    shouldRender,
    handleDismiss
  } = useOnboardingOverlay({
    step,
    primaryButtonRef: startButtonRef as RefObject<HTMLButtonElement>,
  });
  
  if (!shouldRender) return null;

  return (
    <OnboardingDialog
      isOpen={shouldRender}
      className={className}
      overlayRef={overlayRef as RefObject<HTMLDivElement>}
      maxWidth="lg"
      labelledBy="onboarding-title"
      describedBy="onboarding-description"
    >
      {/* Header */}
      <header className={cn(
        "relative bg-gradient-to-r from-teal-600 to-blue-600 text-white",
        // Mobile header styling
        "flex items-center p-4",
        // Desktop header styling
        "sm:p-6"
      )}>
        <button
          onClick={() => handleDismiss()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close onboarding"
          type="button"
        >
          <X size={20} />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="flex items-center gap-3 pr-8">
          <div className="bg-white/20 rounded-full p-2 sm:p-3 flex-shrink-0">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 id="onboarding-title" className="text-xl sm:text-2xl font-semibold line-clamp-1">
              Welcome to Holiday Optimizer
            </h2>
            <p id="onboarding-description" className="text-sm sm:text-base text-white/90 line-clamp-2 mt-0.5">
              Let's optimize your time off to get the most out of your PTO days.
            </p>
          </div>
        </div>
      </header>
      
      {/* Content - Scrollable area */}
      <main className={cn(
        "flex-1 overflow-y-auto p-4 sm:p-6",
        // Add iOS-style momentum scrolling
        "overscroll-y-contain"
      )}>
        <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-0">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100">
            Maximize Your Days Off
          </h3>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Holiday Optimizer helps you strategically plan your paid time off (PTO) days
            to create longer breaks by combining them with weekends and holidays.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
            <FeatureCard 
              icon={<Calendar className="h-5 w-5 text-teal-600" />}
              title="Input your days"
              description="Tell us how many PTO days you have available to use."
            />
            <FeatureCard 
              icon={<Sparkles className="h-5 w-5 text-blue-600" />}
              title="Choose a strategy"
              description="Select how you want to optimize your time off."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              title="Get your plan"
              description="See the optimal schedule and maximize your breaks."
            />
          </div>
        </div>
      </main>
      
      {/* Footer with actions */}
      <OnboardingFooter
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
        checkboxId="dont-show-again"
      >
        <div className={cn(
          "flex gap-3",
          // Mobile full-width buttons
          "sm:w-auto"
        )}>
          <Button
            variant="outline"
            onClick={() => dismissOnboarding(dontShowAgain)}
            aria-label="Skip onboarding tour"
            type="button"
            className="flex-1 sm:flex-initial"
          >
            Skip tour
          </Button>
          <Button 
            ref={startButtonRef as RefObject<HTMLButtonElement>}
            onClick={goToNextStep}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
            aria-label="Start onboarding tour"
            type="button"
          >
            Start tour
            <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </OnboardingFooter>
    </OnboardingDialog>
  );
}
