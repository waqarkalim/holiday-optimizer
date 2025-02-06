import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, Palmtree, Sunrise } from 'lucide-react';

const breakTypes = [
  {
    name: 'Long Weekend',
    icon: Sunrise,
    description: '3-4 days off around a weekend',
    color: 'text-green-900 dark:text-green-100',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconBg: 'bg-green-200 dark:bg-green-800/50',
    iconColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    name: 'Mini Break',
    icon: CalendarDays,
    description: '5-6 days off for a quick getaway',
    color: 'text-orange-900 dark:text-orange-100',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconBg: 'bg-orange-200 dark:bg-orange-800/50',
    iconColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    name: 'Week Break',
    icon: CalendarRange,
    description: '7-13 days for a proper vacation',
    color: 'text-blue-900 dark:text-blue-100',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconBg: 'bg-blue-200 dark:bg-blue-800/50',
    iconColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    name: 'Extended Break',
    icon: Palmtree,
    description: '14+ days for an extended holiday',
    color: 'text-purple-900 dark:text-purple-100',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconBg: 'bg-purple-200 dark:bg-purple-800/50',
    iconColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {breakTypes.map((type) => {
        const Icon = type.icon;
        return (
          <motion.div
            key={type.name}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl ${type.bgColor} border ${type.borderColor} shadow-sm`}
          >
            <div className="relative p-4 flex items-start space-x-4">
              <div className={`p-2.5 rounded-xl ${type.iconBg}`}>
                <Icon className={`h-5 w-5 ${type.iconColor}`} />
              </div>
              <div>
                <h3 className={`font-medium mb-1 ${type.color}`}>{type.name}</h3>
                <p className={`text-sm ${type.color} opacity-80`}>
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