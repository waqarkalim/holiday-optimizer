'use client';

import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

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
  dismissOnboarding: (dontShowAgain: boolean) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  isCurrentStep: (step: OnboardingStep) => boolean;
}

type OnboardingAction =
  | { type: 'START_ONBOARDING' }
  | { type: 'DISMISS_ONBOARDING'; dontShowAgain: boolean }
  | { type: 'GO_TO_NEXT_STEP' }
  | { type: 'GO_TO_PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: OnboardingStep }
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
      return {
        ...state,
        isOnboardingVisible: false,
        hasCompletedOnboarding: action.dontShowAgain,
      };
    case 'GO_TO_NEXT_STEP': {
      const currentIndex = STEPS_ORDER.indexOf(state.currentStep);
      if (currentIndex < STEPS_ORDER.length - 1) {
        return { ...state, currentStep: STEPS_ORDER[currentIndex + 1] };
      }
      return state;
    }
    case 'GO_TO_PREV_STEP': {
      const currentIndex = STEPS_ORDER.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return { ...state, currentStep: STEPS_ORDER[currentIndex - 1] };
      }
      return state;
    }
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.step };
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
  goToStep: () => undefined,
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
  const startOnboarding = () => {
    dispatch({ type: 'START_ONBOARDING' });
  };

  // Dismiss onboarding
  const dismissOnboarding = (dontShowAgain: boolean) => {
    dispatch({ type: 'DISMISS_ONBOARDING', dontShowAgain });

    // If user doesn't want to see onboarding again, save to local storage
    if (dontShowAgain) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    }
  };

  // Navigate to next step
  const goToNextStep = () => dispatch({ type: 'GO_TO_NEXT_STEP' });

  // Navigate to previous step
  const goToPrevStep = () => dispatch({ type: 'GO_TO_PREV_STEP' });

  // Go to a specific step
  const goToStep = (step: OnboardingStep) => dispatch({ type: 'GO_TO_STEP', step });

  // Check if a step is the current one
  const isCurrentStep = (step: OnboardingStep) => state.currentStep === step;

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