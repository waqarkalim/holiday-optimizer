import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { GITHUB_URL, PROJECT_NAME } from '@/constants';
import { cn, linkStyles, spacing, textSize } from '@/lib/utils';
import { GitHubLink } from '@/components/ui/github-link';

const Footer = () => (
  <footer className="bg-white/90 dark:bg-gray-800/90 border-t border-gray-200/60 dark:border-gray-700/30" role="contentinfo" aria-label="Site footer">
    <div className={cn(
      'mx-auto max-w-7xl',
      spacing.container,
    )}>
      <div className="py-8">
        {/* Main Footer Content */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200/60 dark:border-gray-700/30">
          {/* Left Column - Brand */}
          <article className="space-y-3">
            <Logo />
            <p className={cn(
              textSize('small'),
              'text-gray-500 dark:text-gray-400 max-w-md',
            )}>
              A smart tool to help you plan and optimize your CTO days for the best possible breaks throughout the year.
            </p>
          </article>

          {/* Right Column - Links & Info */}
          <aside className="flex flex-col items-start md:items-end space-y-3">
            <div className="flex items-center gap-3">
              <GitHubLink href={GITHUB_URL} />
              <a
                href={`${GITHUB_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  linkStyles('secondary'),
                  textSize('small'),
                  'px-2.5 py-1.5 rounded-lg font-medium',
                )}
                aria-label="Report an issue on GitHub"
                tabIndex={0}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                     aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Report an Issue</span>
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                textSize('tiny'),
                'text-gray-500 dark:text-gray-400',
              )}>Built with</span>
              <svg
                className="h-3.5 w-3.5 text-red-500 dark:text-red-400 animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(
                textSize('tiny'),
                'text-gray-500 dark:text-gray-400',
              )}>by</span>
              <a
                href="https://github.com/waqarkalim"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  linkStyles('primary'),
                  textSize('tiny'),
                )}
                aria-label="Visit Waqar Bin Kalim's GitHub profile"
                tabIndex={0}
              >
                Waqar Bin Kalim
              </a>
            </div>
          </aside>
        </section>

        {/* Bottom Bar */}
        <section className="pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className={cn(
            textSize('tiny'),
            'text-gray-500 dark:text-gray-400',
          )}>
            <small>&copy; {new Date().getUTCFullYear()} {PROJECT_NAME}. All rights reserved.</small>
          </p>
          <nav aria-label="Footer navigation" className="mt-3 sm:mt-0">
            <ul className="flex items-center gap-4">
              <li>
                <Link
                  href="/privacy"
                  className={cn(
                    linkStyles('ghost'),
                    textSize('tiny'),
                  )}
                  tabIndex={0}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={cn(
                    linkStyles('ghost'),
                    textSize('tiny'),
                  )}
                  tabIndex={0}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </nav>
        </section>
      </div>
    </div>
  </footer>
);

export default Footer; 