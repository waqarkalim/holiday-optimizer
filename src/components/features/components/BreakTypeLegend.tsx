import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, Palmtree, Sunrise } from 'lucide-react';
import { BREAK_LENGTHS } from '@/services/optimizer.constants';

const breakTypes = [
  {
    name: 'Long Weekend',
    icon: Sunrise,
    description: `${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} days off around a weekend`,
    color: 'text-green-900 dark:text-green-100',
    bgColor: 'bg-green-100/80 dark:bg-green-900/30',
    iconBg: 'bg-green-200 dark:bg-green-800/50',
    iconColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    ariaLabel: `Long Weekend: ${BREAK_LENGTHS.LONG_WEEKEND.MIN}-${BREAK_LENGTHS.LONG_WEEKEND.MAX} days off around a weekend`
  },
  {
    name: 'Mini Break',
    icon: CalendarDays,
    description: `${BREAK_LENGTHS.MINI_BREAK.MIN}-${BREAK_LENGTHS.MINI_BREAK.MAX} days off for a quick getaway`,
    color: 'text-orange-900 dark:text-orange-100',
    bgColor: 'bg-orange-100/80 dark:bg-orange-900/30',
    iconBg: 'bg-orange-200 dark:bg-orange-800/50',
    iconColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
    ariaLabel: `Mini Break: ${BREAK_LENGTHS.MINI_BREAK.MIN}-${BREAK_LENGTHS.MINI_BREAK.MAX} days off for a quick getaway`
  },
  {
    name: 'Week Break',
    icon: CalendarRange,
    description: `${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} days for a proper vacation`,
    color: 'text-blue-900 dark:text-blue-100',
    bgColor: 'bg-blue-100/80 dark:bg-blue-900/30',
    iconBg: 'bg-blue-200 dark:bg-blue-800/50',
    iconColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    ariaLabel: `Week Break: ${BREAK_LENGTHS.WEEK_LONG.MIN}-${BREAK_LENGTHS.WEEK_LONG.MAX} days for a proper vacation`
  },
  {
    name: 'Extended Break',
    icon: Palmtree,
    description: `${BREAK_LENGTHS.EXTENDED.MIN}-${BREAK_LENGTHS.EXTENDED.MAX} days for an extended holiday`,
    color: 'text-purple-900 dark:text-purple-100',
    bgColor: 'bg-purple-100/80 dark:bg-purple-900/30',
    iconBg: 'bg-purple-200 dark:bg-purple-800/50',
    iconColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    ariaLabel: `Extended Break: ${BREAK_LENGTHS.EXTENDED.MIN}-${BREAK_LENGTHS.EXTENDED.MAX} days for an extended holiday`
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function BreakTypeLegend() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {breakTypes.map((type) => {
        const Icon = type.icon;
        return (
          <motion.div
            key={type.name}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl ${type.bgColor} border ${type.borderColor} shadow-sm`}
            role="article"
            aria-label={type.ariaLabel}
          >
            <div className="relative p-3 flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${type.iconBg} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${type.iconColor}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className={`text-sm font-medium leading-5 mb-0.5 ${type.color}`}>
                  {type.name}
                </h3>
                <p className={`text-xs leading-4 ${type.color} opacity-90`}>
                  {type.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 