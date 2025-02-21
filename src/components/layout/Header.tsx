import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => (
  <header
    className="bg-white/90 dark:bg-gray-800/90 border-b border-gray-200/60 dark:border-gray-700/30">
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="flex h-14 items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          <a
            href="https://github.com/waqarkalim/holiday-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
              bg-gray-100/80 text-gray-700 hover:bg-gray-200/80
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
            href="https://github.com/waqarkalim/holiday-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden inline-flex items-center justify-center p-1.5 rounded-lg text-gray-700 hover:bg-gray-200/80
              dark:text-gray-300 dark:hover:bg-gray-700/60 transition-colors"
            aria-label="View on GitHub"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </header>
);

export default Header;