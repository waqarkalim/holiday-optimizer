import React from 'react';
import { cn } from '@/shared/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'neutral';
  className?: string;
  label?: string;
  description?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  className,
  label,
  description,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const variantClasses = {
    primary: 'border-violet-200 border-t-violet-500',
    secondary: 'border-blue-200 border-t-blue-500',
    neutral: 'border-gray-200 border-t-gray-500',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div
        className={cn('animate-spin rounded-full', sizeClasses[size], variantClasses[variant])}
        aria-hidden="true"
      />

      {(label || description) && (
        <div className="text-center space-y-1">
          {label && (
            <p
              className={cn(
                'font-medium',
                {
                  'text-xs': size === 'sm',
                  'text-sm': size === 'md',
                  'text-base': size === 'lg',
                },
                {
                  'text-violet-900': variant === 'primary',
                  'text-blue-900': variant === 'secondary',
                  'text-gray-900': variant === 'neutral',
                }
              )}
            >
              {label}
            </p>
          )}

          {description && (
            <p
              className={cn(
                {
                  'text-xs': size === 'sm' || size === 'md',
                  'text-sm': size === 'lg',
                },
                {
                  'text-violet-600/70': variant === 'primary',
                  'text-blue-600/70': variant === 'secondary',
                  'text-gray-600/70': variant === 'neutral',
                }
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
