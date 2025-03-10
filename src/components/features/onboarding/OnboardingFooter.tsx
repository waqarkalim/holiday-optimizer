'use client';

import { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface OnboardingFooterProps {
  children: ReactNode;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
  className?: string;
  checkboxId: string;
}

export const OnboardingFooter = ({
  children,
  dontShowAgain,
  onDontShowAgainChange,
  className,
  checkboxId
}: OnboardingFooterProps) => {
  return (
    <footer
      className={cn(
        // Base styles
        "p-4 space-y-3",
        // Mobile fixed footer styling
        "absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 sm:border-0",
        // Desktop footer styling 
        "sm:static sm:p-6 sm:pt-3 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-t sm:border-gray-200 sm:dark:border-gray-700",
        className
      )}
    >
      {/* Checkbox for not showing again */}
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <Checkbox
          id={checkboxId}
          checked={dontShowAgain}
          onCheckedChange={(checked) => onDontShowAgainChange(checked as boolean)}
        />
        <label
          htmlFor={checkboxId}
          className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
        >
          Don&apos;t show this guide again
        </label>
      </div>
      
      {/* Action buttons */}
      {children}
    </footer>
  );
}; 