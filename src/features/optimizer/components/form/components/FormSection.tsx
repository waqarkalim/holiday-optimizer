import { cn } from '@/shared/lib/utils';
import { ReactNode } from 'react';

interface FormSectionProps {
  children: ReactNode;
  colorScheme: 'teal' | 'blue' | 'amber' | 'violet';
  className?: string;
  headingId: string;
}

const colorStyles = {
  teal: {
    ring: 'ring-teal-900/5',
  },
  blue: {
    ring: 'ring-blue-900/5',
  },
  amber: {
    ring: 'ring-amber-900/5',
  },
  violet: {
    ring: 'ring-violet-900/5',
  },
} as const;

export function FormSection({ children, colorScheme, className, headingId }: FormSectionProps) {
  return (
    <section
      className={cn(
        'bg-white/90',
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
