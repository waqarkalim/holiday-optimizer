'use client';

import React from 'react';
import { Brain, Calendar, CalendarRange, Info, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/section-card';

interface OptimizationExplainerProps {
  introText?: string;
}

const CORE_FEATURES = [
  {
    title: 'Adaptive calendar window',
    description:
      'Builds a calendar around your selected year and timeframe, trims past dates automatically, and honours any custom start or end boundaries.',
    icon: <CalendarRange className="h-4 w-4 text-indigo-600" />,
  },
  {
    title: 'Strategy-aware spacing',
    description:
      'Each preset encodes preferred break lengths and recovery buffers so long vacations, mini breaks, and long weekends stay in their lanes.',
    icon: <Timer className="h-4 w-4 text-emerald-600" />,
  },
  {
    title: 'Conflict smart filters',
    description:
      'Pre-booked PTO, company shutdowns, and holidays are treated as hard constraints so suggested breaks never collide with what you already locked in.',
    icon: <ShieldCheck className="h-4 w-4 text-teal-600" />,
  },
  {
    title: 'Fast scoring engine',
    description:
      'Prefix sums and memoization evaluate thousands of combinations in milliseconds, updating results the moment you tweak an input.',
    icon: <Sparkles className="h-4 w-4 text-purple-600" />,
  },
];

const PROCESS_STEPS = [
  {
    title: 'Assemble your working calendar',
    description:
      'We stitch together every day in the window, marking weekends, public holidays, company shutdowns, and pre-booked PTO. Weekend rules adapt automatically when you change them.',
  },
  {
    title: 'Score every possible break',
    description:
      'Starting at each date, the engine considers every stretch that fits the chosen strategy. Prefix sums make it trivial to see how much PTO the stretch consumes versus how much fixed time off it absorbs.',
  },
  {
    title: 'Optimize with dynamic programming',
    description:
      'A memoized search tracks your remaining PTO and enforces spacing between breaks. The best combination maximizes consecutive days off without exceeding your allotment.',
  },
  {
    title: 'Reconstruct the itinerary',
    description:
      'The chosen breaks are replayed to mark exact PTO days, holidays, and weekends. We then surface stats, break cards, and the calendar view you see in the results panel.',
  },
];

const STRATEGY_HIGHLIGHTS = [
  {
    name: 'Balanced',
    detail:
      'Cycles through a blend of long weekends and week-long getaways, ensuring PTO is distributed across the year.',
  },
  {
    name: 'Long Weekends',
    detail:
      'Targets 3–4 day runs with tight spacing so you can reset often without committing large PTO blocks.',
  },
  {
    name: 'Mini Breaks',
    detail:
      'Loves 5–6 day stretches, useful when you want meaningful time away but still keep PTO powder dry.',
  },
  {
    name: 'Week Long Breaks',
    detail:
      'Prefers 7–9 day spans with wider buffers to avoid back-to-back drains on PTO balances.',
  },
  {
    name: 'Extended Vacations',
    detail:
      'Searches for 10–15 day escapes and leaves generous recovery time before the next suggestion.',
  },
];

const GUARDRAILS = [
  'Automatic skip of dates that already passed when you are planning the current year.',
  'Support for custom date windows so you can focus on a season or fiscal period.',
  'Weekend detection that adapts for non-traditional work weeks.',
  'Company shutdowns that recur by weekday stay marked across the range.',
];

export const OptimizationExplainer = ({ introText }: OptimizationExplainerProps) => {
  return (
    <>
      <SectionCard
        className="shadow-md"
        title="Optimizer At A Glance"
        subtitle="Key capabilities the planner relies on every time you run it."
        icon={<Sparkles className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />}
      >
        <div className="space-y-6 pt-3 sm:space-y-8 sm:pt-4">
          <p className="text-sm leading-relaxed text-gray-700 sm:text-base tracking-normal">
            {introText ||
              'Holiday Optimizer centres everything around a dynamic programming engine. It adapts the planning window, respects your constraints, and recomputes instantly while you experiment.'}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {CORE_FEATURES.map(feature => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <header className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </header>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        className="shadow-md"
        title="How The Algorithm Plans Your Time Off"
        subtitle="A four-step process transforms PTO inputs into a shareable schedule."
        icon={<Brain className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />}
      >
        <div className="space-y-6 pt-3 sm:space-y-8 sm:pt-4">
          <ol className="space-y-4">
            {PROCESS_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-800">
            The dynamic programming layer means we no longer brute-force every combination. Instead,
            we remember intermediate results so changing a single input—like PTO days or a weekend
            rule—recomputes the plan almost instantly.
          </div>
        </div>
      </SectionCard>

      <SectionCard
        className="shadow-md"
        title="Strategy Presets & Guardrails"
        subtitle="Pick the flavour that matches how you like to recharge."
        icon={<Calendar className="h-4 w-4 text-emerald-600" />}
      >
        <div className="space-y-6 pt-3 sm:space-y-8 sm:pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {STRATEGY_HIGHLIGHTS.map(strategy => (
              <div
                key={strategy.name}
                className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 sm:p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-emerald-900 sm:text-base">
                  {strategy.name}
                </h3>
                <p className="mt-2 text-sm text-emerald-700 leading-relaxed">{strategy.detail}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Built-in guardrails
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {GUARDRAILS.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">
                <Info className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-blue-700 leading-relaxed">
                  <span className="font-medium">Remember:</span> These plans are recommendations
                  generated from the inputs you provide. Cross-check them with your manager or HR
                  policies before locking anything in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
};
