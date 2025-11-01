'use client';

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
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-2 sm:py-1.5 text-[11px] sm:text-sm text-violet-800 flex items-center justify-center">
        <div className="flex max-w-sm sm:max-w-none items-center gap-1.5 sm:gap-3">
          <span aria-hidden="true" className="text-base sm:text-xl leading-none">
            🚀
          </span>
          <p className="text-xs sm:text-sm font-normal sm:font-medium leading-snug sm:leading-normal text-left">
            New release: more features, fewer bugs, smarter algorithm.
          </p>
        </div>
      </div>
    </div>
  );
}
