'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animation variant for the card
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  rightContent?: ReactNode;
  noPadding?: boolean;
}

export function SectionCard({
  children,
  className,
  icon,
  title,
  subtitle,
  rightContent,
  noPadding = false,
}: SectionCardProps) {
  return (
    <motion.div
      variants={item}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-sm",
        className
      )}
    >
      <div className={cn("relative", noPadding ? "" : "p-4 space-y-4")}>
        {/* Header Section - Only render if title is provided */}
        {title && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon && (
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-none mb-0.5">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {rightContent && (
              <div className="flex items-center">
                {rightContent}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </motion.div>
  );
} 