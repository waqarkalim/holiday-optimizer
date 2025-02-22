import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parse } from "date-fns";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    clearButton: "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",
    badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100",
    date: "text-amber-600 dark:text-amber-400",
  },
  violet: {
    clearButton: "text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300",
    badge: "bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100",
    date: "text-violet-600 dark:text-violet-400",
  },
} as const;

export function DateList({ items, title, colorScheme, onRemove, onClearAll }: DateListProps) {
  const sortedItems = [...items].sort(
    (a, b) => parse(a.date, 'yyyy-MM-dd', new Date()).getTime() - 
              parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
  );

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
          {title}
          <span className={cn("px-1.5 py-0.5 rounded-md text-[10px]", colorStyles[colorScheme].badge)}>
            {items.length}
          </span>
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 text-xs",
            colorStyles[colorScheme].clearButton
          )}
          onClick={onClearAll}
        >
          Clear All
        </Button>
      </div>
      <div className="pr-2 -mr-2">
        <ul className="grid gap-1.5" aria-label={title}>
          {sortedItems.map((item, index) => (
            <li
              key={index}
              className="group flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800/60 rounded-md border border-gray-200 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <div className={cn("w-6 text-center font-medium", colorStyles[colorScheme].date)}>
                  {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'd')}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM yyyy')} - {item.name}
                    </span>
                  </TooltipTrigger>
                  {item.alternateNames && item.alternateNames.length > 0 && (
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium text-xs mb-1">Also celebrated as:</p>
                      <ul className="text-xs space-y-0.5">
                        {item.alternateNames.map((name, i) => (
                          <li key={i}>• {name}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 