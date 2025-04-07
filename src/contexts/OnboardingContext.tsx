'use client';

import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { trackEvent } from '@/utils/tracking';

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

// The order of onboarding steps
const STEPS_ORDER: OnboardingStep[] = [
  'intro',
  'days-input',
  'strategy-selection',
  'holidays-selection',
  'company-days',
  'complete',
];

interface OnboardingState {
  isOnboardingVisible: boolean;
  hasCompletedOnboarding: boolean;
  currentStep: OnboardingStep;
  totalSteps: number;
}

interface OnboardingContextType extends OnboardingState {
  startOnboarding: () => void;
  dismissOnboarding: () => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  isCurrentStep: (step: OnboardingStep) => boolean;
}

type OnboardingAction =
  | { type: 'START_ONBOARDING' }
  | { type: 'DISMISS_ONBOARDING' }
  | { type: 'GO_TO_NEXT_STEP' }
  | { type: 'GO_TO_PREV_STEP' }
  | { type: 'SET_COMPLETED_STATUS'; isCompleted: boolean };

const initialState: OnboardingState = {
  isOnboardingVisible: false,
  hasCompletedOnboarding: false,
  currentStep: 'intro',
  totalSteps: STEPS_ORDER.length - 2, // exclude 'intro' and 'complete' from count
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'START_ONBOARDING':
      return {
        ...state,
        isOnboardingVisible: true,
        currentStep: 'intro',
      };
    case 'DISMISS_ONBOARDING':
      // Track onboarding dismissal
      trackEvent('Onboarding dismissed');

      return {
        ...state,
        isOnboardingVisible: false,
        hasCompletedOnboarding: true, // Always mark as completed when dismissed
      };
    case 'GO_TO_NEXT_STEP': {
      const currentStep = STEPS_ORDER.indexOf(state.currentStep);
      if (currentStep < STEPS_ORDER.length - 1) {
        const nextStep = STEPS_ORDER[currentStep + 1];

        return { ...state, currentStep: nextStep };
      }
      return state;
    }
    case 'GO_TO_PREV_STEP': {
      const currentStep = STEPS_ORDER.indexOf(state.currentStep);
      if (currentStep > 0) {
        const prevStep = STEPS_ORDER[currentStep - 1];

        return { ...state, currentStep: prevStep };
      }
      return state;
    }
    case 'SET_COMPLETED_STATUS':
      return { ...state, hasCompletedOnboarding: action.isCompleted };
    default:
      return state;
  }
}

// Default context value
const defaultContext: OnboardingContextType = {
  ...initialState,
  startOnboarding: () => undefined,
  dismissOnboarding: () => undefined,
  goToNextStep: () => undefined,
  goToPrevStep: () => undefined,
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

// Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Check local storage on mount
  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';

    dispatch({ type: 'SET_COMPLETED_STATUS', isCompleted: hasCompleted });

    // Auto-start onboarding for first-time visitors
    if (!hasCompleted) {
      dispatch({ type: 'START_ONBOARDING' });
    }
  }, []);

  // Start onboarding
  const startOnboarding = () => dispatch({ type: 'START_ONBOARDING' });

  // Dismiss onboarding
  const dismissOnboarding = () => {
    dispatch({ type: 'DISMISS_ONBOARDING' });

    // Always save to localStorage as completed (don't show again is always true)
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  };

  // Navigate to next step
  const goToNextStep = () => dispatch({ type: 'GO_TO_NEXT_STEP' });

  // Navigate to previous step
  const goToPrevStep = () => dispatch({ type: 'GO_TO_PREV_STEP' });

  // Check if a step is the current one
  const isCurrentStep = (step: OnboardingStep) => state.currentStep === step;

  // Context value
  const value: OnboardingContextType = {
    ...state,
    startOnboarding,
    dismissOnboarding,
    goToNextStep,
    goToPrevStep,
    isCurrentStep,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
} 