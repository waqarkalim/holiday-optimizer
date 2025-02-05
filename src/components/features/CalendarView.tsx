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
    className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent rounded-3xl" />
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl" />

  <div className="relative rounded-3xl p-8 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
          Calendar View
        </h3>
        <p className="text-sm text-blue-600/80 dark:text-blue-300/80">
          Your year at a glance
        </p>
      </div>
    </div>

    <CalendarLegend
      hasCTODays={stats.totalCTODays > 0}
      hasHolidays={stats.totalPublicHolidays > 0}
      hasCustomDaysOff={stats.totalCustomDaysOff > 0}
      hasExtendedWeekends={stats.totalExtendedWeekends > 0}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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