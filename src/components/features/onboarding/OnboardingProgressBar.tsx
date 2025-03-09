'use client';

import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface OnboardingProgressBarProps {
  className?: string;
}

// This defines the step order for calculating progress
const PROGRESS_STEPS: OnboardingStep[] = [
  'intro',
  'days-input',
  'strategy-selection',
  'holidays-selection',
  'company-days',
  'complete'
];

export function OnboardingProgressBar({ className }: OnboardingProgressBarProps) {
  const { currentStep, totalSteps, isOnboardingVisible } = useOnboarding();
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side only rendering for createPortal
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If onboarding is not visible or not mounted, don't show the progress bar
  if (!isOnboardingVisible || !isMounted) {
    return null;
  }
  
  // Calculate progress percentage
  const currentIndex = PROGRESS_STEPS.indexOf(currentStep);
  const progressPercentage = (currentIndex / (totalSteps)) * 100;
  const currentStepNumber = currentIndex + 1;
  
  const progressBarContent = (
    <div 
      className={cn(
        "fixed z-[9997] left-0 right-0 bottom-0 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-800",
        className
      )}
      role="progressbar"
      aria-label={`Onboarding progress: step ${currentStepNumber} of ${totalSteps}`}
      aria-valuenow={Math.round(progressPercentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.3 }}
      />

      {/* Numeric step indicator for larger screens */}
      <div className="hidden sm:flex absolute top-0 right-4 -translate-y-full mb-2 text-xs font-medium bg-white dark:bg-gray-900 px-2 py-1 rounded-t-md border border-b-0 border-gray-200 dark:border-gray-700 shadow-sm pointer-events-none select-none">
        <span className="text-teal-600 dark:text-teal-400">{currentStepNumber}</span>
        <span className="text-gray-500 dark:text-gray-400">/{totalSteps}</span>
      </div>
      
      {/* Hidden but accessible text for screen readers */}
      <span className="sr-only">
        {`Step ${currentStepNumber} of ${totalSteps}: ${currentStep}`}
      </span>
    </div>
  );
  
  // Use React's createPortal to render the progress bar in the document body
  return createPortal(progressBarContent, document.body);
} 