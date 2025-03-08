import { Badge } from '@/components/ui/badge';

export interface StepBadgeProps {
  /**
   * The label text to display in the badge
   */
  label: string;
  /**
   * The color scheme to use for styling (matches step colors)
   */
  colorScheme: 'teal' | 'blue' | 'amber' | 'violet';
}

export function StepBadge({ label, colorScheme }: StepBadgeProps) {
  // Map colorScheme to specific style classes
  const colorClasses = {
    teal: 'bg-teal-50/50 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700/30',
    blue: 'bg-blue-50/50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/30',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/30',
    violet: 'bg-violet-50/50 text-violet-600 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-700/30',
  };

  return (
    <Badge
      variant="outline"
      size="sm"
      className={`font-medium text-[0.65rem] px-1.5 ${colorClasses[colorScheme]}`}
      aria-label={label}
      role="status"
    >
      {label}
    </Badge>
  );
} 