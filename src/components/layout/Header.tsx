import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn, spacing } from '@/lib/utils';
import { GitHubLink } from '@/components/ui/github-link';
import { GITHUB_URL } from '@/constants';

const Header = () => (
  <header className={cn(
    'sticky top-0 z-40 w-full',
    'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
    'border-b border-gray-200/60 dark:border-gray-700/30',
  )}>
    <div className={cn(
      'mx-auto max-w-7xl',
      spacing.container,
    )}>
      <div className="flex h-14 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
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