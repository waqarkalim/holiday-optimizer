import { CalendarDays, CalendarRange, Palmtree, Sunrise } from 'lucide-react';

import { BREAK_LENGTHS } from '@/constants';

const breakTypes = [
  {
    name: 'Long Weekend',
    icon: Sunrise,
    description: `${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} days off around a weekend`,
    color: 'text-green-900',
    bgColor: 'bg-green-100/80',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-700',
    borderColor: 'border-green-200',
    ariaLabel: `Long Weekend: ${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} days off around a weekend`,
  },
  {
    name: 'Mini Break',
    icon: CalendarDays,
    description: `${BREAK_LENGTHS.MINI_BREAK.MIN}-${BREAK_LENGTHS.MINI_BREAK.MAX} days off for a quick getaway`,
    color: 'text-orange-900',
    bgColor: 'bg-orange-100/80',
    iconBg: 'bg-orange-200',
    iconColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    ariaLabel: `Mini Break: ${BREAK_LENGTHS.MINI_BREAK.MIN}-${BREAK_LENGTHS.MINI_BREAK.MAX} days off for a quick getaway`,
  },
  {
    name: 'Week Break',
    icon: CalendarRange,
    description: `${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} days for a proper vacation`,
    color: 'text-blue-900',
    bgColor: 'bg-blue-100/80',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    ariaLabel: `Week Break: ${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} days for a proper vacation`,
  },
  {
    name: 'Extended Break',
    icon: Palmtree,
    description: `${BREAK_LENGTHS.EXTENDED.MIN}-${BREAK_LENGTHS.EXTENDED.MAX} days for an extended holiday`,
    color: 'text-purple-900',
    bgColor: 'bg-purple-100/80',
    iconBg: 'bg-purple-200',
    iconColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    ariaLabel: `Extended Break: ${BREAK_LENGTHS.EXTENDED.MIN}-${BREAK_LENGTHS.EXTENDED.MAX} days for an extended holiday`,
  },
];

export function BreakTypeLegend() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {breakTypes.map(type => {
        const Icon = type.icon;
        return (
          <div
            key={type.name}
            className={`relative overflow-hidden rounded-lg ${type.bgColor} border ${type.borderColor} shadow-sm`}
            role="article"
            aria-label={type.ariaLabel}
          >
            <div className="relative p-2 flex items-start space-x-2">
              <div className={`p-1.5 rounded-md ${type.iconBg} flex-shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${type.iconColor}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className={`text-xs font-medium leading-none mb-0.5 ${type.color}`}>
                  {type.name}
                </h3>
                <p className={`text-xs leading-tight ${type.color} opacity-90`}>
                  {type.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
