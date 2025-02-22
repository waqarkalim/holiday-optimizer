import { OptimizationStats, OptimizedDay } from '@/types';
import { motion } from 'framer-motion';
import { CalendarLegend } from '@/components/features/components/CalendarLegend';
import { MONTHS } from '@/constants';
import { MonthCalendar } from '@/components/features/components/MonthCalendar';

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
    className="absolute inset-0 bg-blue-50/30 dark:bg-blue-950/10 rounded-xl" />
  <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl" />

  <div className="relative rounded-xl p-4 ring-1 ring-blue-900/5 dark:ring-blue-400/5">
    <div className="flex items-center space-x-2 mb-4">
      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100 leading-none mb-0.5">
          Calendar View
        </h3>
        <p className="text-xs text-blue-600/70 dark:text-blue-300/70">
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
          year={(new Date()).getFullYear()}
          days={optimizedDays}
        />
      ))}
    </div>
  </div>
</motion.div>;