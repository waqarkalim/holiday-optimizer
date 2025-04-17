'use client';

import { Share2 } from 'lucide-react';
import { SectionCard } from '@/components/ui/section-card';
import SocialShareButtons from '@/components/SocialShareButtons';
import { OptimizationStats } from '@/types';

interface ShareSectionProps {
  stats?: OptimizationStats;
  selectedYear?: number;
}

export const ShareSection = ({ stats, selectedYear }: ShareSectionProps) => {
  // Create a more personalized share message if stats are available
  const getShareTitle = () => {
    if (stats) {
      return `I optimized my time off: ${stats.totalDaysOff} days using ${stats.totalPTODays} PTO days in ${selectedYear || new Date().getFullYear()}`;
    }
    return 'A helpful tool for optimizing vacation days with strategic PTO planning';
  };

  const getShareDescription = () => {
    if (stats) {
      const extraDays = stats.totalDaysOff - stats.totalPTODays;
      return `This tool helped me plan my PTO to get ${extraDays} additional days off. You might find it useful too.`;
    }
    return 'This free tool helps you strategically plan your PTO to maximize your time off.';
  };

  return (
    <SectionCard
      title="Share This Tool"
      subtitle="Help others optimize their time off"
      icon={<Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          If you found this tool useful, consider sharing it with others who might benefit. Many people aren&apos;t aware of how to optimize their time off to get more vacation days without using additional PTO.
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
