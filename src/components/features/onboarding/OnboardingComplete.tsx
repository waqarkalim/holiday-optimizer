'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface OnboardingCompleteProps {
  step: OnboardingStep;
  className?: string;
}

export function OnboardingComplete({ step, className }: OnboardingCompleteProps) {
  const { isOnboardingVisible, isCurrentStep, dismissOnboarding } = useOnboarding();
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const completeRef = useRef<HTMLDivElement>(null);
  const getStartedButtonRef = useRef<HTMLButtonElement>(null);
  
  // Handle client-side only rendering for createPortal
  useEffect(() => {
    setIsMounted(true);
    
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    // Check on mount and when resizing
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Focus management
  useEffect(() => {
    if (isOnboardingVisible && isCurrentStep(step) && completeRef.current) {
      // First, set focus to the dialog itself
      completeRef.current.focus();
      
      // Move focus to the "Get Started" button after animation
      const timer = setTimeout(() => {
        if (getStartedButtonRef.current) {
          getStartedButtonRef.current.focus();
        }
      }, 350); // After animation completes
      
      // Trap focus within the dialog
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        const focusableElements = completeRef.current?.querySelectorAll(
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
          dismissOnboarding(dontShowAgain);
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
  }, [isOnboardingVisible, isCurrentStep, step, dismissOnboarding, dontShowAgain]);

  // If component shouldn't be visible, return null
  if (!isOnboardingVisible || !isCurrentStep(step) || !isMounted) {
    return null;
  }

  const completeContent = (
    <AnimatePresence mode="wait">
      <dialog
        className="fixed inset-0 z-[9998] overflow-hidden flex flex-col"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
        />
        
        {/* Dialog Content - mobile full-screen, desktop card */}
        <motion.div
          ref={completeRef}
          className={cn(
            // Base styles
            'relative z-10 flex flex-col bg-white dark:bg-gray-900 overflow-hidden h-full w-full',
            // Only apply card styling on larger screens
            'sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-md sm:m-auto sm:rounded-lg sm:shadow-xl',
            className
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ 
            duration: 0.3, 
            type: 'spring',
            stiffness: 200,
            damping: 25
          }}
          aria-labelledby="onboarding-complete-title"
          aria-describedby="onboarding-complete-description"
          tabIndex={-1} // Make the dialog focusable but not in the tab order
        >
          {/* Header - Success Banner */}
          <header className={cn(
            "relative bg-gradient-to-r from-teal-600 to-green-600 text-white",
            // Mobile header styling
            "flex flex-col items-center justify-center p-4 pt-8 pb-6",
            // Desktop header styling
            "sm:p-6 sm:pt-8 sm:pb-6"
          )}>
            <button
              onClick={() => dismissOnboarding(dontShowAgain)}
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
              You're All Set!
            </h2>
          </header>
          
          {/* Content - Scrollable area */}
          <main className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6",
            // Add iOS-style momentum scrolling
            "overscroll-y-contain"
          )}>
            <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-0">
              <p id="onboarding-complete-description" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center">
                Now you're ready to create your optimized holiday schedule.
                Fill in the form and hit "Generate" to see your personalized plan.
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
          
          {/* Actions - Fixed at bottom on mobile, within card on desktop */}
          <footer className={cn(
            // Base styles
            "p-4 space-y-3",
            // Mobile fixed footer styling
            "absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 sm:border-0",
            // Desktop footer styling 
            "sm:static sm:p-6 sm:pt-3 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-t sm:border-gray-200 sm:dark:border-gray-700"
          )}>
            {/* Checkbox for not showing again */}
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <Checkbox
                id="dont-show-complete-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label
                htmlFor="dont-show-complete-again"
                className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Don't show this guide again
              </label>
            </div>
            
            {/* Action button */}
            <Button 
              ref={getStartedButtonRef}
              onClick={() => dismissOnboarding(dontShowAgain)}
              className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white h-11"
              aria-label="Start using Holiday Optimizer"
              type="button"
            >
              Get Started
            </Button>
          </footer>
        </motion.div>
      </dialog>
    </AnimatePresence>
  );
  
  // Use React's createPortal to render the completion screen in the document body
  return createPortal(completeContent, document.body);
}

// Checklist item component
function ChecklistItem({ text }: { text: string }) {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0 mt-0.5">
        <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
      </div>
      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{text}</span>
    </li>
  );
} 