import { FC } from 'react';
import { OptimizationStats } from '@/types';
import StatCard from './components/StatCard';
import { Building2, Calendar, CalendarDays, Sun, Umbrella } from 'lucide-react';

interface OptimizationStatsComponentProps {
  stats: OptimizationStats;
  previousStats?: OptimizationStats;
}

const OptimizationStatsComponent: FC<OptimizationStatsComponentProps> = ({ stats, previousStats }) => {
  return (
    <div className="w-full space-y-4 bg-gray-50/30 dark:bg-gray-900/10 p-4 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Optimization Stats
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Total Days Off */}
        <StatCard
          icon={<CalendarDays className="h-4 w-4" />}
          value={stats.totalDaysOff}
          label="Total Days Off"
          tooltip="Total number of days off including weekends, holidays, and CTO days"
          colorScheme="purple"
        />
        
        {/* CTO Days - using green to match our day type colors */}
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          value={stats.totalCTODays}
          label="CTO Days"
          tooltip="Number of CTO days used in the optimization"
          colorScheme="green"
        />
        
        {/* Public Holidays - using amber to match our day type colors */}
        <StatCard
          icon={<Sun className="h-4 w-4" />}
          value={stats.totalPublicHolidays}
          label="Public Holidays"
          tooltip="Number of public holidays in the selected year"
          colorScheme="amber"
        />
        
        {/* Extended Weekends - using teal to match our day type colors */}
        <StatCard
          icon={<Umbrella className="h-4 w-4" />}
          value={stats.totalExtendedWeekends}
          label="Extended Weekends"
          tooltip="Number of weekends that are part of a longer break"
          colorScheme="teal"
        />
        
        {/* Company Days Off - using violet to match our day type colors */}
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          value={stats.totalCompanyDaysOff}
          label="Company Days Off"
          tooltip="Number of company-wide days off (e.g., Christmas closure)"
          colorScheme="violet"
        />
      </div>
    </div>
  );
};

export default OptimizationStatsComponent;