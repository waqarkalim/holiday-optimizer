import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StepHeaderProps {
  number: number;
  title: ReactNode;
  description: string;
  colorScheme: 'teal' | 'blue' | 'amber' | 'violet';
  id?: string;
}

const colorStyles = {
  teal: {
    text: 'text-teal-900 dark:text-teal-100',
    bg: 'bg-teal-100 dark:bg-teal-900',
  },
  blue: {
    text: 'text-blue-900 dark:text-blue-100',
    bg: 'bg-blue-100 dark:bg-blue-900',
  },
  amber: {
    text: 'text-amber-900 dark:text-amber-100',
    bg: 'bg-amber-100 dark:bg-amber-900',
  },
  violet: {
    text: 'text-violet-900 dark:text-violet-100',
    bg: 'bg-violet-100 dark:bg-violet-900',
  },
} as const;

export function StepHeader({ number, title, description, colorScheme, id }: StepHeaderProps) {
  const headingId = id || `step-${number}-heading`;
  const descriptionId = `${headingId}-description`;

  return (
    <header className="mb-3">
      <h2 
        id={headingId}
        className={cn(
          'text-sm font-semibold flex items-center gap-2',
          colorStyles[colorScheme].text
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded-full',
            'text-xs font-medium',
            colorStyles[colorScheme].bg,
            colorStyles[colorScheme].text
          )}
          aria-hidden="true"
        >
          {number}
        </span>
        {title}
      </h2>
      <p 
        id={descriptionId}
        className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 mt-1"
      >
        {description}
      </p>
    </header>
  );
} 