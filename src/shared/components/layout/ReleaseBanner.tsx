'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ReleaseBannerProps {
  show: boolean;
}

const TOOL_PAGE_PATH = '/';

export function ReleaseBanner({ show }: ReleaseBannerProps) {
  const pathname = usePathname();

  if (!show) {
    return null;
  }

  const isToolPage = pathname === TOOL_PAGE_PATH || pathname === '';

  if (!isToolPage) {
    return null;
  }

  return (
    <div className="bg-emerald-50 border-b border-emerald-200/70">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-2 text-sm text-emerald-900 flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
        <span className="flex items-center gap-2 font-medium">
          <span aria-hidden="true">🚀</span>
          Holiday Optimizer now ships new features, fewer bugs, and an improved optimization algorithm.
        </span>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-900 transition-colors"
          aria-label="Learn what's new in Holiday Optimizer"
        >
          See what&apos;s new
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
