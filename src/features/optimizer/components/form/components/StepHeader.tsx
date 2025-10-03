import { cn } from '@/shared/lib/utils';
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
    text: 'text-teal-900',
    bg: 'bg-teal-100',
  },
  blue: {
    text: 'text-blue-900',
    bg: 'bg-blue-100',
  },
  amber: {
    text: 'text-amber-900',
    bg: 'bg-amber-100',
  },
  violet: {
    text: 'text-violet-900',
    bg: 'bg-violet-100',
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
      <p id={descriptionId} className="text-xs leading-relaxed text-gray-600 mt-1">
        {description}
      </p>
    </header>
  );
}
