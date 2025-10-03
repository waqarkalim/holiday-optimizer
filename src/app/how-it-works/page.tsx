'use client';

import { OptimizationExplainer } from '@/features/optimizer/components/OptimizationExplainer';
import { PageContent, PageDescription, PageHeader, PageLayout, PageTitle } from '@/shared/components/layout/PageLayout';
import { BarChart, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <PageHeader className="bg-gradient-to-b from-teal-50 to-teal-100/30 dark:from-teal-950 dark:to-teal-900/20">
        <PageTitle className="text-teal-800 dark:text-teal-200">How Holiday Optimizer Works</PageTitle>
        <PageDescription className="text-teal-600 dark:text-teal-400">
          Learn how our algorithm helps you maximize your time off
        </PageDescription>
      </PageHeader>

      <PageContent className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto space-y-10">
          <OptimizationExplainer
            introText="Holiday Optimizer uses advanced planning strategies to help you get the most out of your limited PTO days. By strategically placing your days off around weekends, public holidays, and company days off, you can significantly increase your total time away from work."
            factorsText="Our algorithm analyzes thousands of possible combinations to find the optimal schedule based on your:"
            factors={[
              {
                icon: <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
                text: 'Available PTO days',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
              },
              {
                icon: <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />,
                text: 'Public holidays in your region',
                bgColor: 'bg-violet-100 dark:bg-violet-900/30',
              },
              {
                icon: <BarChart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
                text: 'Company-specific days off',
                bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
              },
              {
                icon: <Settings className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
                text: 'Preferred optimization strategy (long weekends, extended vacations, etc.)',
                bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
              },
            ]}
          />

          <div className="flex justify-center mb-6">
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-md font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Try the Optimizer
            </Link>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
} 
