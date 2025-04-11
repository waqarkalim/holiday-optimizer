// 'use client';

import Link from 'next/link';
import { PageContent, PageDescription, PageHeader, PageLayout, PageTitle } from '@/components/layout/PageLayout';
import { Home, HelpCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  return (
    <PageLayout>
      <PageHeader className="bg-gradient-to-b from-purple-50 to-indigo-100/30 dark:from-purple-950 dark:to-indigo-900/20">
        <PageTitle className="text-indigo-800 dark:text-indigo-200">Oops! Page Not Found</PageTitle>
        <PageDescription className="text-indigo-600 dark:text-indigo-400">
          Looks like you've wandered off the holiday map
        </PageDescription>
      </PageHeader>

      <PageContent className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center py-12 px-4">
          <section aria-labelledby="error-message" className="space-y-8">
            <div className="relative mx-auto w-64 h-64 mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
                  404
                </div>
              </div>
              <div className="absolute w-full h-full opacity-10 animate-[spin_20s_linear_infinite]">
                <Image 
                  src="/compass-rose.svg" 
                  alt="" 
                  width={256} 
                  height={256}
                  className="object-contain"
                />
              </div>
            </div>
            
            <h2 id="error-message" className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
              This destination isn't on our holiday map
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
              Even the best explorers get lost sometimes. Let's get you back on track.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mt-8">
              <Link
                href="/"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-lg font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                <span>Go Home</span>
              </Link>
              
              <Link
                href="/how-it-works"
                className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
                <span>How It Works</span>
              </Link>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                Want to let us know about a broken link? <a href="https://github.com/waqarkalim/holiday-optimizer/issues" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  Report an issue <ExternalLink className="inline h-3 w-3" />
                </a>
              </p>
            </div>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
} 