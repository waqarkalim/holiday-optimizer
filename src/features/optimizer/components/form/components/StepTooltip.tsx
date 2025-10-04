import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useEffect, useMemo, useState, type MouseEvent, type KeyboardEvent } from 'react';

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
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(() => false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => {
      setIsTouch(query.matches);
    };

    update();

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', update);
      return () => query.removeEventListener('change', update);
    }

    query.addListener(update);
    return () => query.removeListener(update);
  }, []);

  const triggerHandlers = useMemo(() => {
    if (!isTouch) {
      return {
        onPointerEnter: () => setOpen(true),
        onPointerLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        onClick: undefined,
        onKeyDown: undefined,
      };
    }

    return {
      onPointerEnter: undefined,
      onPointerLeave: undefined,
      onFocus: undefined,
      onBlur: undefined,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setOpen(prev => !prev);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setOpen(prev => !prev);
        }
      },
    };
  }, [isTouch]);

  // Map colorScheme to specific style classes
  const colorClasses = {
    teal: {
      hover: 'hover:bg-teal-100/70',
      ring: 'focus:ring-teal-500',
      icon: 'text-teal-500/70',
      content: 'bg-teal-50/95 border-teal-100 text-teal-900',
      header: 'text-teal-800',
      text: 'text-teal-700/90',
    },
    blue: {
      hover: 'hover:bg-blue-100/70',
      ring: 'focus:ring-blue-500',
      icon: 'text-blue-500/70',
      content: 'bg-blue-50/95 border-blue-100 text-blue-900',
      header: 'text-blue-800',
      text: 'text-blue-700/90',
    },
    amber: {
      hover: 'hover:bg-amber-100/70',
      ring: 'focus:ring-amber-500',
      icon: 'text-amber-500/70',
      content: 'bg-amber-50/95 border-amber-100 text-amber-900',
      header: 'text-amber-800',
      text: 'text-amber-700/90',
    },
    violet: {
      hover: 'hover:bg-violet-100/70',
      ring: 'focus:ring-violet-500',
      icon: 'text-violet-500/70',
      content: 'bg-violet-50/95 border-violet-100 text-violet-900',
      header: 'text-violet-800',
      text: 'text-violet-700/90',
    },
  };

  const handleOpenChange = (next: boolean) => {
    if (isTouch) {
      if (!next) {
        setOpen(false);
      }
      return;
    }

    setOpen(next);
  };

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange} disableHoverableContent={isTouch}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`rounded-full p-1 ${colorClasses[colorScheme].hover} cursor-help transition-colors focus:outline-none focus:ring-2 ${colorClasses[colorScheme].ring} focus:ring-offset-1`}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          tabIndex={0}
          {...triggerHandlers}
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
