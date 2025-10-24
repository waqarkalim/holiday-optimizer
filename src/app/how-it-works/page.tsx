'use client';

import {
  PageContent,
  PageDescription,
  PageHeader,
  PageLayout,
  PageTitle,
} from '@/shared/components/layout/PageLayout';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import {
  ArrowRight,
  Calendar,
  CalendarRange,
  Compass,
  Download,
  Flag,
  Gauge,
  Layers3,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react';
import Link from 'next/link';

type SampleDayType = 'pto' | 'weekend' | 'holiday' | 'company';

const HERO_TAGS = [
  'Turns limited PTO into longer breaks',
  'Respects every constraint you add',
  'Explains the schedule it creates',
] as const;

const PIPELINE = [
  {
    title: 'What you provide',
    icon: <Target className="h-5 w-5 text-indigo-600" />,
    bullets: [
      'Number of PTO days you want to use',
      'Country and optional state or province',
      'Company shutdowns or custom days off',
      'Preferred planning window or custom timeframe',
    ],
  },
  {
    title: 'What the engine understands',
    icon: <Layers3 className="h-5 w-5 text-teal-600" />,
    bullets: [
      'Public holidays from our location data set',
      'Weekend rules (supports non-traditional schedules)',
      'Pre-booked PTO that must be preserved',
      'Strategy preset you choose (weekend bursts, long trips, etc.)',
    ],
  },
  {
    title: 'What you get back',
    icon: <Share2 className="h-5 w-5 text-purple-600" />,
    bullets: [
      'Recommended PTO days paired with weekends and holidays',
      'Break-by-break stats so you can justify every choice',
      'Calendar-ready timeline you can export or share',
      'Clarity on how many days stay untouched for later',
    ],
  },
] as const;

const ENGINE_STEPS = [
  {
    title: 'Build a smart calendar',
    description:
      'We generate an activity map for the selected timeframe, marking weekends, public holidays, recurring company days, and PTO you already booked.',
    icon: <CalendarRange className="h-4 w-4 text-indigo-600" />,
  },
  {
    title: 'Score every possible break',
    description:
      'Prefix sums let us instantly measure how much PTO each stretch consumes versus the free days it captures, filtered by the strategy preset you chose.',
    icon: <Gauge className="h-4 w-4 text-emerald-600" />,
  },
  {
    title: 'Run the optimizer',
    description:
      'Dynamic programming explores combinations without brute-force fatigue, guaranteeing we respect spacing rules, remaining PTO, and locked-in dates.',
    icon: <Sparkles className="h-4 w-4 text-purple-600" />,
  },
  {
    title: 'Explain the plan',
    description:
      'Selected breaks are rebuilt into a readable schedule, paired with stats, legends, and optional exports so you can review or share in seconds.',
    icon: <Download className="h-4 w-4 text-blue-600" />,
  },
] as const;

const OUTPUT_SPOTLIGHT = [
  {
    title: 'Optimized schedule',
    description: 'PTO days, public holidays, weekends, and company shutdowns stitched together.',
    icon: <Calendar className="h-5 w-5 text-indigo-600" />,
  },
  {
    title: 'Decision-ready insights',
    description: 'Break length, PTO used, and free-day ratios to support approvals.',
    icon: <Compass className="h-5 w-5 text-emerald-600" />,
  },
  {
    title: 'Share-friendly artifacts',
    description: 'Export or copy structured results for teammates, family, or managers.',
    icon: <Share2 className="h-5 w-5 text-purple-600" />,
  },
] as const;

const SAMPLE_BREAK: Array<{
  day: string;
  date: string;
  type: SampleDayType;
}> = [
  { day: 'Fri', date: '19', type: 'pto' },
  { day: 'Sat', date: '20', type: 'weekend' },
  { day: 'Sun', date: '21', type: 'weekend' },
  { day: 'Mon', date: '22', type: 'holiday' },
  { day: 'Tue', date: '23', type: 'pto' },
  { day: 'Wed', date: '24', type: 'pto' },
  { day: 'Thu', date: '25', type: 'pto' },
  { day: 'Fri', date: '26', type: 'company' },
  { day: 'Sat', date: '27', type: 'weekend' },
] as const;

const SAMPLE_STATS = [
  { label: 'Stretch length', value: '9 days off', variant: 'info' as const },
  { label: 'PTO used', value: '4 days', variant: 'success' as const },
  { label: 'Free time off', value: '5 days', variant: 'neutral' as const },
] as const;

const DAY_STYLES: Record<SampleDayType, string> = {
  pto: 'border-teal-200 bg-teal-50 text-teal-700',
  weekend: 'border-slate-200 bg-slate-100 text-slate-500',
  holiday: 'border-violet-200 bg-violet-50 text-violet-700',
  company: 'border-amber-200 bg-amber-50 text-amber-700',
};

const LEGEND_LABELS: Record<SampleDayType, string> = {
  pto: 'PTO day',
  weekend: 'Weekend',
  holiday: 'Public holiday',
  company: 'Company day',
};

const SAFEGUARDS = [
  'Ignores any date in the past when planning for the current year.',
  'Allows custom start and end windows for fiscal calendars or seasonal focus.',
  'Supports non-traditional weekend patterns when you adjust weekday settings.',
  'Keeps recurring company shutdowns locked unless you explicitly remove them.',
  'Never overwrites pre-booked PTO you mark as already approved.',
] as const;

const NEXT_ACTIONS = [
  'Experiment with a different strategy preset to see how spacing rules change.',
  'Trim the planning window to a busy season and compare the new recommendations.',
  'Share the generated break list with your team to align on overlapping time off.',
] as const;

const LegendSwatch = ({ type }: { type: SampleDayType }) => (
  <span
    className={cn('h-3 w-3 rounded-sm border', DAY_STYLES[type])}
    aria-hidden="true"
  />
);

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
    'rounded-none': !isFirst && !isLast,
  });

  return (
    <div className="relative">
      <div
        className={cn(
          'flex min-w-[70px] flex-col items-center justify-center border px-3 py-2 text-center shadow-sm sm:min-w-[78px]',
          DAY_STYLES[type],
          radiusClasses
        )}
        role="listitem"
        aria-label={`${day} ${date} marked as ${LEGEND_LABELS[type]}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-current opacity-80">
          {day}
        </span>
        <span className="text-lg font-semibold leading-none text-current">{date}</span>
      </div>
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute right-[-2px] top-1/2 -translate-y-1/2 text-slate-200"
        >
          │
        </span>
      )}
    </div>
  );
};

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <PageHeader className="bg-gradient-to-b from-teal-50 to-teal-100/30">
        <PageTitle className="text-teal-900">How Holiday Optimizer Works</PageTitle>
        <PageDescription className="text-teal-700">
          A quick tour of the planning engine so you can trust the recommendations it gives you.
        </PageDescription>
      </PageHeader>

      <PageContent className="bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <section className="rounded-2xl border border-teal-100 bg-white/90 p-6 shadow-sm sm:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {HERO_TAGS.map(tag => (
                  <Badge key={tag} variant="info" className="bg-teal-50 text-teal-700">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-semibold text-teal-900 sm:text-3xl">
                One page of inputs. One instant plan.
              </h2>
              <p className="text-sm text-slate-600 sm:text-base">
                Tell us how much time off you want, where you live, and any company rules. The
                optimizer blends that with public holidays and weekends, then serves back the exact
                PTO days that unlock the longest breaks—no spreadsheets required.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                Behind the scenes
              </p>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                What happens after you press “Optimize”
              </h2>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
              {PIPELINE.map(card => (
                <Card key={card.title} className="border border-slate-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      {card.icon}
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {card.bullets.map(item => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Optimization flow
              </p>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Four steps from raw inputs to a shareable plan
              </h2>
              <p className="text-sm text-slate-600 sm:text-base">
                Each phase is deterministic, so you can repeat the process with new assumptions
                knowing exactly what will change.
              </p>
            </header>

            <ol className="mt-6 space-y-5">
              {ENGINE_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4 shadow-sm sm:gap-5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900">
                      {step.icon}
                      <h3 className="text-base font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-6 md:grid-cols-[1.15fr,0.85fr]">
            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Sample break preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <div
                    className="flex min-w-max gap-[2px] rounded-xl border border-slate-100 bg-slate-50/50 p-[3px]"
                    role="list"
                    aria-label="Example optimized break showing PTO, holiday, weekend, and company days"
                  >
                    {SAMPLE_BREAK.map((day, index) => (
                      <CalendarCell
                        key={`${day.day}-${day.date}`}
                        {...day}
                        isFirst={index === 0}
                        isLast={index === SAMPLE_BREAK.length - 1}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  {Object.entries(LEGEND_LABELS).map(([type, label]) => (
                    <span key={type} className="flex items-center gap-1.5">
                      <LegendSwatch type={type as SampleDayType} />
                      {label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {SAMPLE_STATS.map(stat => (
                    <Badge key={stat.label} variant={stat.variant} className="shadow-sm">
                      {stat.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Layers3 className="h-4 w-4 text-emerald-600" />
                  What the plan tells you
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <p>
                  Every recommended break ships with context so you can sanity-check the reasoning:
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                    The PTO days you need to request and the free days bundled with them.
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                    How many days you still have available after this break.
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                    Which holidays or weekends make the recommendation efficient.
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                    Notes on spacing so you can decide whether to stack or spread trips.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Outputs you can act on
              </p>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                The optimizer explains the “why” as clearly as the “what”
              </h2>
            </header>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {OUTPUT_SPOTLIGHT.map(item => (
                <Card key={item.title} className="border border-slate-100 bg-slate-50/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      {item.icon}
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  Guardrails always on
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  {SAFEGUARDS.map(item => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Timer className="h-4 w-4 text-indigo-600" />
                  Try this next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>
                  Once you understand how the optimizer thinks, experiment with different
                  constraints to see how the plan adapts:
                </p>
                <ul className="space-y-2">
                  {NEXT_ACTIONS.map(item => (
                    <li key={item} className="flex gap-2">
                      <Flag className="mt-0.5 h-3.5 w-3.5 text-indigo-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  Ready to build your own schedule?
                </h2>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  The optimizer’s results are instant and repeatable. Adjust the inputs, review the
                  reasoning, and lock in the stretches that fit your plans.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 hover:shadow-md"
              >
                Launch the optimizer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
}

