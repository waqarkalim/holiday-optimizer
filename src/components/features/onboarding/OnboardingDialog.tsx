'use client';

import { ReactNode, RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface OnboardingDialogProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
  overlayRef?: RefObject<HTMLDivElement>;
  maxWidth?: 'sm' | 'md' | 'lg';
  labelledBy: string;
  describedBy: string;
}

export function OnboardingDialog({
  children,
  isOpen,
  className,
  overlayRef,
  maxWidth = 'sm',
  labelledBy,
  describedBy
}: OnboardingDialogProps) {
  if (!isOpen) {
    return null;
  }

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-2xl'
  };

  const dialogContent = (
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
            `sm:h-auto sm:max-h-[90vh] sm:w-auto ${maxWidthClasses[maxWidth]} sm:m-auto sm:rounded-lg sm:shadow-xl`,
            className
          )}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            duration: 0.3, 
            type: 'spring',
            stiffness: 200,
            damping: 25
          }}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          tabIndex={-1} // Make the dialog focusable but not in the tab order
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
  
  // Use React's createPortal to render the overlay in the document body
  return createPortal(dialogContent, document.body);
} 