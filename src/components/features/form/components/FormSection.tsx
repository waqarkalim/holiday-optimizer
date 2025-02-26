import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormSectionProps {
  children: ReactNode;
  colorScheme: 'teal' | 'blue' | 'amber' | 'violet';
  className?: string;
  headingId: string;
}

const colorStyles = {
  teal: {
    ring: 'ring-teal-900/5 dark:ring-teal-300/10',
  },
  blue: {
    ring: 'ring-blue-900/5 dark:ring-blue-300/10',
  },
  amber: {
    ring: 'ring-amber-900/5 dark:ring-amber-300/10',
  },
  violet: {
    ring: 'ring-violet-900/5 dark:ring-violet-300/10',
  },
} as const;

export function FormSection({ children, colorScheme, className, headingId }: FormSectionProps) {
  return (
    <section
      className={cn(
        'bg-white/90 dark:bg-gray-800/60',
        'rounded-lg p-2.5',
        'ring-1',
        'relative',
        colorStyles[colorScheme].ring,
        'space-y-2',
        className
      )}
      aria-labelledby={headingId}
    >
      {children}
    </section>
  );
} 