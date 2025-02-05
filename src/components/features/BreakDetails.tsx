import { Break } from '@/types';
import { motion } from 'framer-motion';
import { BreakCard } from '@/components/features/components/BreakCard';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface BreakDetailsProps {
  breaks: Break[];
}

export function BreakDetails({ breaks }: BreakDetailsProps) {
  return <motion.div
    variants={item}
    className="relative overflow-hidden"
  >
    {/* Background decorative elements */}
    <div
      className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent rounded-3xl" />
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl" />

    <div className="relative rounded-3xl p-8 ring-1 ring-violet-900/10 dark:ring-violet-300/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
            <svg className="h-6 w-6 text-violet-600 dark:text-violet-300" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-violet-900 dark:text-violet-100">
              Break Details
            </h2>
            <p className="text-sm text-violet-600/80 dark:text-violet-300/80">
              Your optimized breaks throughout the year
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
              <span
                className="px-4 py-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg text-sm font-medium text-violet-700 dark:text-violet-300">
                {breaks.length} break{breaks.length !== 1 ? 's' : ''} planned
              </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/70 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </motion.button>
        </div>
      </div>

      {breaks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-xl mb-4">
            <svg className="h-8 w-8 text-violet-600 dark:text-violet-300" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-2">
            No Breaks Planned Yet
          </h3>
          <p className="text-sm text-violet-600/80 dark:text-violet-300/80 max-w-md">
            Adjust your CTO days and preferences to see optimized break suggestions
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-fr">
          {breaks.map((breakPeriod, index) => (
            <BreakCard key={index} breakPeriod={breakPeriod} />
          ))}
        </div>
      )}
    </div>
  </motion.div>;
}