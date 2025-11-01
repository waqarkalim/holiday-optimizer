'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TOOL_PAGE_PATH = '/';

export function ReleaseBanner() {
  const pathname = usePathname();

  // Only show on the main tool page
  const isToolPage = pathname === TOOL_PAGE_PATH || pathname === '';

  if (!isToolPage) {
    return null;
  }

  return (
    <div className="bg-violet-50 border-b border-violet-200/70">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-2 text-sm text-violet-900 flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
        <span className="flex items-center gap-2 font-medium">
          <span aria-hidden="true">🚀</span>
          Holiday Optimizer now ships new features, fewer bugs, and an improved optimization algorithm.
        </span>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1 text-sm font-medium text-violet-800 hover:text-violet-900 transition-colors"
          aria-label="Learn what's new in Holiday Optimizer"
        >
          See what&apos;s new
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
