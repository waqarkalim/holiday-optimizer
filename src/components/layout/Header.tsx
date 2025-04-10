import { Logo } from '@/components/Logo';
import { cn, spacing } from '@/lib/utils';
import { GitHubLink } from '@/components/ui/github-link';
import { GITHUB_URL } from '@/constants';
import Link from 'next/link';

const Header = () => (
  <header className={cn(
    'sticky top-0 z-40 w-full',
    'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
    'border-b border-gray-200/60 dark:border-gray-700/30',
    'pt-[env(safe-area-inset-top)]',
  )} aria-label="Site header">
    <div className={cn(
      'mx-auto max-w-7xl',
      spacing.container,
    )}>
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Logo />
          <nav className="hidden ml-6 sm:flex space-x-4" aria-label="Main navigation">
            <Link 
              href="/how-it-works" 
              className="text-sm font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
              aria-label="Learn how Holiday Optimizer works"
            >
              How It Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            href="/how-it-works" 
            className="sm:hidden text-sm font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
            aria-label="Learn how Holiday Optimizer works"
          >
            How It Works
          </Link>
          <GitHubLink
            href={GITHUB_URL}
            variant="default"
            className="hidden sm:inline-flex"
            aria-label="View source code on GitHub"
          />
          <GitHubLink
            href={GITHUB_URL}
            variant="compact"
            className="sm:hidden"
            aria-label="View source code on GitHub"
          />
        </div>
      </div>
    </div>
  </header>
);

export default Header;