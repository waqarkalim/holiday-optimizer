import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { PROJECT_NAME } from '@/constants';

const Footer = () => (
  <footer
    className="bg-white/90 dark:bg-gray-800/90 border-t border-gray-200/60 dark:border-gray-700/30">
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200/60 dark:border-gray-700/30">
          {/* Left Column - Brand */}
          <div className="space-y-3">
            <Logo />
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              A smart tool to help you plan and optimize your CTO days for the best possible breaks throughout the year.
            </p>
          </div>

          {/* Right Column - Links & Info */}
          <div className="flex flex-col items-start md:items-end space-y-3">
            <div className="flex items-center space-x-3">
              <a
                href="https://github.com/waqarkalim/holiday-optimizer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 hover:scale-[1.02] transform
                  dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-700/60"
              >
                <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
              <a
                href="https://github.com/waqarkalim/holiday-optimizer/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  text-gray-600 hover:text-gray-900 hover:scale-[1.02] transform
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Report an Issue
              </a>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Built with</span>
              <svg className="h-3.5 w-3.5 text-red-500 dark:text-red-400 animate-pulse" fill="currentColor"
                   viewBox="0 0 20 20">
                <path fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd" />
              </svg>
              <span>by</span>
              <a
                href="https://github.com/waqarkalim"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Waqar Bin Kalim
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} {PROJECT_NAME}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <Link
              href="/privacy"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer 