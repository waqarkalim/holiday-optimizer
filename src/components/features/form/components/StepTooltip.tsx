import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';

export interface StepTooltipProps {
  /**
   * The title of the tooltip content
   */
  title: string;
  /**
   * The description text for the tooltip
   */
  description: string;
  /**
   * The color scheme to use for styling (matches step colors)
   */
  colorScheme: 'teal' | 'blue' | 'amber' | 'violet';
  /**
   * The aria-label for the tooltip trigger button
   */
  ariaLabel: string;
}

export function StepTooltip({ title, description, colorScheme, ariaLabel }: StepTooltipProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close tooltip on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && tooltipOpen) {
        setTooltipOpen(false);
        triggerRef.current?.focus();
      }
    };

    // Use a type assertion for document.addEventListener
    document.addEventListener('keydown', handleEscKey as unknown as EventListener);
    return () => {
      document.removeEventListener('keydown', handleEscKey as unknown as EventListener);
    };
  }, [tooltipOpen]);

  // Handle keyboard interactions
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setTooltipOpen(!tooltipOpen);
        break;
      case 'Escape':
        if (tooltipOpen) {
          e.preventDefault();
          setTooltipOpen(false);
        }
        break;
    }
  };

  // Map colorScheme to specific style classes
  const colorClasses = {
    teal: {
      hover: 'hover:bg-teal-100/70 dark:hover:bg-teal-900/40',
      ring: 'focus:ring-teal-500',
      icon: 'text-teal-500/70 dark:text-teal-400/70',
      content: 'bg-teal-50/95 dark:bg-teal-900/90 border-teal-100 dark:border-teal-800/40 text-teal-900 dark:text-teal-100',
      header: 'text-teal-800 dark:text-teal-300',
      text: 'text-teal-700/90 dark:text-teal-300/90',
    },
    blue: {
      hover: 'hover:bg-blue-100/70 dark:hover:bg-blue-900/40',
      ring: 'focus:ring-blue-500',
      icon: 'text-blue-500/70 dark:text-blue-400/70',
      content: 'bg-blue-50/95 dark:bg-blue-900/90 border-blue-100 dark:border-blue-800/40 text-blue-900 dark:text-blue-100',
      header: 'text-blue-800 dark:text-blue-300',
      text: 'text-blue-700/90 dark:text-blue-300/90',
    },
    amber: {
      hover: 'hover:bg-amber-100/70 dark:hover:bg-amber-900/40',
      ring: 'focus:ring-amber-500',
      icon: 'text-amber-500/70 dark:text-amber-400/70',
      content: 'bg-amber-50/95 dark:bg-amber-900/90 border-amber-100 dark:border-amber-800/40 text-amber-900 dark:text-amber-100',
      header: 'text-amber-800 dark:text-amber-300',
      text: 'text-amber-700/90 dark:text-amber-300/90',
    },
    violet: {
      hover: 'hover:bg-violet-100/70 dark:hover:bg-violet-900/40',
      ring: 'focus:ring-violet-500',
      icon: 'text-violet-500/70 dark:text-violet-400/70',
      content: 'bg-violet-50/95 dark:bg-violet-900/90 border-violet-100 dark:border-violet-800/40 text-violet-900 dark:text-violet-100',
      header: 'text-violet-800 dark:text-violet-300',
      text: 'text-violet-700/90 dark:text-violet-300/90',
    },
  };

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={`rounded-full p-1 ${colorClasses[colorScheme].hover} cursor-help transition-colors focus:outline-none focus:ring-2 ${colorClasses[colorScheme].ring} focus:ring-offset-1`}
          aria-label={ariaLabel}
          aria-expanded={tooltipOpen}
          aria-describedby={tooltipOpen ? `tooltip-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
          aria-haspopup="dialog"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <Info className={`h-3.5 w-3.5 ${colorClasses[colorScheme].icon}`} aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="start"
        className={`max-w-xs ${colorClasses[colorScheme].content}`}
        role="tooltip"
        id={`tooltip-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="space-y-2 p-1">
          <h4 className={`font-medium ${colorClasses[colorScheme].header} text-sm`}>{title}</h4>
          <p className={`text-xs ${colorClasses[colorScheme].text} leading-relaxed`}>
            {description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
} 