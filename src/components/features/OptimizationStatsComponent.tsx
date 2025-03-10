import { FC } from 'react';
import { OptimizationStats } from '@/types';
import StatCard from './components/StatCard';
import { BarChart2, Building2, Calendar, CalendarDays, Sun, Umbrella } from 'lucide-react';
import { SectionCard } from '@/components/ui/section-card';

interface OptimizationStatsComponentProps {
  stats: OptimizationStats;
}

const OptimizationStatsComponent: FC<OptimizationStatsComponentProps> = ({ stats }) => {
  return (
    <SectionCard
      title="Optimization Stats"
      subtitle="A breakdown of your optimized time off schedule"
      icon={<BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Total Days Off */}
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          value={stats.totalDaysOff}
          label="Total Days Off"
          tooltip="Total number of days off including weekends, holidays, and PTO days"
          colorScheme="blue"
        />

        {/* PTO Days */}
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          value={stats.totalPTODays}
          label="PTO Days"
          tooltip="Number of PTO days used in the optimization"
          colorScheme="green"
        />

        {/* Public Holidays */}
        <StatCard
          icon={<Sun className="h-5 w-5" />}
          value={stats.totalPublicHolidays}
          label="Public Holidays"
          tooltip="Number of public holidays that are part of a longer break"
          colorScheme="amber"
        />

        {/* Extended Weekends */}
        <StatCard
          icon={<Umbrella className="h-5 w-5" />}
          value={stats.totalExtendedWeekends}
          label="Extended Weekends"
          tooltip="Number of weekends that are part of a longer break"
          colorScheme="teal"
        />

        {/* Company Days Off */}
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          value={stats.totalCompanyDaysOff}
          label="Company Days Off"
          tooltip="Number of company-wide days off (e.g., Christmas closure) that part of a longer break"
          colorScheme="violet"
        />
      </div>
    </SectionCard>
  );
};

export default OptimizationStatsComponent;