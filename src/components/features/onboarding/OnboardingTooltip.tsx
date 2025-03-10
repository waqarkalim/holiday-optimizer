'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

interface OnboardingTooltipProps {
  targetSelector: string;
  title: string;
  description: string;
  step: OnboardingStep;
  position?: 'top' | 'right' | 'bottom' | 'left';
  colorScheme?: 'teal' | 'blue' | 'amber' | 'violet';
  showNextButton?: boolean;
  showPrevButton?: boolean;
  showSkipButton?: boolean;
  showCloseButton?: boolean;
  scrollOffset?: number; // Optional pixel offset for scrolling
}

const COLORS = {
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-950/70',
    border: 'border-teal-300 dark:border-teal-700',
    text: 'text-teal-900 dark:text-teal-50',
    title: 'text-teal-800 dark:text-teal-200',
    button: 'bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950/70',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-50',
    title: 'text-blue-800 dark:text-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950/70',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-900 dark:text-amber-50',
    title: 'text-amber-800 dark:text-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-950/70',
    border: 'border-violet-300 dark:border-violet-700',
    text: 'text-violet-900 dark:text-violet-50',
    title: 'text-violet-800 dark:text-violet-200',
    button: 'bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-500 dark:hover:bg-violet-600',
  },
};

export function OnboardingTooltip({
  targetSelector,
  title,
  description,
  step,
  position = 'bottom',
  colorScheme = 'teal',
  showNextButton = true,
  showPrevButton = true,
  showSkipButton = true,
  showCloseButton = true,
  scrollOffset = 120, // Default offset to ensure good visibility
}: OnboardingTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const [useBottomSheet, setUseBottomSheet] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const { isOnboardingVisible, isCurrentStep, goToNextStep, goToPrevStep, dismissOnboarding } = useOnboarding();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExtraSmall, setIsExtraSmall] = useState(false);
  
  // Handle client-side only rendering for createPortal
  useEffect(() => {
    setIsMounted(true);
    // Check screen sizes
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // sm breakpoint
      setIsExtraSmall(width < 380); // Very small mobile screens
      
      // Automatically use bottom sheet on very small screens
      setUseBottomSheet(width < 380);
    };
    
    // Check on mount and when resizing
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // Reset position state when step changes
  useEffect(() => {
    setIsPositioned(false);
  }, [step]);
  
  // Scroll to the target element when the tooltip becomes visible
  useEffect(() => {
    if (isOnboardingVisible && isCurrentStep(step)) {
      const targetElement = document.querySelector(targetSelector) as HTMLElement;
      if (targetElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const elementRect = targetElement.getBoundingClientRect();
          const isElementInViewport = 
            elementRect.top >= 0 && 
            elementRect.left >= 0 && 
            elementRect.bottom <= window.innerHeight && 
            elementRect.right <= window.innerWidth;
          
          // Only scroll if the element is not already fully visible
          if (!isElementInViewport) {
            const elementTop = window.scrollY + elementRect.top;
            
            // Scroll to position with offset (slightly above the element)
            window.scrollTo({
              top: elementTop - scrollOffset,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [isOnboardingVisible, isCurrentStep, step, targetSelector, scrollOffset]);
  
  // Positioning calculations
  useEffect(() => {
    const calculatePosition = () => {
      // If we're using a bottom sheet, position is fixed
      if (useBottomSheet) {
        setTooltipPosition({ top: 0, left: 0 }); // Not used for bottom sheet
        setIsPositioned(true);
        return;
      }
      
      const targetElement = document.querySelector(targetSelector) as HTMLElement;
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Default to bottom positioning on mobile devices
      const effectivePosition = isMobile ? 'bottom' : position;
      
      // Calculate position based on specified position
      let top = 0;
      let left = 0;
      
      switch (effectivePosition) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 10;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 10;
          break;
      }
      
      // On mobile, handle differently for very small screens
      if (isMobile) {
        // For very small screens, center horizontally and adjust vertical position
        if (windowWidth < 350) {
          left = (windowWidth - tooltipRect.width) / 2;
        }
        
        // Ensure the top is never too close to the top of the screen
        if (top < 60) {
          top = Math.max(60, targetRect.bottom + 10);
        }
      }
      
      // Ensure the tooltip stays within viewport
      // Left boundary
      left = Math.max(10, left);
      
      // Right boundary
      if (left + tooltipRect.width > windowWidth - 10) {
        left = windowWidth - tooltipRect.width - 10;
      }
      
      // Top boundary
      top = Math.max(10, top);
      
      // Bottom boundary
      if (top + tooltipRect.height > windowHeight - 10) {
        // On mobile, prefer pushing tooltip upward if it overflows at bottom
        if (isMobile) {
          top = Math.max(10, targetRect.top - tooltipRect.height - 10);
        } else {
          top = windowHeight - tooltipRect.height - 10;
        }
      }
      
      setTooltipPosition({ top, left });
      setIsPositioned(true);
    };

    // Position on mount and when target or visibility changes
    if (isOnboardingVisible && isCurrentStep(step)) {
      // Add highlight to target element
      const targetElement = document.querySelector(targetSelector) as HTMLElement;
      if (targetElement) {
        targetElement.classList.add('ring-2', `ring-${colorScheme}-500`, 'ring-offset-2', 'transition-all', 'duration-300');
        
        // Calculate initial position
        setTimeout(calculatePosition, 50);
        
        // Recalculate on resize and scroll
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition);
      }
    }

    return () => {
      // Remove highlight and cleanup event listeners
      const targetElement = document.querySelector(targetSelector) as HTMLElement;
      if (targetElement) {
        targetElement.classList.remove('ring-2', `ring-${colorScheme}-500`, 'ring-offset-2', 'transition-all', 'duration-300');
      }
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isOnboardingVisible, isCurrentStep, step, targetSelector, position, colorScheme, isMobile, useBottomSheet]);

  // Focus management
  useEffect(() => {
    if (isOnboardingVisible && isCurrentStep(step) && tooltipRef.current && isPositioned) {
      // First focus the tooltip itself
      tooltipRef.current.focus();
      
      // After animation, focus the primary action button (usually "Next")
      const timer = setTimeout(() => {
        if (nextButtonRef.current) {
          nextButtonRef.current.focus();
        }
      }, 150);
      
      // Trap focus within the tooltip
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !tooltipRef.current) return;
        
        const focusableElements = tooltipRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements.length) return;
        
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
      
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOnboardingVisible, isCurrentStep, step, isPositioned]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOnboardingVisible || !isCurrentStep(step)) return;
      
      switch (e.key) {
        case 'Escape':
          dismissOnboarding(false);
          break;
        case 'ArrowRight':
          if (showNextButton) {
            e.preventDefault();
            goToNextStep();
          }
          break;
        case 'ArrowLeft':
          if (showPrevButton) {
            e.preventDefault();
            goToPrevStep();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingVisible, isCurrentStep, step, goToNextStep, goToPrevStep, dismissOnboarding, showNextButton, showPrevButton]);

  // If tooltip shouldn't be visible, return null
  if (!isOnboardingVisible || !isCurrentStep(step) || !isMounted) {
    return null;
  }

  const tooltipId = `tooltip-${step}`;
  const descriptionId = `tooltip-description-${step}`;

  // Use different styling based on screen size
  if (useBottomSheet) {
    // Bottom sheet for very small screens (< 380px)
    return createPortal(
      <AnimatePresence mode="wait">
        <div className="fixed inset-0 z-[9998] overflow-hidden flex flex-col">
          {/* Backdrop with touch dismiss */}
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            onClick={() => dismissOnboarding(false)}
          />
          
          {/* Bottom sheet */}
          <motion.div
            ref={tooltipRef}
            className={cn(
              // Base styles
              'fixed z-20 bottom-0 left-0 right-0 rounded-t-xl shadow-xl',
              // Color scheme
              COLORS[colorScheme].bg,
              COLORS[colorScheme].border,
              COLORS[colorScheme].text,
              // Bottom sheet specific styles
              'border-t border-l border-r',
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            role="dialog"
            aria-labelledby={tooltipId}
            aria-describedby={descriptionId}
            tabIndex={-1}
          >
            {/* Pull indicator */}
            <div className="w-full flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            
            <div className="p-4 space-y-3">
              {/* Title and description */}
              <header>
                <h3 id={tooltipId} className={cn('text-base font-medium', COLORS[colorScheme].title)}>
                  {title}
                </h3>
                <p id={descriptionId} className="text-sm mt-1 leading-relaxed">
                  {description}
                </p>
              </header>
              
              {/* Buttons */}
              <footer className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                <div className="space-x-2">
                  {showPrevButton && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevStep}
                      tabIndex={0}
                      className="h-9 px-3 text-sm"
                      aria-label="Previous step"
                      type="button"
                    >
                      <ChevronLeft size={14} aria-hidden="true" />
                      <span className="sr-only sm:not-sr-only">Prev</span>
                    </Button>
                  )}
                  
                  {showSkipButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissOnboarding(false)}
                      tabIndex={0}
                      className="h-9 px-3 text-sm"
                      aria-label="Skip onboarding"
                      type="button"
                    >
                      Skip
                    </Button>
                  )}
                </div>
                
                {showNextButton && (
                  <Button
                    ref={nextButtonRef}
                    size="sm"
                    onClick={goToNextStep}
                    tabIndex={0}
                    className={cn(
                      "h-9 px-4 min-w-[4rem] text-sm",
                      COLORS[colorScheme].button
                    )}
                    aria-label="Next step"
                    type="button"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} aria-hidden="true" className="ml-1" />
                  </Button>
                )}
              </footer>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>,
      document.body
    );
  }

  // Standard tooltip for larger screens
  const tooltipContent = (
    <AnimatePresence mode="wait">
      <motion.div
        ref={tooltipRef}
        className={cn(
          // Base styles
          'fixed z-[9999] rounded-lg shadow-lg border p-4',
          // Responsive width - narrow on mobile, wider on desktop
          'w-[calc(100vw-2rem)] max-w-[20rem] sm:w-80',
          // Color scheme classes
          COLORS[colorScheme].bg,
          COLORS[colorScheme].border,
          COLORS[colorScheme].text,
          // Hide until positioned to prevent flashing
          !isPositioned && 'opacity-0'
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isPositioned ? 1 : 0, 
          scale: isPositioned ? 1 : 0.9,
          transition: {
            opacity: { duration: 0.2 },
            scale: { type: 'spring', stiffness: 200, damping: 25 }
          }
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        role="dialog"
        aria-labelledby={tooltipId}
        aria-describedby={descriptionId}
        tabIndex={-1} // Make focusable but not in tab order
      >
        <div className="flex flex-col space-y-3">
          {/* Close button */}
          {showCloseButton && (
            <button 
              onClick={() => dismissOnboarding(false)}
              className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close onboarding tooltip"
              type="button"
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </button>
          )}
          
          {/* Title and description */}
          <header>
            <h3 id={tooltipId} className={cn('text-base sm:text-lg font-medium', COLORS[colorScheme].title)}>
              {title}
            </h3>
            <p id={descriptionId} className="text-sm mt-1 leading-relaxed">
              {description}
            </p>
          </header>
          
          {/* Buttons */}
          <footer className={cn(
            "flex items-center mt-2 pt-2 border-t",
            `border-${colorScheme}-200 dark:border-${colorScheme}-800`,
            // Adjust layout based on available buttons
            showPrevButton || showSkipButton 
              ? "justify-between" 
              : "justify-end"
          )}>
            <div className="space-x-2 flex flex-wrap gap-2">
              {showPrevButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevStep}
                  tabIndex={0}
                  className="gap-1 h-9 px-3 py-2 text-sm"
                  aria-label="Previous step"
                  type="button"
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                  <span>Prev</span>
                </Button>
              )}
              
              {showSkipButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissOnboarding(false)}
                  tabIndex={0}
                  className="h-9 px-3 py-2 text-sm"
                  aria-label="Skip onboarding"
                  type="button"
                >
                  Skip
                </Button>
              )}
            </div>
            
            {showNextButton && (
              <Button
                ref={nextButtonRef}
                size="sm"
                onClick={goToNextStep}
                tabIndex={0}
                className={cn(
                  "gap-1 h-9 px-3 py-2 min-w-[5rem] text-sm",
                  COLORS[colorScheme].button
                )}
                aria-label="Next step"
                type="button"
              >
                <span>Next</span>
                <ChevronRight size={14} aria-hidden="true" />
              </Button>
            )}
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  // Use React's createPortal to render the tooltip in the document body
  return createPortal(tooltipContent, document.body);
} 