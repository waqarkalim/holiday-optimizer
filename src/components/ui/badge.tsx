import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
        neutral:
          "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[0.625rem]",
        lg: "px-3 py-1 text-sm",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-sm focus:ring-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({ 
  className, 
  variant, 
  size, 
  interactive,
  icon,
  removable,
  onRemove,
  children,
  ...props 
}: BadgeProps) {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div 
      className={cn(badgeVariants({ variant, size, interactive }), className)} 
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex items-center justify-center">{children}</span>
      {removable && (
        <button
          type="button"
          className="ml-1 -mr-1 h-3.5 w-3.5 rounded-full text-current opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={handleRemoveClick}
          aria-label="Remove badge"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16" 
            fill="none" 
            stroke="currentColor" 
            className="h-3 w-3"
          >
            <path d="M12 4L4 12M4 4l8 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { Badge, badgeVariants }
