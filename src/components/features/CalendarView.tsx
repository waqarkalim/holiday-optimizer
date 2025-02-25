import { OptimizationStats, OptimizedDay } from '@/types';
import { motion } from 'framer-motion';
import { CalendarLegend } from '@/components/features/components/CalendarLegend';
import { MONTHS } from '@/constants';
import { MonthCalendar } from '@/components/features/components/MonthCalendar';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface CalendarViewProps {
  stats: OptimizationStats;
  optimizedDays: OptimizedDay[];
}

export const CalendarView = ({ stats, optimizedDays }: CalendarViewProps) => {
  // Get today's date and format it nicely
  const today = new Date();
  const formattedDate = format(today, 'MMMM d, yyyy');
  const currentYear = today.getFullYear();
  
  return (
    <motion.div
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
              From today until the end of {currentYear}
            </p>
          </div>
        </div>

        {/* Optimization Timeframe Notice */}
        <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Optimization begins from today ({formattedDate})</p>
            <p className="text-xs mt-1 text-blue-700 dark:text-blue-300">
              Past dates are grayed out and not considered in the optimization. This ensures your vacation planning is practical and forward-looking.
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
    </motion.div>
  );
};