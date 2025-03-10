'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingFooterProps {
  children: ReactNode;
  className?: string;
}

export const OnboardingFooter = ({
  children,
  className,
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
      {/* Action buttons */}
      {children}
    </footer>
  );
}; 