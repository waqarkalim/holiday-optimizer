'use client';

import { Share2 } from 'lucide-react';
import { SectionCard } from '@/components/ui/section-card';
import SocialShareButtons from '@/components/SocialShareButtons';
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
      icon={<Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          If you found this tool useful, consider sharing it with others who might benefit. Many people aren&apos;t
          aware of how to optimize their time off to get more vacation days without using additional PTO.
        </p>
        <SocialShareButtons
          showLabels={true}
          title={getShareTitle()}
          description={getShareDescription()}
          className="pt-1"
        />
      </div>
    </SectionCard>
  );
};

export default ShareSection;