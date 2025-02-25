import { OptimizationStats, OptimizedDay } from '@/types';
import { motion } from 'framer-motion';
import { CalendarLegend } from '@/components/features/components/CalendarLegend';
import { MONTHS } from '@/constants';
import { MonthCalendar } from '@/components/features/components/MonthCalendar';
import { Calendar } from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface CalendarViewProps {
  stats: OptimizationStats;
  optimizedDays: OptimizedDay[];
}

export const CalendarView = ({ stats, optimizedDays }: CalendarViewProps) => <motion.div
  variants={item}
  className="relative overflow-hidden"
>
  <div
    className="absolute inset-0 bg-gray-50/30 dark:bg-gray-900/10 rounded-xl" />
  <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl" />

  <div className="relative rounded-xl p-4 ring-1 ring-gray-200 dark:ring-gray-700">
    <div className="flex items-center space-x-2 mb-4">
      <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-none mb-0.5">
          Calendar View
        </h3>
        <p className="text-xs text-gray-600/70 dark:text-gray-400/70">
          Your year at a glance
        </p>
      </div>
    </div>

    <CalendarLegend
      hasCTODays={stats.totalCTODays > 0}
      hasHolidays={stats.totalPublicHolidays > 0}
      hasCompanyDaysOff={stats.totalCompanyDaysOff > 0}
      hasExtendedWeekends={stats.totalExtendedWeekends > 0}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {MONTHS.map((_, index) => (
        <MonthCalendar
          key={index}
          month={index}
          year={(new Date()).getUTCFullYear()}
          days={optimizedDays}
        />
      ))}
    </div>
  </div>
</motion.div>;