import React from 'react';
import { cn } from '@/lib/utils';

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
  description
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3"
  };

  const variantClasses = {
    primary: "border-violet-200 dark:border-violet-700 border-t-violet-500 dark:border-t-violet-400",
    secondary: "border-blue-200 dark:border-blue-700 border-t-blue-500 dark:border-t-blue-400",
    neutral: "border-gray-200 dark:border-gray-700 border-t-gray-500 dark:border-t-gray-400"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4",
      className
    )}>
      <div 
        className={cn(
          "animate-spin rounded-full",
          sizeClasses[size],
          variantClasses[variant]
        )}
        aria-hidden="true"
      />
      
      {(label || description) && (
        <div className="text-center space-y-1">
          {label && (
            <p className={cn(
              "font-medium",
              {
                'text-xs': size === 'sm',
                'text-sm': size === 'md',
                'text-base': size === 'lg'
              },
              {
                'text-violet-900 dark:text-violet-100': variant === 'primary',
                'text-blue-900 dark:text-blue-100': variant === 'secondary',
                'text-gray-900 dark:text-gray-100': variant === 'neutral'
              }
            )}>
              {label}
            </p>
          )}
          
          {description && (
            <p className={cn(
              {
                'text-xs': size === 'sm' || size === 'md',
                'text-sm': size === 'lg'
              },
              {
                'text-violet-600/70 dark:text-violet-300/70': variant === 'primary',
                'text-blue-600/70 dark:text-blue-300/70': variant === 'secondary',
                'text-gray-600/70 dark:text-gray-300/70': variant === 'neutral'
              }
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 