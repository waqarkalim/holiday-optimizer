import { OptimizationStats } from '@/types';
import { motion } from 'framer-motion';
import StatCard from '@/components/features/components/StatCard';
import { CalendarIcon, ClockIcon, StarIcon, SunIcon } from '@heroicons/react/24/outline';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function OptimizationStatsComponent({ stats }: { stats: OptimizationStats }) {
  return <motion.div
    variants={item}
    className="relative overflow-visible"
  >
    {/* Background decorative elements */}
    <div
      className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-950/20 dark:to-transparent rounded-3xl" />
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl" />

    {/* Main content */}
    <div className="relative rounded-3xl p-8 ring-1 ring-teal-900/10 dark:ring-teal-300/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100">
              Optimization Results
            </h3>
            <p className="text-sm text-teal-600/80 dark:text-teal-300/80">
              Your optimized time off schedule for maximum enjoyment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-fr">
        {stats.totalDaysOff > 0 && (
          <StatCard
            icon={<ClockIcon className="w-6 h-6" />}
            value={stats.totalDaysOff}
            label="Total Days Off"
            tooltip="Total number of days off including weekends and holidays"
            colorScheme="purple"
          />
        )}
        {stats.totalCTODays > 0 && (
          <StatCard
            icon={<CalendarIcon className="w-6 h-6" />}
            value={stats.totalCTODays}
            label="CTO Days"
            tooltip="Total number of CTO days used"
            colorScheme="blue"
          />
        )}
        {stats.totalPublicHolidays > 0 && (
          <StatCard
            icon={<StarIcon className="w-6 h-6" />}
            value={stats.totalPublicHolidays}
            label="Public Holidays"
            tooltip="Total number of public holidays in the year"
            colorScheme="amber"
          />
        )}
        {stats.totalExtendedWeekends > 0 && (
          <StatCard
            icon={<SunIcon className="w-6 h-6" />}
            value={stats.totalExtendedWeekends}
            label="Extended Weekends"
            tooltip="Number of weekends that are part of longer breaks"
            colorScheme="green"
          />
        )}
        {stats.totalCustomDaysOff > 0 && (
          <StatCard
            icon={<ClockIcon className="w-6 h-6" />}
            value={stats.totalCustomDaysOff}
            label="Custom Days Off"
            tooltip="Total number of custom days off scheduled"
            colorScheme="emerald"
          />
        )}
      </div>
    </div>
  </motion.div>;
}