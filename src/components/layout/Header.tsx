import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn, spacing } from '@/lib/utils';
import { GitHubLink } from '@/components/ui/github-link';

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
            href="https://github.com/waqarkalim/holiday-optimizer"
            variant="default"
            className="hidden sm:inline-flex hover:scale-[1.02] transition-transform"
          />
          <GitHubLink
            href="https://github.com/waqarkalim/holiday-optimizer"
            variant="compact"
            className="sm:hidden hover:scale-[1.02] transition-transform"
          />
        </div>
      </div>
    </div>
  </header>
);

export default Header;