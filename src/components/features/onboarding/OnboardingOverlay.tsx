'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Calendar, CheckCircle, ChevronRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

interface OnboardingOverlayProps {
  step: OnboardingStep;
  className?: string;
}

export function OnboardingOverlay({ step, className }: OnboardingOverlayProps) {
  const { isOnboardingVisible, isCurrentStep, goToNextStep, dismissOnboarding } = useOnboarding();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  
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
    if (isOnboardingVisible && isCurrentStep(step) && overlayRef.current) {
      // First, set focus to the dialog itself
      overlayRef.current.focus();
      
      // Move focus to the start button after animation completes
      const timer = setTimeout(() => {
        if (startButtonRef.current) {
          startButtonRef.current.focus();
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
          dismissOnboarding(false);
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
  }, [isOnboardingVisible, isCurrentStep, step, dismissOnboarding]);

  // If overlay shouldn't be visible, return null
  if (!isOnboardingVisible || !isCurrentStep(step) || !isMounted) {
    return null;
  }

  const overlayContent = (
    <AnimatePresence mode="wait">
      <div
        className="fixed inset-0 z-[9998] overflow-hidden flex flex-col"
        role="dialog"
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
          ref={overlayRef}
          className={cn(
            // Base styles
            'relative z-10 flex flex-col bg-white dark:bg-gray-900 overflow-hidden h-full w-full',
            // Only apply card styling on larger screens
            'sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-sm md:max-w-2xl sm:m-auto sm:rounded-lg sm:shadow-xl',
            className
          )}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-description"
          tabIndex={-1} // Make the dialog focusable but not in the tab order
        >
          {/* Header - Fixed for mobile, normal for desktop */}
          <header className={cn(
            "relative bg-gradient-to-r from-teal-600 to-blue-600 text-white",
            // Mobile header styling
            "flex items-center p-4",
            // Desktop header styling
            "sm:p-6"
          )}>
            <button
              onClick={() => dismissOnboarding(false)}
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
          
          {/* Actions - Fixed at bottom on mobile, within card on desktop */}
          <footer className={cn(
            // Base styles
            "p-4 space-y-3",
            // Mobile fixed footer styling
            "absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 sm:border-0",
            // Desktop footer styling 
            "sm:static sm:flex sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-3 sm:p-6 sm:pt-3 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-t sm:border-gray-200 sm:dark:border-gray-700"
          )}>
            {/* Checkbox for not showing again */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label
                htmlFor="dont-show-again"
                className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Don't show this guide again
              </label>
            </div>
            
            {/* Action buttons */}
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
                ref={startButtonRef}
                onClick={goToNextStep}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                aria-label="Start onboarding tour"
                type="button"
              >
                Start tour
                <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
  
  // Use React's createPortal to render the overlay in the document body
  return createPortal(overlayContent, document.body);
}

// Feature card component for the onboarding overlay
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <article className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 h-full">
      <div className="mb-2" aria-hidden="true">{icon}</div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">{title}</h4>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </article>
  );
} 