'use client';

import {
  PageContent,
  PageDescription,
  PageHeader,
  PageLayout,
  PageTitle,
} from '@/shared/components/layout/PageLayout';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import {
  ArrowRight,
  Binary,
  Blocks,
  BrainCircuit,
  Calendar,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

type SampleDayType = 'pto' | 'weekend' | 'holiday' | 'company';

const DAY_STYLES: Record<SampleDayType, string> = {
  pto: 'border-teal-500 bg-teal-100 text-teal-900',
  weekend: 'border-slate-300 bg-slate-100/60 text-slate-600',
  holiday: 'border-violet-500 bg-violet-100 text-violet-900',
  company: 'border-amber-500 bg-amber-100 text-amber-900',
};

const LEGEND_ITEMS: Array<{ type: SampleDayType; label: string }> = [
  { type: 'pto', label: 'Your PTO' },
  { type: 'weekend', label: 'Weekend' },
  { type: 'holiday', label: 'Holiday' },
  { type: 'company', label: 'Company off' },
];

const SAMPLE_BREAK: Array<{
  day: string;
  date: string;
  type: SampleDayType;
}> = [
  { day: 'Sat', date: '20', type: 'weekend' },
  { day: 'Sun', date: '21', type: 'weekend' },
  { day: 'Mon', date: '22', type: 'holiday' },
  { day: 'Tue', date: '23', type: 'pto' },
  { day: 'Wed', date: '24', type: 'pto' },
  { day: 'Thu', date: '25', type: 'pto' },
  { day: 'Fri', date: '26', type: 'company' },
  { day: 'Sat', date: '27', type: 'weekend' },
  { day: 'Sun', date: '28', type: 'weekend' },
] as const;

const ALGORITHM_STEPS = [
  {
    number: '01',
    title: 'Parse Your Inputs',
    description:
      'We build a calendar for your chosen timeframe, marking every weekend, public holiday, company shutdown, and pre-booked PTO day.',
    icon: <Calendar className="h-5 w-5" />,
    color: 'from-teal-500 to-teal-600',
    bgGradient: 'from-teal-50 to-teal-100/50',
  },
  {
    number: '02',
    title: 'Calculate PTO Costs',
    description:
      'Using prefix sums, we instantly compute how many PTO days are needed for any date range, accounting for all your free days.',
    icon: <Binary className="h-5 w-5" />,
    color: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-50 to-indigo-100/50',
  },
  {
    number: '03',
    title: 'Dynamic Programming Magic',
    description:
      'Our algorithm explores every possible break combination using memoization, respecting your strategy spacing and length rules.',
    icon: <BrainCircuit className="h-5 w-5" />,
    color: 'from-violet-500 to-violet-600',
    bgGradient: 'from-violet-50 to-violet-100/50',
  },
  {
    number: '04',
    title: 'Return Your Plan',
    description:
      'We reconstruct the selected breaks with full transparency—showing exactly which PTO days to book and how they maximize your consecutive time off.',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
  },
] as const;

const STRATEGIES = [
  {
    name: 'Balanced',
    spacing: '21 days',
    lengths: '3-15 days',
    description: 'Mix of short and long breaks distributed throughout the year',
  },
  {
    name: 'Long Weekends',
    spacing: '7 days',
    lengths: '3-4 days',
    description: 'Frequent 3-4 day escapes near weekends',
  },
  {
    name: 'Mini Breaks',
    spacing: '14 days',
    lengths: '5-6 days',
    description: 'Week-long trips every couple weeks',
  },
  {
    name: 'Week Long',
    spacing: '21 days',
    lengths: '7-9 days',
    description: 'Longer vacations spaced out',
  },
  {
    name: 'Extended',
    spacing: '30 days',
    lengths: '10-15 days',
    description: 'Maximum length breaks, infrequent but epic',
  },
] as const;

const KEY_FEATURES = [
  'Respects all constraints (pre-booked PTO, company shutdowns, custom weekends)',
  'Uses dynamic programming to find the best arrangement for your preferences',
  'Instant results—no waiting, no complicated spreadsheets',
  'Fully transparent—shows exactly why each break was chosen',
] as const;

const CalendarCell = ({
  day,
  date,
  type,
  isFirst,
  isLast,
}: {
  day: string;
  date: string;
  type: SampleDayType;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const radiusClasses = cn({
    'rounded-l-xl': isFirst,
    'rounded-r-xl': isLast,
  });

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border-2 px-3.5 py-3 min-w-[68px] sm:min-w-[76px] transition-transform hover:scale-105',
        DAY_STYLES[type],
        radiusClasses
      )}
    >
      <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-60">{day}</span>
      <span className="text-2xl font-extrabold leading-none mt-1">{date}</span>
    </div>
  );
};

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <PageHeader className="bg-gradient-to-br from-teal-50 via-indigo-50/30 to-violet-50/20">
        <PageTitle>How It Works</PageTitle>
        <PageDescription>
          A smart algorithm that turns your limited PTO into maximum time off
        </PageDescription>
      </PageHeader>

      <PageContent className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-4xl space-y-16">
          {/* Hero Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-teal-600" />
              <h2 className="text-2xl font-bold text-slate-900">The Core Idea</h2>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              Holiday Optimizer uses{' '}
              <span className="font-semibold text-indigo-700">dynamic programming</span> to find smart
              ways to distribute your PTO days across the year. By cleverly combining your PTO with
              weekends, holidays, and company shutdowns, it creates longer breaks while using fewer
              vacation days.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">
                <Check className="h-3 w-3 mr-1" />
                Maximizes consecutive days
              </Badge>
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-800">
                <Check className="h-3 w-3 mr-1" />
                Respects all constraints
              </Badge>
              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-800">
                <Check className="h-3 w-3 mr-1" />
                Instant results
              </Badge>
            </div>
          </section>

          {/* Example Break */}
          <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-white via-teal-50/40 to-teal-50/60 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-md">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Example: 9-Day Break</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Using only <span className="font-bold text-teal-700">3 PTO days</span>, you get{' '}
                  <span className="font-bold text-teal-700">9 consecutive days off</span>
                </p>
              </div>

              <div className="overflow-x-auto py-2">
                <div className="flex gap-1 w-fit mx-auto drop-shadow-sm" role="list">
                  {SAMPLE_BREAK.map((item, index) => (
                    <CalendarCell
                      key={`${item.day}-${item.date}`}
                      {...item}
                      isFirst={index === 0}
                      isLast={index === SAMPLE_BREAK.length - 1}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center text-xs font-semibold">
                {LEGEND_ITEMS.map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn('h-3.5 w-3.5 rounded border-2 shadow-sm', DAY_STYLES[type])} />
                    <span className="text-slate-600">{label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-teal-200/60 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-br from-teal-600 to-teal-700 bg-clip-text text-transparent">
                    9
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Total days off</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-br from-teal-600 to-teal-700 bg-clip-text text-transparent">
                    3
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">PTO used</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-br from-teal-600 to-teal-700 bg-clip-text text-transparent">
                    6
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Free days</div>
                </div>
              </div>
            </div>
          </section>

          {/* Algorithm Steps */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Blocks className="h-5 w-5 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">The Algorithm</h2>
            </div>
            <div className="space-y-4">
              {ALGORITHM_STEPS.map((step) => (
                <div
                  key={step.number}
                  className={cn(
                    'rounded-xl border border-slate-200 bg-gradient-to-r p-5 shadow-sm',
                    step.bgGradient
                  )}
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className={cn(
                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md',
                        step.color
                      )}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">{step.number}</span>
                        <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strategy Presets */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-600" />
              <h2 className="text-2xl font-bold text-slate-900">Strategy Presets</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Each strategy has different rules for break spacing and length. The algorithm enforces
              these constraints while finding arrangements that maximize your consecutive time off.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {STRATEGIES.map(strategy => (
                <div
                  key={strategy.name}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900">{strategy.name}</h3>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spacing:</span>
                      <span className="font-medium">{strategy.spacing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Length:</span>
                      <span className="font-medium">{strategy.lengths}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{strategy.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Features */}
          <section className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Why This Approach Works</h2>
            <ul className="space-y-3">
              {KEY_FEATURES.map((feature, index) => (
                <li key={index} className="flex gap-3 text-slate-700">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to optimize your year?</h2>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Put the algorithm to work on your schedule. Enter your PTO days, select your location,
              and get your personalized plan in seconds.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-teal-700 hover:to-indigo-700 transition-all"
            >
              Launch Optimizer
              <ArrowRight className="h-5 w-5" />
            </Link>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
}

