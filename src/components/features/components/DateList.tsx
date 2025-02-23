import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parse } from "date-fns";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeyboardEvent } from 'react';

interface DateItem {
  date: string;
  name: string;
  alternateNames?: string[];
}

interface DateListProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber' | 'violet';
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

const colorStyles = {
  amber: {
    container: 'bg-amber-50/50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-100',
    button: {
      base: 'hover:bg-amber-100/50 dark:hover:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
  },
  violet: {
    container: 'bg-violet-50/50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    text: 'text-violet-900 dark:text-violet-100',
    button: {
      base: 'hover:bg-violet-100/50 dark:hover:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
    },
  },
} as const;

export function DateList({ items, title, colorScheme, onRemove, onClearAll }: DateListProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onRemove(index);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevButton = document.querySelector(`[data-index="${index - 1}"]`) as HTMLButtonElement;
        prevButton?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextButton = document.querySelector(`[data-index="${index + 1}"]`) as HTMLButtonElement;
        nextButton?.focus();
        break;
    }
  };

  const sortedItems = [...items].sort(
    (a, b) => parse(a.date, 'yyyy-MM-dd', new Date()).getTime() - 
              parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
  );

  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-lg border p-2',
        colorStyles[colorScheme].container,
        colorStyles[colorScheme].border
      )}
      aria-labelledby={`${title.toLowerCase()}-list-heading`}
    >
      <header className="flex items-center justify-between mb-2">
        <h3 
          id={`${title.toLowerCase()}-list-heading`}
          className={cn('text-xs font-medium', colorStyles[colorScheme].text)}
        >
          {title}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className={cn(
            'h-6 text-xs px-2',
            colorStyles[colorScheme].button.base,
            colorStyles[colorScheme].button.text
          )}
          tabIndex={0}
          aria-label={`Clear all ${title.toLowerCase()}`}
        >
          Clear All
        </Button>
      </header>
      <ul 
        className="space-y-1"
        role="list"
        aria-label={`List of ${title.toLowerCase()}`}
      >
        {sortedItems.map((item, index) => (
          <li
            key={item.date}
            className="flex items-center justify-between group"
          >
            <time 
              dateTime={item.date}
              className={cn('text-xs', colorStyles[colorScheme].text)}
            >
              {item.name}
            </time>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100',
                colorStyles[colorScheme].button.base
              )}
              tabIndex={0}
              aria-label={`Remove ${item.name}`}
              data-index={index}
            >
              <X className={cn('h-3 w-3', colorStyles[colorScheme].button.text)} />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
} 