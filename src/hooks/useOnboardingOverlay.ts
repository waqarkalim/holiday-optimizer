import { RefObject, useEffect, useRef, useState } from 'react';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';

interface UseOnboardingOverlayProps {
  step: OnboardingStep;
  primaryButtonRef?: RefObject<HTMLButtonElement>;
  onDismiss?: (dontShow: boolean) => void;
  initialDontShowAgain?: boolean;
}

export const useOnboardingOverlay = ({
  step,
  primaryButtonRef,
  onDismiss,
  initialDontShowAgain = false
}: UseOnboardingOverlayProps) => {
  const { isOnboardingVisible, isCurrentStep, dismissOnboarding } = useOnboarding();
  const [dontShowAgain, setDontShowAgain] = useState(initialDontShowAgain);
  const overlayRef = useRef<HTMLDivElement>(undefined);

  // Focus management
  useEffect(() => {
    if (isOnboardingVisible && isCurrentStep(step) && overlayRef.current) {
      // First, set focus to the dialog itself
      overlayRef.current.focus();
      
      // Move focus to the primary button after animation completes
      const timer = setTimeout(() => {
        if (primaryButtonRef?.current) {
          primaryButtonRef.current.focus();
        }
      }, 350); // After animation completes
      
      // Trap focus within the dialog
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        const focusableElements = overlayRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements?.length) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // Shift + Tab: go to the last element when tabbing backward from the first
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } 
        // Tab: go to the first element when tabbing forward from the last
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      };
      
      // Close on escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleDismiss();
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOnboardingVisible, isCurrentStep, step, primaryButtonRef]);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(dontShowAgain);
    } else {
      dismissOnboarding(dontShowAgain);
    }
  };

  // If overlay shouldn't be visible, return shouldRender as false
  const shouldRender = isOnboardingVisible && isCurrentStep(step);

  return {
    dontShowAgain,
    setDontShowAgain,
    overlayRef,
    shouldRender,
    handleDismiss
  };
}; 