import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField = ({ children, className, error }: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
      {error && <FormError>{error}</FormError>}
    </div>
  );
};

export const FormLabel = ({ children, className, htmlFor, required = false }: FormLabelProps) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-gray-700 dark:text-gray-300",
        className
      )}
    >
      {children}
      {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
    </label>
  );
};

export const FormDescription = ({ children, className }: FormDescriptionProps) => {
  return (
    <p className={cn(
      "text-xs text-gray-500 dark:text-gray-400",
      className
    )}>
      {children}
    </p>
  );
};

export const FormError = ({ children, className }: FormErrorProps) => {
  return (
    <p className={cn(
      "text-xs font-medium text-red-500 dark:text-red-400 animate-[shake_0.5s_ease-in-out]",
      className
    )}>
      {children}
    </p>
  );
};

export const FormGroup = ({ children, className }: FormFieldProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}; 