import { FC } from 'react';
import { OptimizationStats } from '@/types';
import StatCard from '@/shared/components/ui/cards/StatCard';
import { BarChart2, Building2, Calendar, CalendarDays, Sun, Umbrella } from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/section-card';

interface OptimizationStatsComponentProps {
  stats: OptimizationStats;
}

const OptimizationStatsComponent: FC<OptimizationStatsComponentProps> = ({ stats }) => {
  const statItems = [
    {
      key: 'total-days-off',
      icon: <CalendarDays className="h-5 w-5" />,
      value: stats.totalDaysOff,
      label: 'Total Days Off',
      tooltip: 'Total number of days off including weekends, holidays, and PTO days',
      colorScheme: 'blue' as const,
    },
    {
      key: 'pto-days',
      icon: <Calendar className="h-5 w-5" />,
      value: stats.totalPTODays,
      label: 'PTO Days',
      tooltip: 'Number of PTO days used in the optimization',
      colorScheme: 'green' as const,
    },
    {
      key: 'public-holidays',
      icon: <Sun className="h-5 w-5" />,
      value: stats.totalPublicHolidays,
      label: 'Public Holidays',
      tooltip: 'Number of public holidays that are part of a longer break',
      colorScheme: 'amber' as const,
    },
    {
      key: 'extended-weekends',
      icon: <Umbrella className="h-5 w-5" />,
      value: stats.totalExtendedWeekends,
      label: 'Extended Weekends',
      tooltip: 'Number of weekends that are part of a longer break',
      colorScheme: 'teal' as const,
    },
    {
      key: 'company-days',
      icon: <Building2 className="h-5 w-5" />,
      value: stats.totalCompanyDaysOff,
      label: 'Company Days Off',
      tooltip:
        'Number of company-wide days off (e.g., Christmas closure) that are part of a longer break',
      colorScheme: 'violet' as const,
    },
  ];

  return (
    <SectionCard
      title="Optimization Stats"
      subtitle="A breakdown of your optimized time off schedule"
      icon={<BarChart2 className="h-4 w-4 text-blue-600" />}
    >
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {statItems.map(item => (
          <StatCard
            key={item.key}
            icon={item.icon}
            value={item.value}
            label={item.label}
            tooltip={item.tooltip}
            colorScheme={item.colorScheme}
          />
        ))}
      </div>

      <div className="md:hidden -mx-4">
        <p className="px-4 pb-2 text-xs font-medium text-blue-900/70">Swipe to explore your stats</p>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3"
             aria-label="Optimized time off statistics"
        >
          {statItems.map(item => (
            <div key={item.key} className="snap-center min-w-[200px] max-w-[220px] flex-shrink-0">
              <StatCard
                icon={item.icon}
                value={item.value}
                label={item.label}
                tooltip={item.tooltip}
                colorScheme={item.colorScheme}
              />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

export default OptimizationStatsComponent;
