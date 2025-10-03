import { Badge } from '@/shared/components/ui/badge';

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
    teal: 'bg-teal-50/50 text-teal-600 border-teal-200',
    blue: 'bg-blue-50/50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-200',
    violet: 'bg-violet-50/50 text-violet-600 border-violet-200',
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
