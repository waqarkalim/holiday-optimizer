'use client';

import { Share2 } from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/section-card';
import SocialShareButtons from '@/features/optimizer/components/SocialShareButtons';
import { OptimizationStats } from '@/types';

interface ShareSectionProps {
  stats: OptimizationStats;
  selectedYear: number;
}

export const ShareSection = ({ stats, selectedYear }: ShareSectionProps) => {
  // Create a more personalized share message if stats are available
  const getShareTitle = () => {
    return `I optimized my ${stats.totalPTODays} PTO days to enjoy ${stats.totalDaysOff} days off in ${selectedYear}.`;
  };

  const getShareDescription = () => {
    return `This tool helped me strategically plan my PTO to create longer breaks by aligning with weekends and holidays. You might find it useful too.`;
  };

  return (
    <SectionCard
      title="Share This Tool"
      subtitle="Help others optimize their time off"
      icon={<Share2 className="h-4 w-4 text-purple-600" />}
    >
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-slate-600">
          Loved your plan? Send it to teammates or friends so they can unlock smarter breaks too.
        </p>

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Share in seconds</h3>
            <SocialShareButtons
              variant="primary"
              title={getShareTitle()}
              description={getShareDescription()}
            />
          </section>

          <section className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Post it to social
              </p>
              <p className="text-xs text-slate-500">
                Drop a quick note on where to find your next stretch of time off.
              </p>
            </div>
            <SocialShareButtons
              variant="secondary"
              title={getShareTitle()}
              description={getShareDescription()}
              className="mt-3 sm:mt-0"
            />
          </section>

          <section className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              Enjoy tools like this? Follow for more indie builds and experiments.
            </p>
            <a
              href="https://x.com/waqar_kalim"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus-visible:ring-offset-white"
              aria-label="Follow Waqar Bin Kalim on X (Twitter)"
            >
              <svg
                viewBox="0 0 1200 1227"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M714.163 519.284 1160.89 0H1057.18L667.137 452.013 357.328 0H0l468.492 684.806L0 1226.37h103.728l412.7-472.085 327.46 472.085H1200L714.137 519.284h.026ZM561.335 689.914l-47.85-68.34L141.696 79.694h162.494l307.469 440.695 47.85 68.34 389.046 559.676H885.061L561.335 689.94v-.026Z" />
              </svg>
              <span>Follow @waqar_kalim</span>
            </a>
          </section>
        </div>
      </div>
    </SectionCard>
  );
};

export default ShareSection;
