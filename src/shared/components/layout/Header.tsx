'use client';

import { Logo } from '@/shared/components/Logo';
import { cn, spacing } from '@/shared/lib/utils';
import { GitHubLink } from '@/shared/components/ui/github-link';
import { GITHUB_URL } from '@/constants';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'bg-white/90 backdrop-blur-sm',
        'border-b border-gray-200/60',
        'pt-[env(safe-area-inset-top)]'
      )}
    >
      <div className={cn('mx-auto max-w-7xl', spacing.container)}>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Logo hideTaglineOnMobile={true} />
            <nav className="hidden ml-6 md:flex space-x-4">
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/holidays"
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                Public Holidays
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <GitHubLink href={GITHUB_URL} variant="default" className="hidden md:inline-flex" />
            <GitHubLink
              href={GITHUB_URL}
              variant="compact"
              className="hidden sm:inline-flex md:hidden"
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-gray-600 hover:text-teal-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-2 px-2 border-t border-gray-200 bg-white transition-all">
            <nav className="flex flex-col space-y-3 py-2">
              <Link
                href="/how-it-works"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/holidays"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Public Holidays
              </Link>
              <div className="py-1 px-3">
                <GitHubLink href={GITHUB_URL} variant="default" className="w-full" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
