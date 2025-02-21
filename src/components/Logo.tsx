import { PROJECT_NAME } from '@/constants';
import Link from 'next/link';

export const Logo = () =>
  <Link href="/">
    <div className="flex items-center space-x-2">
      <div
        className="p-1.5 bg-blue-500 dark:bg-blue-400 rounded-lg shadow-sm">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h2
          className="text-base font-semibold text-gray-900 dark:text-white">
          {PROJECT_NAME}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Maximize your time off in {new Date().getFullYear()}
        </p>
      </div>
    </div>
  </Link>;