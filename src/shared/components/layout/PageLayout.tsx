import React from 'react';
import { cn, containerStyles } from '@/shared/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  customPadding?: string;
}

export const PageLayout = ({ children, className }: PageLayoutProps) => {
  return <div className={cn('flex-grow', className)}>{children}</div>;
};

export const PageHeader = ({ children, className }: PageSectionProps) => {
  return (
    <div className={cn('bg-gray-50/90 border-b border-gray-200/60 py-6', className)}>
      <div className={containerStyles}>
        <div className="text-center">{children}</div>
      </div>
    </div>
  );
};

export const PageTitle = ({ children, className }: PageSectionProps) => {
  return (
    <h1 className={cn('text-2xl font-semibold tracking-tight text-gray-900', className)}>
      {children}
    </h1>
  );
};

export const PageDescription = ({ children, className }: PageSectionProps) => {
  return <p className={cn('mt-2 text-sm text-gray-600', className)}>{children}</p>;
};

export const PageContent = ({ children, className, fullWidth = false, customPadding }: PageSectionProps) => {
  const defaultPadding = customPadding ?? 'px-4 sm:px-6 lg:px-8 xl:px-12';

  return (
    <div className={cn('w-full py-0 sm:py-6', className)}>
      <div
        className={cn(
          fullWidth
            ? containerStyles
            : `max-w-[1400px] mx-auto ${defaultPadding}`
        )}
      >
        {children}
      </div>
    </div>
  );
};
