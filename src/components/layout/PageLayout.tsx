import React from 'react';
import { cn, containerStyles } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <div className={cn("flex-grow", className)}>
      {children}
    </div>
  );
};

export const PageHeader = ({ children, className }: PageSectionProps) => {
  return (
    <div className={cn(
      "bg-gray-50/90 dark:bg-gray-900 border-b border-gray-200/60 dark:border-gray-700/30 py-6",
      className
    )}>
      <div className={containerStyles}>
        <div className="text-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PageTitle = ({ children, className }: PageSectionProps) => {
  return (
    <h1 className={cn(
      "text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
      className
    )}>
      {children}
    </h1>
  );
};

export const PageDescription = ({ children, className }: PageSectionProps) => {
  return (
    <p className={cn(
      "mt-2 text-sm text-gray-600 dark:text-gray-400",
      className
    )}>
      {children}
    </p>
  );
};

export const PageContent = ({ children, className, fullWidth = false }: PageSectionProps) => {
  return (
    <div className={cn("w-full py-6", className)}>
      <div className={cn(
        fullWidth ? containerStyles : "max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12"
      )}>
        {children}
      </div>
    </div>
  );
}; 