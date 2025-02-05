import { OptimizationStats } from '@/types';
import StatCard from '@/components/features/components/StatCard';
import { CalendarIcon, ClockIcon, StarIcon, SunIcon } from '@heroicons/react/24/outline';

export const Results = ({ stats }: { stats: null | OptimizationStats }) => {
  if (!stats) return null;

  return <div className="mb-8">
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
  </div>;
};