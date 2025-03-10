'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Constants for local storage
const ONBOARDING_COMPLETED_KEY = 'holiday-optimizer-onboarding-completed';

// Onboarding step identifiers
export type OnboardingStep = 
  | 'intro' 
  | 'days-input' 
  | 'strategy-selection' 
  | 'holidays-selection' 
  | 'company-days' 
  | 'complete';

interface OnboardingState {
  isOnboardingVisible: boolean;
  hasCompletedOnboarding: boolean;
  currentStep: OnboardingStep;
  totalSteps: number;
}

interface OnboardingContextType extends OnboardingState {
  startOnboarding: () => void;
  dismissOnboarding: (dontShowAgain: boolean) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  isCurrentStep: (step: OnboardingStep) => boolean;
}

const defaultContext: OnboardingContextType = {
  isOnboardingVisible: false,
  hasCompletedOnboarding: false,
  currentStep: 'intro',
  totalSteps: 4, // 4 steps excluding intro and complete
  startOnboarding: () => {},
  dismissOnboarding: () => {},
  goToNextStep: () => {},
  goToPrevStep: () => {},
  goToStep: () => {},
  isCurrentStep: () => false,
};

// Create the context
const OnboardingContext = createContext<OnboardingContextType>(defaultContext);

// Hook for using the onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// The order of onboarding steps
const STEPS_ORDER: OnboardingStep[] = [
  'intro',
  'days-input',
  'strategy-selection',
  'holidays-selection',
  'company-days',
  'complete'
];

// Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  // State
  const [state, setState] = useState<OnboardingState>({
    isOnboardingVisible: false,
    hasCompletedOnboarding: false,
    currentStep: 'intro',
    totalSteps: STEPS_ORDER.length - 2, // exclude 'intro' and 'complete' from count
  });

  // Check local storage on mount
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
      setState(prev => ({ ...prev, hasCompletedOnboarding: hasCompleted }));
      
      // Auto-start onboarding for first-time visitors
      if (!hasCompleted) {
        setState(prev => ({ ...prev, isOnboardingVisible: true }));
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
  }, []);

  // Start onboarding
  const startOnboarding = () => {
    setState(prev => ({ 
      ...prev, 
      isOnboardingVisible: true,
      currentStep: 'intro'
    }));
  };

  // Dismiss onboarding
  const dismissOnboarding = (dontShowAgain: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isOnboardingVisible: false,
      hasCompletedOnboarding: dontShowAgain
    }));

    // If user doesn't want to see onboarding again, save to local storage
    if (dontShowAgain) {
      try {
        localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    setState(prev => {
      const currentIndex = STEPS_ORDER.indexOf(prev.currentStep);
      if (currentIndex < STEPS_ORDER.length - 1) {
        return { ...prev, currentStep: STEPS_ORDER[currentIndex + 1] };
      }
      return prev;
    });
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    setState(prev => {
      const currentIndex = STEPS_ORDER.indexOf(prev.currentStep);
      if (currentIndex > 0) {
        return { ...prev, currentStep: STEPS_ORDER[currentIndex - 1] };
      }
      return prev;
    });
  };

  // Go to a specific step
  const goToStep = (step: OnboardingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  // Check if a step is the current one
  const isCurrentStep = (step: OnboardingStep) => {
    return state.currentStep === step;
  };

  // Context value
  const value: OnboardingContextType = {
    ...state,
    startOnboarding,
    dismissOnboarding,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isCurrentStep,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
} 