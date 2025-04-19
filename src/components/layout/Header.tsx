import { Logo } from '@/components/Logo';
import { cn, spacing } from '@/lib/utils';
import { GitHubLink } from '@/components/ui/github-link';
import { GITHUB_URL } from '@/constants';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => (
  <header className={cn(
    'sticky top-0 z-40 w-full',
    'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
    'border-b border-gray-200/60 dark:border-gray-700/30',
    'pt-[env(safe-area-inset-top)]',
  )}>
    <div className={cn(
      'mx-auto max-w-7xl',
      spacing.container,
    )}>
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Logo />
          <nav className="hidden ml-6 sm:flex space-x-4">
            <Link 
              href="/how-it-works" 
              className="text-sm font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/holidays" 
              className="text-sm font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
            >
              Public Holidays
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="sm:hidden flex space-x-4">
            <Link 
              href="/how-it-works" 
              className="text-sm font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/holidays" 
              className="text-sm font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
            >
              Public Holidays
            </Link>
          </div>
          <ThemeToggle />
          <GitHubLink
            href={GITHUB_URL}
            variant="default"
            className="hidden sm:inline-flex"
          />
          <GitHubLink
            href={GITHUB_URL}
            variant="compact"
            className="sm:hidden"
          />
        </div>
      </div>
    </div>
  </header>
);

export default Header;
