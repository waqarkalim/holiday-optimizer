import { OptimizationStats } from '@/types';
import StatCard from '@/components/features/components/StatCard';
import { CalendarIcon, ClockIcon, StarIcon, SunIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function OptimizationStatsComponent({ stats }: { stats: OptimizationStats }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Glass effect background */}
      <div className="absolute inset-0 rounded-xl">
        <div className="absolute inset-0 bg-teal-50/30 dark:bg-teal-950/10 rounded-xl" />
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl" />
      </div>

      {/* Content */}
      <div className="relative p-4 ring-1 ring-teal-900/5 dark:ring-teal-300/5 rounded-xl">
        {/* Header */}
        <header className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
            <CheckCircleIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-teal-900 dark:text-teal-100 leading-none mb-0.5">
              Optimization Results
            </h3>
            <p className="text-xs text-teal-600/70 dark:text-teal-300/70">
              Your optimized time off schedule for maximum enjoyment
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {stats.totalDaysOff > 0 && (
            <StatCard
              icon={<ClockIcon className="w-4 h-4" />}
              value={stats.totalDaysOff}
              label="Total Days Off"
              tooltip="Total number of days off including weekends and holidays"
              colorScheme="purple"
            />
          )}
          {stats.totalCTODays > 0 && (
            <StatCard
              icon={<CalendarIcon className="w-4 h-4" />}
              value={stats.totalCTODays}
              label="CTO Days"
              tooltip="Total number of CTO days used"
              colorScheme="blue"
            />
          )}
          {stats.totalPublicHolidays > 0 && (
            <StatCard
              icon={<StarIcon className="w-4 h-4" />}
              value={stats.totalPublicHolidays}
              label="Public Holidays"
              tooltip="Total number of upcoming public holidays in the year"
              colorScheme="amber"
            />
          )}
          {stats.totalExtendedWeekends > 0 && (
            <StatCard
              icon={<SunIcon className="w-4 h-4" />}
              value={stats.totalExtendedWeekends}
              label="Extended Weekends"
              tooltip="Number of weekends that are part of longer breaks"
              colorScheme="green"
            />
          )}
          {stats.totalCustomDaysOff > 0 && (
            <StatCard
              icon={<ClockIcon className="w-4 h-4" />}
              value={stats.totalCustomDaysOff}
              label="Custom Days Off"
              tooltip="Total number of upcoming custom days off scheduled"
              colorScheme="emerald"
            />
          )}
        </div>
      </div>
    </div>
  );
}