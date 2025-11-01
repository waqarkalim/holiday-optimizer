'use client';

import { ArrowUpRight, Share2 } from 'lucide-react';
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
      className="border border-violet-200/60 bg-white/95 ring-1 ring-violet-100/60"
      icon={<Share2 className="h-4 w-4 text-violet-600" />}
      iconWrapperClassName="rounded-lg bg-violet-50 p-1.5 text-violet-600"
    >
      <section className="space-y-4 rounded-xl border border-violet-100 bg-white/95 p-4 shadow-sm sm:bg-gradient-to-br sm:from-violet-50/90 sm:to-violet-100/40 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-violet-900">Share in seconds</h3>
            <p className="text-xs text-violet-800/80">
              Share the plan instantly—email and socials are ready to go.
            </p>
          </div>
          <a
            href="https://x.com/waqar_kalim"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-1 sm:w-auto"
            aria-label="Follow Waqar Bin Kalim on X (Twitter)"
          >
            <svg
              viewBox="0 0 1200 1227"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 fill-current"
              aria-hidden="true"
            >
              <path d="M714.163 519.284 1160.89 0H1057.18L667.137 452.013 357.328 0H0l468.492 684.806L0 1226.37h103.728l412.7-472.085 327.46 472.085H1200L714.137 519.284h.026ZM561.335 689.914l-47.85-68.34L141.696 79.694h162.494l307.469 440.695 47.85 68.34 389.046 559.676H885.061L561.335 689.94v-.026Z" />
            </svg>
            <span>Follow @waqar_kalim</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SocialShareButtons
            variant="primary"
            title={getShareTitle()}
            description={getShareDescription()}
            className="w-full sm:max-w-sm"
          />
          <SocialShareButtons
            variant="secondary"
            title={getShareTitle()}
            description={getShareDescription()}
            className="gap-1.5 sm:justify-end"
          />
        </div>
      </section>
    </SectionCard>
  );
};

export default ShareSection;
