import { cn } from '@/shared/lib/utils';
import { ReactNode } from 'react';

interface FormSectionProps {
  children: ReactNode;
  colorScheme: 'teal' | 'blue' | 'amber' | 'violet' | 'emerald' | 'cyan';
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
  emerald: {
    ring: 'ring-emerald-900/5',
  },
  cyan: {
    ring: 'ring-cyan-900/5',
  },
} as const;

export function FormSection({ children, colorScheme, className, headingId }: FormSectionProps) {
  return (
    <section
      className={cn(
        'relative space-y-3',
        'px-1.5 py-2',
        'sm:px-4 sm:py-4',
        'sm:bg-white/90 sm:rounded-xl sm:ring-1',
        colorStyles[colorScheme].ring,
        className
      )}
      aria-labelledby={headingId}
    >
      {children}
    </section>
  );
}
